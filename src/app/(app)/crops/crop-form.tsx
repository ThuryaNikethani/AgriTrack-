"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import type { Crop } from "@prisma/client";
import { createCrop, updateCrop } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";
import { buttonVariants } from "@/components/ui/button";
import { addDays, toDateInput } from "@/lib/utils";
import { VEGETABLES, findVegetable, vegetableLabel } from "@/lib/vegetables";

const statuses = ["GROWING", "HARVESTING", "COMPLETED", "FAILED"] as const;

export function CropForm({ crop }: { crop?: Crop }) {
  const [state, formAction] = useActionState(crop ? updateCrop : createCrop, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  /** Fills scientific name and expected harvest date from the vegetable catalogue (only empty fields). */
  function autofill() {
    const form = formRef.current;
    if (!form) return;
    const field = (n: string) => form.elements.namedItem(n) as HTMLInputElement | null;
    const veg = findVegetable(field("name")?.value);
    if (!veg) return;
    const sci = field("scientificName");
    if (sci && !sci.value) sci.value = veg.scientificName;
    const planted = field("plantedDate")?.value;
    const expected = field("expectedHarvestDate");
    if (planted && expected && !expected.value) {
      expected.value = toDateInput(addDays(new Date(planted), veg.daysToHarvest));
    }
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      {crop && <input type="hidden" name="id" value={crop.id} />}
      <div className="sm:col-span-2">
        <FormMessage state={state} />
      </div>
      <Field label="Vegetable" htmlFor="name" error={e.name}>
        <Input
          id="name"
          name="name"
          list="vegetable-list"
          defaultValue={crop?.name}
          placeholder="Choose or type, e.g. Tomato"
          onChange={autofill}
          onBlur={autofill}
          required
        />
        <datalist id="vegetable-list">
          {VEGETABLES.map((v) => (
            <option key={v.name} value={v.name} label={vegetableLabel(v)} />
          ))}
        </datalist>
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
        <Input
          id="plantedDate"
          name="plantedDate"
          type="date"
          defaultValue={toDateInput(crop?.plantedDate)}
          onChange={autofill}
          required
        />
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
