import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enumLabel, formatDate } from "@/lib/utils";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  return (
    <>
      <PageHeader
        title="My account"
        description="Your profile and password."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle icon={UserRound}>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-100 text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-gray-500">Name</dt>
                <dd className="font-semibold text-gray-900">{user?.name}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-semibold text-gray-900">{user?.email}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-gray-500">Role</dt>
                <dd>
                  <Badge variant={user?.role === "ADMIN" ? "info" : "default"}>{enumLabel(user?.role ?? "STAFF")}</Badge>
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-gray-500">Member since</dt>
                <dd className="font-semibold text-gray-900">{formatDate(user?.createdAt)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-gold-50 p-3.5 text-sm text-gold-700 ring-1 ring-inset ring-gold-200">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Use at least 8 characters with a mix of letters, numbers and symbols. Do not share your password.</p>
            </div>
          </CardContent>
        </Card>

        <Card id="password" className="scroll-mt-24">
          <CardHeader>
            <CardTitle icon={KeyRound}>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
