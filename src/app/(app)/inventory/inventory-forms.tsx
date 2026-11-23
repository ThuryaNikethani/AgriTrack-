"use client";

import { useActionState, useEffect, useRef } from "react";
import { createItem, recordMovement } from "./actions";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";
import { toDateInput } from "@/lib/utils";

export function ItemForm() {
  const [state, formAction] = useActionState(createItem, initialActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const e = state.errors ?? {};

  return (
    <form ref={ref} action={formAction} className="grid gap-3">
      <FormMessage state={state} />
      <Field label="Item name" htmlFor="item-name" error={e.name}>
        <Input id="item-name" name="name" placeholder="e.g. Tomato seeds" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" htmlFor="item-category" error={e.category}>
          <Select id="item-category" name="category" defaultValue="SEED">
            <option value="SEED">Seeds</option>
            <option value="SUPPLY">Supplies</option>
            <option value="EQUIPMENT">Equipment</option>
          </Select>
        </Field>
        <Field label="Unit" htmlFor="item-unit" error={e.unit}>
          <Input id="item-unit" name="unit" placeholder="packets / pcs" required />
        </Field>
        <Field label="Opening quantity" htmlFor="item-qty" error={e.quantity}>
          <Input id="item-qty" name="quantity" type="number" step="0.01" min={0} defaultValue={0} />
        </Field>
        <Field label="Reorder level" htmlFor="item-reorder" error={e.reorderLevel}>
          <Input id="item-reorder" name="reorderLevel" type="number" step="0.01" min={0} defaultValue={0} />
        </Field>
      </div>
      <Field label="Notes" htmlFor="item-notes" error={e.notes}>
        <Input id="item-notes" name="notes" />
      </Field>
      <SubmitButton>Add item</SubmitButton>
    </form>
  );
}

export function MovementForm({ items }: { items: { id: string; label: string }[] }) {
  const [state, formAction] = useActionState(recordMovement, initialActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const e = state.errors ?? {};

  return (
    <form ref={ref} action={formAction} className="grid gap-3">
      <FormMessage state={state} />
      <Field label="Item" htmlFor="mv-item" error={e.itemId}>
        <Select id="mv-item" name="itemId" defaultValue="" required>
          <option value="" disabled>
            Select an item
          </option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Movement" htmlFor="mv-type" error={e.type}>
          <Select id="mv-type" name="type" defaultValue="OUT">
            <option value="OUT">Stock out (used)</option>
            <option value="IN">Stock in (purchased)</option>
          </Select>
        </Field>
        <Field label="Quantity" htmlFor="mv-qty" error={e.quantity}>
          <Input id="mv-qty" name="quantity" type="number" step="0.01" min={0} required />
        </Field>
      </div>
      <Field label="Date" htmlFor="mv-date" error={e.date}>
        <Input id="mv-date" name="date" type="date" defaultValue={toDateInput(new Date())} required />
      </Field>
      <Field label="Note" htmlFor="mv-note" error={e.note}>
        <Input id="mv-note" name="note" />
      </Field>
      <SubmitButton variant="secondary">Update stock</SubmitButton>
    </form>
  );
}
