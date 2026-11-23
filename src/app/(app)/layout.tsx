import { AppShell } from "@/components/layout/app-shell";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell
      isAdmin={user.role === "ADMIN"}
      topbar={
        <>
          <NotificationBell />
          <UserMenu name={user.name ?? user.email ?? "User"} role={user.role} />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
