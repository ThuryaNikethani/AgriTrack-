"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Field, Input } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <SubmitButton className="w-full">Sign in</SubmitButton>
    </form>
  );
}
