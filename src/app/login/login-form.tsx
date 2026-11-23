"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "./actions";
import { Field, Input } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </Field>
      <SubmitButton size="lg" className="mt-2 w-full">
        <LogIn /> Sign in
      </SubmitButton>
    </form>
  );
}
