"use client";

import { useActionState } from "react";
import { Mail, Send } from "lucide-react";
import { requestPasswordReset } from "./actions";
import { Label } from "@/components/ui/form-controls";
import { IconInput } from "@/components/password-input";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialActionState);
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormMessage state={state} />
      {!state.ok && (
        <>
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
            {e.email && <p className="text-xs font-medium text-red-600">{e.email[0]}</p>}
          </div>
          <SubmitButton size="lg" className="h-12 w-full text-base">
            <Send /> Send reset link
          </SubmitButton>
        </>
      )}
    </form>
  );
}
