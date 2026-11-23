import { differenceInCalendarDays } from "date-fns";
import type { BadgeVariant } from "@/components/ui/badge";

/** Harvest rules - adjust to match the polytunnel's standards. */
export const HARVEST_RULES = {
  /** Days before the scheduled date when a harvest counts as "due soon". */
  dueSoonDays: 3,
  /** Days after the scheduled date that are still accepted as on time. */
  graceDays: 0,
  /** Allowed deviation from the expected quantity (0.1 = ±10%). */
  quantityTolerance: 0.1,
};

export type HarvestLike = {
  scheduledDate: Date;
  expectedQuantityKg: number;
  actualDate: Date | null;
  actualQuantityKg: number | null;
};

export type TimingStatus = "UPCOMING" | "DUE_SOON" | "OVERDUE" | "ON_TIME" | "EARLY" | "LATE";
export type QuantityStatus = "ON_TARGET" | "BELOW" | "ABOVE";

export function isCompleted(h: HarvestLike) {
  return h.actualDate != null && h.actualQuantityKg != null;
}

export function getTiming(h: HarvestLike, today = new Date()): { status: TimingStatus; days: number } {
  if (h.actualDate) {
    const diff = differenceInCalendarDays(h.actualDate, h.scheduledDate);
    if (diff > HARVEST_RULES.graceDays) return { status: "LATE", days: diff };
    if (diff < 0) return { status: "EARLY", days: -diff };
    return { status: "ON_TIME", days: 0 };
  }
  const diff = differenceInCalendarDays(today, h.scheduledDate);
  if (diff > HARVEST_RULES.graceDays) return { status: "OVERDUE", days: diff };
  if (-diff <= HARVEST_RULES.dueSoonDays) return { status: "DUE_SOON", days: -diff };
  return { status: "UPCOMING", days: -diff };
}

export function getQuantity(h: HarvestLike): { status: QuantityStatus; variancePct: number } | null {
  if (h.actualQuantityKg == null || h.expectedQuantityKg <= 0) return null;
  const ratio = h.actualQuantityKg / h.expectedQuantityKg;
  const variancePct = (ratio - 1) * 100;
  if (ratio < 1 - HARVEST_RULES.quantityTolerance) return { status: "BELOW", variancePct };
  if (ratio > 1 + HARVEST_RULES.quantityTolerance) return { status: "ABOVE", variancePct };
  return { status: "ON_TARGET", variancePct };
}

export const timingBadge: Record<TimingStatus, { label: (days: number) => string; variant: BadgeVariant }> = {
  UPCOMING: { label: (d) => `In ${d} days`, variant: "default" },
  DUE_SOON: { label: (d) => (d === 0 ? "Due today" : `Due in ${d}d`), variant: "warning" },
  OVERDUE: { label: (d) => `Overdue ${d}d`, variant: "danger" },
  ON_TIME: { label: () => "On time", variant: "success" },
  EARLY: { label: (d) => `Early ${d}d`, variant: "info" },
  LATE: { label: (d) => `Late ${d}d`, variant: "danger" },
};

export const quantityBadge: Record<QuantityStatus, { label: string; variant: BadgeVariant }> = {
  ON_TARGET: { label: "On target", variant: "success" },
  BELOW: { label: "Below target", variant: "danger" },
  ABOVE: { label: "Above target", variant: "info" },
};

/** Row background used to highlight harvests that need attention. */
export function harvestRowClass(h: HarvestLike): string {
  const timing = getTiming(h).status;
  const qty = getQuantity(h)?.status;
  if (timing === "OVERDUE" || timing === "LATE" || qty === "BELOW") return "bg-red-50/70 hover:bg-red-50";
  if (timing === "DUE_SOON") return "bg-amber-50/70 hover:bg-amber-50";
  if (qty === "ABOVE") return "bg-sky-50/60 hover:bg-sky-50";
  return "";
}

export function needsAttention(h: HarvestLike): boolean {
  const timing = getTiming(h).status;
  return timing === "OVERDUE" || timing === "LATE" || getQuantity(h)?.status === "BELOW";
}
