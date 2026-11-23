import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell({ unread }: { unread: number }) {
  return (
    <Link
      href="/notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/70 bg-white text-gray-600 shadow-soft transition hover:text-green-700"
      aria-label={`${unread} unread notifications`}
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
