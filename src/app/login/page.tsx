import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { reset } = await searchParams;
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage the Kurunduwatta polytunnel."
      footer={<>Need an account? Ask your AgriTrack administrator.</>}
    >
      {reset === "1" && (
        <p className="mb-5 rounded-xl bg-green-50 px-3.5 py-2.5 text-sm font-medium text-green-800 ring-1 ring-inset ring-green-200">
          Your password has been reset. Sign in with your new password.
        </p>
      )}
      <LoginForm />
    </AuthLayout>
  );
}
