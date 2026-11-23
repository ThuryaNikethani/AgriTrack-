import Link from "next/link";
import { AlertTriangle, BellOff, CalendarClock, Check, PackageX, RefreshCw } from "lucide-react";
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { syncNotifications } from "@/lib/notifications";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { markAllRead, markRead, refreshNotifications } from "./actions";

export const metadata = { title: "Notifications" };

const typeStyle: Record<NotificationType, { icon: typeof AlertTriangle; className: string; label: string }> = {
  LOW_STOCK: { icon: AlertTriangle, className: "bg-amber-50 text-amber-700", label: "Low stock" },
  OUT_OF_STOCK: { icon: PackageX, className: "bg-red-50 text-red-700", label: "Out of stock" },
  HARVEST_DUE: { icon: CalendarClock, className: "bg-sky-50 text-sky-700", label: "Harvest reminder" },
  HARVEST_OVERDUE: { icon: AlertTriangle, className: "bg-red-50 text-red-700", label: "Harvest overdue" },
};

export default async function NotificationsPage() {
  await syncNotifications();
  const notifications = await prisma.notification.findMany({
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Reorder reminders for fertilizer and supplies, upcoming harvests and overdue harvests."
        actions={
          <>
            <form action={refreshNotifications}>
              <Button variant="outline" type="submit">
                <RefreshCw /> Refresh
              </Button>
            </form>
            <form action={markAllRead}>
              <Button variant="secondary" type="submit">
                <Check /> Mark all as read
              </Button>
            </form>
          </>
        }
      />

      <Card className="divide-y divide-gray-100">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-gray-500">
            <BellOff className="h-8 w-8" />
            <p>All clear - no alerts right now.</p>
          </div>
        )}
        {notifications.map((n) => {
          const style = typeStyle[n.type];
          const Icon = style.icon;
          return (
            <div key={n.id} className={cn("flex items-start gap-4 p-4", !n.read && "bg-green-50/40")}>
              <span className={cn("rounded-md p-2", style.className)}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("text-sm", n.read ? "text-gray-700" : "font-semibold text-gray-900")}>{n.title}</p>
                  <span className="text-xs text-gray-400">
                    {style.label} - {formatDate(n.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                {n.link && (
                  <Link href={n.link} className="mt-1 inline-block text-sm text-green-700 hover:underline">
                    Take action
                  </Link>
                )}
              </div>
              {!n.read && (
                <form action={markRead}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button variant="ghost" size="sm" type="submit">
                    Mark read
                  </Button>
                </form>
              )}
            </div>
          );
        })}
      </Card>
    </>
  );
}
