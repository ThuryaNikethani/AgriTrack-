import Link from "next/link";
import { ArrowLeft, LinkIcon } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { buttonVariants } from "@/components/ui/button";
import { findValidToken } from "@/lib/password-reset";
import { ResetPasswordForm } from "./reset-form";

export const metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const record = await findValidToken(token);

  const back = (
    <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-green-700 hover:underline">
      <ArrowLeft className="h-4 w-4" /> Back to sign in
    </Link>
  );

  if (!record) {
    return (
      <AuthLayout title="Link expired" subtitle="This password reset link is invalid, already used or expired." footer={back}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
            <LinkIcon className="h-6 w-6" />
          </span>
          <p className="text-sm text-gray-600">Reset links work once and are valid for 1 hour. Request a new link to continue.</p>
          <Link href="/forgot-password" className={buttonVariants({ size: "lg", className: "w-full" })}>
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={`Resetting the password for ${record.user.email}`}
      footer={back}
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
