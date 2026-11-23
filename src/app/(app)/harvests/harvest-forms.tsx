"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createHarvest, recordHarvest } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";
import { buttonVariants } from "@/components/ui/button";

type CropOption = { id: string; label: string };

export function ScheduleHarvestForm({ crops, defaultCropId }: { crops: CropOption[]; defaultCropId?: string }) {
  const [state, formAction] = useActionState(createHarvest, initialActionState);
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormMessage state={state} />
      </div>
      <Field label="Crop" htmlFor="cropId" error={e.cropId} className="sm:col-span-2">
        <Select id="cropId" name="cropId" defaultValue={defaultCropId ?? ""} required>
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
      <Field label="Scheduled harvest date" htmlFor="scheduledDate" error={e.scheduledDate}>
        <Input id="scheduledDate" name="scheduledDate" type="date" required />
      </Field>
      <Field label="Expected quantity (kg)" htmlFor="expectedQuantityKg" error={e.expectedQuantityKg}>
        <Input id="expectedQuantityKg" name="expectedQuantityKg" type="number" step="0.01" min={0} required />
      </Field>
      <p className="text-sm text-gray-500 sm:col-span-2">
        Already harvested? Fill in the actual date and quantity below. Otherwise leave them empty.
      </p>
      <Field label="Actual harvest date" htmlFor="actualDate" error={e.actualDate}>
        <Input id="actualDate" name="actualDate" type="date" />
      </Field>
      <Field label="Actual quantity (kg)" htmlFor="actualQuantityKg" error={e.actualQuantityKg}>
        <Input id="actualQuantityKg" name="actualQuantityKg" type="number" step="0.01" min={0} />
      </Field>
      <Field label="Notes" htmlFor="notes" error={e.notes} className="sm:col-span-2">
        <Textarea id="notes" name="notes" />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <SubmitButton>Save harvest</SubmitButton>
        <Link href="/harvests" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function RecordHarvestForm({
  harvestId,
  defaultDate,
  defaultQuantity,
  defaultNotes,
}: {
  harvestId: string;
  defaultDate: string;
  defaultQuantity?: number;
  defaultNotes?: string;
}) {
  const [state, formAction] = useActionState(recordHarvest, initialActionState);
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={harvestId} />
      <div className="sm:col-span-2">
        <FormMessage state={state} />
      </div>
      <Field label="Harvested on" htmlFor="actualDate" error={e.actualDate}>
        <Input id="actualDate" name="actualDate" type="date" defaultValue={defaultDate} required />
      </Field>
      <Field label="Quantity harvested (kg)" htmlFor="actualQuantityKg" error={e.actualQuantityKg}>
        <Input
          id="actualQuantityKg"
          name="actualQuantityKg"
          type="number"
          step="0.01"
          min={0}
          defaultValue={defaultQuantity}
          required
        />
      </Field>
      <Field label="Notes" htmlFor="notes" error={e.notes} className="sm:col-span-2">
        <Textarea id="notes" name="notes" defaultValue={defaultNotes} />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <SubmitButton>Record harvest</SubmitButton>
        <Link href="/harvests" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
