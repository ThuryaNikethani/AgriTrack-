"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createUser, resetPassword } from "./actions";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUser, initialActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const e = state.errors ?? {};

  return (
    <form ref={ref} action={formAction} className="grid gap-3">
      <FormMessage state={state} />
      <Field label="Full name" htmlFor="user-name" error={e.name}>
        <Input id="user-name" name="name" required />
      </Field>
      <Field label="Email" htmlFor="user-email" error={e.email}>
        <Input id="user-email" name="email" type="email" required />
      </Field>
      <Field label="Password" htmlFor="user-password" error={e.password}>
        <Input id="user-password" name="password" type="password" minLength={8} required />
      </Field>
      <Field label="Role" htmlFor="user-role" error={e.role}>
        <Select id="user-role" name="role" defaultValue="STAFF">
          <option value="STAFF">Staff - day-to-day records</option>
          <option value="ADMIN">Admin - full access incl. users</option>
        </Select>
      </Field>
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(resetPassword, initialActionState);

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Reset password
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={userId} />
      <Input name="password" type="password" placeholder="New password" minLength={8} required className="h-8 w-40" />
      <SubmitButton size="sm">Save</SubmitButton>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {state.message && (
        <span className={state.ok ? "text-xs text-green-700" : "text-xs text-red-600"}>
          {state.errors?.password?.[0] ?? state.message}
        </span>
      )}
    </form>
  );
}
