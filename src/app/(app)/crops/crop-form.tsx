"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Crop } from "@prisma/client";
import { createCrop, updateCrop } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";
import { buttonVariants } from "@/components/ui/button";
import { toDateInput } from "@/lib/utils";

const statuses = ["GROWING", "HARVESTING", "COMPLETED", "FAILED"] as const;

export function CropForm({ crop }: { crop?: Crop }) {
  const [state, formAction] = useActionState(crop ? updateCrop : createCrop, initialActionState);
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {crop && <input type="hidden" name="id" value={crop.id} />}
      <div className="sm:col-span-2">
        <FormMessage state={state} />
      </div>
      <Field label="Vegetable" htmlFor="name" error={e.name}>
        <Input id="name" name="name" defaultValue={crop?.name} placeholder="e.g. Tomato" required />
      </Field>
      <Field label="Scientific name" htmlFor="scientificName" error={e.scientificName}>
        <Input
          id="scientificName"
          name="scientificName"
          defaultValue={crop?.scientificName ?? ""}
          placeholder="e.g. Solanum lycopersicum"
          className="italic"
        />
      </Field>
      <Field label="Variety" htmlFor="variety" error={e.variety}>
        <Input id="variety" name="variety" defaultValue={crop?.variety ?? ""} />
      </Field>
      <Field label="Bed / section" htmlFor="bedLocation" error={e.bedLocation}>
        <Input id="bedLocation" name="bedLocation" defaultValue={crop?.bedLocation ?? ""} placeholder="e.g. Bed A" />
      </Field>
      <Field label="Status" htmlFor="status" error={e.status}>
        <Select id="status" name="status" defaultValue={crop?.status ?? "GROWING"}>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Planted date" htmlFor="plantedDate" error={e.plantedDate}>
        <Input id="plantedDate" name="plantedDate" type="date" defaultValue={toDateInput(crop?.plantedDate)} required />
      </Field>
      <Field label="Expected harvest date" htmlFor="expectedHarvestDate" error={e.expectedHarvestDate}>
        <Input
          id="expectedHarvestDate"
          name="expectedHarvestDate"
          type="date"
          defaultValue={toDateInput(crop?.expectedHarvestDate)}
          required
        />
      </Field>
      <Field label="Number of plants" htmlFor="plantedQuantity" error={e.plantedQuantity}>
        <Input id="plantedQuantity" name="plantedQuantity" type="number" min={1} defaultValue={crop?.plantedQuantity} required />
      </Field>
      <Field label="Expected yield (kg)" htmlFor="expectedYieldKg" error={e.expectedYieldKg}>
        <Input
          id="expectedYieldKg"
          name="expectedYieldKg"
          type="number"
          step="0.01"
          min={0}
          defaultValue={crop?.expectedYieldKg}
          required
        />
      </Field>
      <Field label="Notes" htmlFor="notes" error={e.notes} className="sm:col-span-2">
        <Textarea id="notes" name="notes" defaultValue={crop?.notes ?? ""} />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <SubmitButton>{crop ? "Save changes" : "Add crop"}</SubmitButton>
        <Link href={crop ? `/crops/${crop.id}` : "/crops"} className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
