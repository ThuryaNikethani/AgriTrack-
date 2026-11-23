import { Sprout } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-green-700 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Sprout className="h-10 w-10 text-green-700" />
          <h1 className="mt-2 text-2xl font-bold text-gray-900">AgriTrack</h1>
          <p className="text-sm text-gray-500">
            Kurunduwatta Villa &amp; Cottages polytunnel management
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
