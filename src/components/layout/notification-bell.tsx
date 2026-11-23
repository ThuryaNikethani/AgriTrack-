import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { syncNotificationsThrottled } from "@/lib/notifications";

export async function NotificationBell() {
  await syncNotificationsThrottled();
  const unread = await prisma.notification.count({ where: { read: false } });

  return (
    <Link
      href="/notifications"
      className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100"
      aria-label={`${unread} unread notifications`}
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
