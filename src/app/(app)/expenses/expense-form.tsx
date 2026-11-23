"use client";

import { useActionState, useEffect, useRef } from "react";
import { createExpense } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";
import { EXPENSE_CATEGORIES } from "@/lib/expenses";
import { toDateInput } from "@/lib/utils";

export function ExpenseForm({ crops }: { crops: { id: string; label: string }[] }) {
  const [state, formAction] = useActionState(createExpense, initialActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const e = state.errors ?? {};

  return (
    <form ref={ref} action={formAction} className="grid gap-3">
      <FormMessage state={state} />
      <Field label="Date" htmlFor="exp-date" error={e.date}>
        <Input id="exp-date" name="date" type="date" defaultValue={toDateInput(new Date())} required />
      </Field>
      <Field label="Category" htmlFor="exp-category" error={e.category}>
        <Select id="exp-category" name="category" defaultValue="LABOUR">
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label} - {c.examples}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Description" htmlFor="exp-desc" error={e.description}>
        <Textarea id="exp-desc" name="description" required />
      </Field>
      <Field label="Amount (LKR)" htmlFor="exp-amount" error={e.amount}>
        <Input id="exp-amount" name="amount" type="number" step="0.01" min={0} required />
      </Field>
      <Field label="Related crop (optional)" htmlFor="exp-crop" error={e.cropId}>
        <Select id="exp-crop" name="cropId" defaultValue="">
          <option value="">General / not crop specific</option>
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <SubmitButton>Record expense</SubmitButton>
    </form>
  );
}
