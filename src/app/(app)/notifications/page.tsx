import Link from "next/link";
import { AlertTriangle, ArrowRight, BellOff, CalendarClock, Check, PackageX, RefreshCw } from "lucide-react";
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { syncNotifications } from "@/lib/notifications";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { markAllRead, markRead, refreshNotifications } from "./actions";

export const metadata = { title: "Notifications" };

const typeStyle: Record<
  NotificationType,
  { icon: typeof AlertTriangle; className: string; border: string; label: string }
> = {
  LOW_STOCK: {
    icon: AlertTriangle,
    className: "bg-gradient-to-br from-gold-200 to-gold-400 text-green-950",
    border: "border-gray-200/70 border-l-gold-400",
    label: "Low stock",
  },
  OUT_OF_STOCK: {
    icon: PackageX,
    className: "bg-gradient-to-br from-red-400 to-red-600 text-white",
    border: "border-gray-200/70 border-l-red-500",
    label: "Out of stock",
  },
  HARVEST_DUE: {
    icon: CalendarClock,
    className: "bg-gradient-to-br from-green-400 to-green-600 text-white",
    border: "border-gray-200/70 border-l-green-500",
    label: "Harvest reminder",
  },
  HARVEST_OVERDUE: {
    icon: AlertTriangle,
    className: "bg-gradient-to-br from-red-400 to-red-600 text-white",
    border: "border-gray-200/70 border-l-red-500",
    label: "Harvest overdue",
  },
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

      <div className="space-y-3">
        {notifications.length === 0 && (
          <Card className="flex flex-col items-center gap-3 p-12 text-gray-500">
            <span className="rounded-full bg-green-50 p-4 text-green-600">
              <BellOff className="h-8 w-8" />
            </span>
            <p className="font-semibold">All clear - no alerts right now.</p>
          </Card>
        )}
        {notifications.map((n) => {
          const style = typeStyle[n.type];
          const Icon = style.icon;
          return (
            <div
              key={n.id}
              className={cn(
                "flex animate-fade-up items-start gap-4 rounded-2xl border border-l-4 bg-white/95 p-5 shadow-soft transition hover:shadow-lift",
                style.border,
                !n.read && "ring-1 ring-gold-200",
              )}
            >
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", style.className)}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("text-base", n.read ? "font-medium text-gray-700" : "font-bold text-gray-900")}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">New</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="font-semibold uppercase tracking-wider">{style.label}</span>
                  <span>·</span>
                  <span>{formatDate(n.createdAt)}</span>
                  {n.link && (
                    <Link href={n.link} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                      Take action <ArrowRight />
                    </Link>
                  )}
                </div>
              </div>
              {!n.read && (
                <form action={markRead}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button variant="outline" size="sm" type="submit">
                    <Check /> Mark read
                  </Button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
