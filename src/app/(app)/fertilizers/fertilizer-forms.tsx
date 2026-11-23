"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Fertilizer } from "@prisma/client";
import { createFertilizer, recordPurchase, recordUsage, updateFertilizer } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState, type ActionState } from "@/components/form-helpers";
import { toDateInput } from "@/lib/utils";

/** Clears a form after a successful submission. */
function useResetOnSuccess(state: ActionState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

export function FertilizerForm({ fertilizer }: { fertilizer?: Fertilizer }) {
  const [state, formAction] = useActionState(fertilizer ? updateFertilizer : createFertilizer, initialActionState);
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {fertilizer && <input type="hidden" name="id" value={fertilizer.id} />}
      <div className="sm:col-span-2">
        <FormMessage state={state} />
      </div>
      <Field label="Name" htmlFor="name" error={e.name}>
        <Input id="name" name="name" defaultValue={fertilizer?.name} placeholder="e.g. Compost" required />
      </Field>
      <Field label="Type" htmlFor="type" error={e.type}>
        <Select id="type" name="type" defaultValue={fertilizer?.type ?? "ORGANIC"}>
          <option value="ORGANIC">Organic</option>
          <option value="CHEMICAL">Chemical</option>
        </Select>
      </Field>
      <Field label="Unit" htmlFor="unit" error={e.unit}>
        <Input id="unit" name="unit" defaultValue={fertilizer?.unit ?? "kg"} placeholder="kg / L / bags" required />
      </Field>
      {!fertilizer && (
        <Field label="Opening stock" htmlFor="currentStock" error={e.currentStock}>
          <Input id="currentStock" name="currentStock" type="number" step="0.01" min={0} defaultValue={0} />
        </Field>
      )}
      <Field label="Reorder level (notify below)" htmlFor="reorderLevel" error={e.reorderLevel}>
        <Input
          id="reorderLevel"
          name="reorderLevel"
          type="number"
          step="0.01"
          min={0}
          defaultValue={fertilizer?.reorderLevel ?? 0}
        />
      </Field>
      <Field label="Supplier" htmlFor="supplier" error={e.supplier}>
        <Input id="supplier" name="supplier" defaultValue={fertilizer?.supplier ?? ""} />
      </Field>
      <Field label="Notes" htmlFor="notes" error={e.notes} className="sm:col-span-2">
        <Textarea id="notes" name="notes" defaultValue={fertilizer?.notes ?? ""} />
      </Field>
      <div className="sm:col-span-2">
        <SubmitButton>{fertilizer ? "Save changes" : "Add fertilizer"}</SubmitButton>
      </div>
    </form>
  );
}

export function UsageForm({
  fertilizerId,
  unit,
  crops,
}: {
  fertilizerId: string;
  unit: string;
  crops: { id: string; label: string }[];
}) {
  const [state, formAction] = useActionState(recordUsage, initialActionState);
  const ref = useResetOnSuccess(state);
  const e = state.errors ?? {};

  return (
    <form ref={ref} action={formAction} className="grid gap-3">
      <input type="hidden" name="fertilizerId" value={fertilizerId} />
      <FormMessage state={state} />
      <Field label="Crop" htmlFor="usage-crop" error={e.cropId}>
        <Select id="usage-crop" name="cropId" defaultValue="" required>
          <option value="" disabled>
            Select a crop
          </option>
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" htmlFor="usage-date" error={e.date}>
          <Input id="usage-date" name="date" type="date" defaultValue={toDateInput(new Date())} required />
        </Field>
        <Field label={`Quantity (${unit})`} htmlFor="usage-qty" error={e.quantity}>
          <Input id="usage-qty" name="quantity" type="number" step="0.01" min={0} required />
        </Field>
      </div>
      <Field label="Notes" htmlFor="usage-notes" error={e.notes}>
        <Input id="usage-notes" name="notes" />
      </Field>
      <SubmitButton variant="secondary">Record usage</SubmitButton>
    </form>
  );
}

export function PurchaseForm({ fertilizerId, unit }: { fertilizerId: string; unit: string }) {
  const [state, formAction] = useActionState(recordPurchase, initialActionState);
  const ref = useResetOnSuccess(state);
  const e = state.errors ?? {};

  return (
    <form ref={ref} action={formAction} className="grid gap-3">
      <input type="hidden" name="fertilizerId" value={fertilizerId} />
      <FormMessage state={state} />
      <Field label="Purchase date" htmlFor="purchase-date" error={e.date}>
        <Input id="purchase-date" name="date" type="date" defaultValue={toDateInput(new Date())} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Quantity (${unit})`} htmlFor="purchase-qty" error={e.quantity}>
          <Input id="purchase-qty" name="quantity" type="number" step="0.01" min={0} required />
        </Field>
        <Field label="Total cost (LKR)" htmlFor="purchase-cost" error={e.totalCost}>
          <Input id="purchase-cost" name="totalCost" type="number" step="0.01" min={0} required />
        </Field>
      </div>
      <p className="text-xs text-gray-500">The cost is added to expenses under &quot;Fertilizer&quot;.</p>
      <SubmitButton variant="secondary">Add stock</SubmitButton>
    </form>
  );
}
