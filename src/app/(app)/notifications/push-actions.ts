"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { sendPush } from "@/lib/push";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

/** Saves this phone / browser so it receives AgriTrack push notifications. */
export async function savePushSubscription(subscription: unknown) {
  const user = await requireUser();
  const parsed = subscriptionSchema.safeParse(subscription);
  if (!parsed.success) return { ok: false };

  const { endpoint, keys } = parsed.data;
  const userAgent = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    update: { userId: user.id, p256dh: keys.p256dh, auth: keys.auth, userAgent },
  });
  return { ok: true };
}

export async function deletePushSubscription(endpoint: string) {
  const user = await requireUser();
  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
  return { ok: true };
}

/** Sends a test notification to the signed-in user's devices. */
export async function sendTestPush() {
  const user = await requireUser();
  const result = await sendPush(
    {
      title: "AgriTrack test notification",
      body: `Hello${user.name ? ` ${user.name}` : ""}! Push notifications are working on this device.`,
      url: "/notifications",
      tag: "agritrack-test",
    },
    { userId: user.id },
  );
  return result;
}
