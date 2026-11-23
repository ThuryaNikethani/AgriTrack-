"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Standard result returned by every server action that backs a form. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export const initialActionState: ActionState = {};

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? "Saving..." : children}
    </Button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p
      className={
        state.ok
          ? "rounded-xl bg-green-50 px-3.5 py-2.5 text-sm font-medium text-green-800 ring-1 ring-inset ring-green-200"
          : "rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200"
      }
    >
      {state.message}
    </p>
  );
}

/** Small form that calls a server action after a confirmation prompt. */
export function DeleteButton({
  action,
  id,
  confirmText = "Delete this record?",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="icon" aria-label="Delete" title="Delete">
        <Trash2 className="text-red-600" />
      </Button>
    </form>
  );
}
