import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export type PushPayload = {
  title: string;
  body: string;
  /** Page to open when the notification is tapped. */
  url?: string;
  /** Notifications with the same tag replace each other on the phone. */
  tag?: string;
};

let configured: boolean | null = null;

export function isPushConfigured(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return (configured = false);
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:admin@example.com", publicKey, privateKey);
  return (configured = true);
}

/**
 * Sends a notification to every registered phone / browser (optionally only one user's).
 * Subscriptions the push service reports as gone (404 / 410) are removed.
 */
export async function sendPush(payload: PushPayload, options: { userId?: string } = {}) {
  if (!isPushConfigured()) return { sent: 0, failed: 0 };

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: options.userId, user: { active: true } },
  });

  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24 },
        );
        sent++;
      } catch (error) {
        failed++;
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        } else {
          console.error("Push failed", status, (error as Error).message);
        }
      }
    }),
  );
  return { sent, failed };
}
