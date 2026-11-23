import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Returns the signed-in user or redirects to the login page. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** "Name (Role)" shown as "Printed by" on reports. */
export function printedByLabel(user: { name?: string | null; email?: string | null; role: string }) {
  const role = user.role === "ADMIN" ? "Admin" : "Staff";
  return `${user.name ?? user.email ?? "User"} (${role})`;
}

/** Returns the signed-in admin or redirects to the dashboard. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
