"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseForm, zDate, zOptionalDate, zOptionalText, zPositive } from "@/lib/forms";
import type { ActionState } from "@/components/form-helpers";

function revalidateHarvestPages(cropId: string) {
  revalidatePath("/harvests");
  revalidatePath("/crops");
  revalidatePath(`/crops/${cropId}`);
  revalidatePath("/dashboard");
}

const scheduleSchema = z
  .object({
    cropId: z.string({ required_error: "Select a crop" }).min(1),
    scheduledDate: zDate,
    expectedQuantityKg: zPositive,
    actualDate: zOptionalDate,
    actualQuantityKg: z.coerce.number().min(0).optional(),
    notes: zOptionalText,
  })
  .refine((d) => (d.actualDate == null) === (d.actualQuantityKg == null), {
    message: "Enter both the harvest date and quantity, or leave both empty",
    path: ["actualQuantityKg"],
  });

export async function createHarvest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(scheduleSchema, formData);
  if (!parsed.success) return parsed.state;

  await prisma.harvest.create({ data: parsed.data });
  if (parsed.data.actualDate) await markCropHarvesting(parsed.data.cropId);

  revalidateHarvestPages(parsed.data.cropId);
  redirect("/harvests");
}

const recordSchema = z.object({
  id: z.string().min(1),
  actualDate: zDate,
  actualQuantityKg: z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Cannot be negative"),
  notes: zOptionalText,
});

export async function recordHarvest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(recordSchema, formData);
  if (!parsed.success) return parsed.state;

  const { id, ...data } = parsed.data;
  const harvest = await prisma.harvest.update({ where: { id }, data });
  await markCropHarvesting(harvest.cropId);

  revalidateHarvestPages(harvest.cropId);
  redirect("/harvests");
}

export async function deleteHarvest(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const harvest = await prisma.harvest.delete({ where: { id } });
  revalidateHarvestPages(harvest.cropId);
}

/** A crop moves from GROWING to HARVESTING once its first harvest is recorded. */
async function markCropHarvesting(cropId: string) {
  await prisma.crop.updateMany({
    where: { id: cropId, status: "GROWING" },
    data: { status: "HARVESTING" },
  });
}
