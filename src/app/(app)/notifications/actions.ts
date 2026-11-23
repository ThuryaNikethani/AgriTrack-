"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { syncNotifications } from "@/lib/notifications";

export async function markRead(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/", "layout");
}

export async function markAllRead() {
  await requireUser();
  await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/", "layout");
}

export async function refreshNotifications() {
  await requireUser();
  await syncNotifications();
  revalidatePath("/", "layout");
}
