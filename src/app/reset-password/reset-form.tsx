"use client";

import { useActionState, useState } from "react";
import { KeyRound } from "lucide-react";
import { resetPassword } from "@/app/forgot-password/actions";
import { Field } from "@/components/ui/form-controls";
import { PasswordInput, PasswordStrength } from "@/components/password-input";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPassword, initialActionState);
  const [newPassword, setNewPassword] = useState("");
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <Field label="New password" htmlFor="newPassword" error={e.newPassword}>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          autoComplete="new-password"
          minLength={8}
          required
          autoFocus
          onValueChange={setNewPassword}
        />
        <PasswordStrength value={newPassword} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={e.confirmPassword}>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required />
      </Field>
      <SubmitButton size="lg" className="h-12 w-full text-base">
        <KeyRound /> Reset password
      </SubmitButton>
    </form>
  );
}
