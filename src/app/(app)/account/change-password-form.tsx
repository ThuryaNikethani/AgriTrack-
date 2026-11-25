"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { KeyRound } from "lucide-react";
import { changePassword } from "./actions";
import { Field } from "@/components/ui/form-controls";
import { PasswordInput, PasswordStrength } from "@/components/password-input";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialActionState);
  const [newPassword, setNewPassword] = useState("");
  const ref = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      setNewPassword("");
    }
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="grid gap-5">
      <FormMessage state={state} />
      <Field label="Current password" htmlFor="currentPassword" error={e.currentPassword}>
        <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" required />
      </Field>
      <Field label="New password" htmlFor="newPassword" error={e.newPassword}>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          autoComplete="new-password"
          minLength={8}
          required
          onValueChange={setNewPassword}
        />
        <PasswordStrength value={newPassword} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={e.confirmPassword}>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required />
      </Field>
      <SubmitButton size="lg" className="w-full sm:w-auto">
        <KeyRound /> Change password
      </SubmitButton>
    </form>
  );
}
