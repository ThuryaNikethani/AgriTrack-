"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn, Mail } from "lucide-react";
import { loginAction } from "./actions";
import { Label } from "@/components/ui/form-controls";
import { IconInput, PasswordInput } from "@/components/password-input";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormMessage state={state} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email address</Label>
        <IconInput
          icon={Mail}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline">
            Forgot password?
          </Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Your password" required />
      </div>
      <SubmitButton size="lg" className="mt-1 h-12 w-full text-base">
        <LogIn /> Sign in
      </SubmitButton>
    </form>
  );
}
