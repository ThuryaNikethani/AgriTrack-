import { AppShell } from "@/components/layout/app-shell";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { prisma } from "@/lib/prisma";
import { syncNotificationsThrottled } from "@/lib/notifications";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await syncNotificationsThrottled();
  const unread = await prisma.notification.count({ where: { read: false } });

  return (
    <AppShell
      isAdmin={user.role === "ADMIN"}
      unread={unread}
      topbar={
        <>
          <NotificationBell unread={unread} />
          <UserMenu name={user.name ?? user.email ?? "User"} email={user.email} role={user.role} />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
