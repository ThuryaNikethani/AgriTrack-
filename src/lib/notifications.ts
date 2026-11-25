import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isPushConfigured, sendPush } from "@/lib/push";
import { getTiming } from "@/lib/harvest";
import { getStockStatus } from "@/lib/stock";
import { formatDate, formatNumber } from "@/lib/utils";

type Candidate = {
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  dedupeKey: string;
};

/** Builds the list of alerts that should currently be active. */
async function buildCandidates(): Promise<Candidate[]> {
  const [fertilizers, items, pendingHarvests] = await Promise.all([
    prisma.fertilizer.findMany(),
    prisma.inventoryItem.findMany(),
    prisma.harvest.findMany({
      where: { actualDate: null },
      include: { crop: { select: { id: true, name: true, bedLocation: true, status: true } } },
    }),
  ]);

  const candidates: Candidate[] = [];

  for (const f of fertilizers) {
    const status = getStockStatus(f.currentStock, f.reorderLevel);
    if (status === "OK") continue;
    candidates.push({
      type: status === "OUT" ? "OUT_OF_STOCK" : "LOW_STOCK",
      title: status === "OUT" ? `${f.name} is out of stock` : `${f.name} is running low`,
      message:
        status === "OUT"
          ? `No ${f.name} left. Please purchase more fertilizer.`
          : `Only ${formatNumber(f.currentStock)} ${f.unit} left (reorder level ${formatNumber(f.reorderLevel)} ${f.unit}). Please reorder.`,
      link: `/fertilizers/${f.id}`,
      dedupeKey: `${status}:fertilizer:${f.id}`,
    });
  }

  for (const i of items) {
    const status = getStockStatus(i.quantity, i.reorderLevel);
    if (status === "OK") continue;
    candidates.push({
      type: status === "OUT" ? "OUT_OF_STOCK" : "LOW_STOCK",
      title: status === "OUT" ? `${i.name} is out of stock` : `${i.name} is running low`,
      message:
        status === "OUT"
          ? `No ${i.name} left in inventory.`
          : `Only ${formatNumber(i.quantity)} ${i.unit} left (reorder level ${formatNumber(i.reorderLevel)} ${i.unit}).`,
      link: "/inventory",
      dedupeKey: `${status}:item:${i.id}`,
    });
  }

  for (const h of pendingHarvests) {
    if (h.crop.status === "COMPLETED" || h.crop.status === "FAILED") continue;
    const { status, days } = getTiming(h);
    const where = h.crop.bedLocation ? ` (${h.crop.bedLocation})` : "";
    if (status === "OVERDUE") {
      candidates.push({
        type: "HARVEST_OVERDUE",
        title: `${h.crop.name} harvest is overdue`,
        message: `${h.crop.name}${where} was scheduled for ${formatDate(h.scheduledDate)} - ${days} day(s) late.`,
        link: `/harvests/${h.id}/record`,
        dedupeKey: `HARVEST_OVERDUE:${h.id}`,
      });
    } else if (status === "DUE_SOON") {
      candidates.push({
        type: "HARVEST_DUE",
        title: days === 0 ? `${h.crop.name} harvest is due today` : `${h.crop.name} harvest due in ${days} day(s)`,
        message: `${h.crop.name}${where} is scheduled for harvest on ${formatDate(h.scheduledDate)}.`,
        link: `/harvests/${h.id}/record`,
        dedupeKey: `HARVEST_DUE:${h.id}`,
      });
    }
  }

  return candidates;
}

/**
 * Creates notifications for new alert conditions and removes the ones that
 * are no longer true (e.g. stock was refilled or the harvest was recorded).
 */
export async function syncNotifications() {
  const candidates = await buildCandidates();
  const keys = candidates.map((c) => c.dedupeKey);

  await prisma.notification.deleteMany({ where: { dedupeKey: { notIn: keys } } });

  const existing = await prisma.notification.findMany({
    where: { dedupeKey: { in: keys } },
    select: { dedupeKey: true },
  });
  const existingKeys = new Set(existing.map((e) => e.dedupeKey));
  const fresh = candidates.filter((c) => !existingKeys.has(c.dedupeKey));

  if (fresh.length > 0) {
    await prisma.notification.createMany({ data: fresh, skipDuplicates: true });
  }
  const pushed = await pushNewNotifications();
  return { active: candidates.length, created: fresh.length, pushed };
}

/** Max alerts sent as separate phone notifications; any more are grouped into one summary. */
const MAX_INDIVIDUAL_PUSHES = 3;

/**
 * Sends alerts that have not been pushed yet to every registered phone.
 * Each alert is claimed (pushed = true) before sending, so two syncs running
 * at the same time never send the same alert twice.
 */
async function pushNewNotifications(): Promise<number> {
  const pending = await prisma.notification.findMany({
    where: { pushed: false },
    orderBy: { createdAt: "asc" },
  });
  const claimed: typeof pending = [];
  for (const n of pending) {
    const { count } = await prisma.notification.updateMany({ where: { id: n.id, pushed: false }, data: { pushed: true } });
    if (count === 1) claimed.push(n);
  }
  if (claimed.length === 0 || !isPushConfigured()) return 0;

  if (claimed.length <= MAX_INDIVIDUAL_PUSHES) {
    for (const n of claimed) {
      await sendPush({ title: n.title, body: n.message, url: n.link ?? "/notifications", tag: n.dedupeKey });
    }
  } else {
    const titles = claimed.slice(0, 3).map((n) => n.title);
    await sendPush({
      title: `AgriTrack: ${claimed.length} new alerts`,
      body: `${titles.join(" · ")}${claimed.length > 3 ? ` and ${claimed.length - 3} more` : ""}`,
      url: "/notifications",
      tag: "agritrack-summary",
    });
  }
  return claimed.length;
}

/** Re-checks alerts right after stock changes, so low-stock pushes go out immediately. */
export async function refreshAlerts() {
  try {
    await syncNotifications();
  } catch (error) {
    console.error("Notification sync failed", error);
  }
}

let lastSync = 0;

/** Throttled sync used while rendering pages (at most once per minute per server instance). */
export async function syncNotificationsThrottled() {
  if (Date.now() - lastSync < 60_000) return;
  lastSync = Date.now();
  try {
    await syncNotifications();
  } catch (error) {
    console.error("Notification sync failed", error);
  }
}
