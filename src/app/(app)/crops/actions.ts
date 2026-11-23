"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseForm, zDate, zOptionalText, zPositive } from "@/lib/forms";
import type { ActionState } from "@/components/form-helpers";

const cropSchema = z
  .object({
    name: z.string({ required_error: "Vegetable name is required" }).min(1).max(100),
    variety: z.string().max(100).optional(),
    bedLocation: z.string().max(100).optional(),
    plantedDate: zDate,
    expectedHarvestDate: zDate,
    plantedQuantity: z.coerce.number().int("Whole number").positive("Must be greater than 0"),
    expectedYieldKg: zPositive,
    status: z.enum(["GROWING", "HARVESTING", "COMPLETED", "FAILED"]).default("GROWING"),
    notes: zOptionalText,
  })
  .refine((d) => d.expectedHarvestDate >= d.plantedDate, {
    message: "Harvest date must be after the planting date",
    path: ["expectedHarvestDate"],
  });

export async function createCrop(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(cropSchema, formData);
  if (!parsed.success) return parsed.state;

  const crop = await prisma.crop.create({
    data: {
      ...parsed.data,
      // First scheduled harvest uses the expected harvest date and yield.
      harvests: {
        create: {
          scheduledDate: parsed.data.expectedHarvestDate,
          expectedQuantityKg: parsed.data.expectedYieldKg,
        },
      },
    },
  });

  revalidatePath("/crops");
  redirect(`/crops/${crop.id}`);
}

export async function updateCrop(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const parsed = parseForm(cropSchema, formData);
  if (!parsed.success) return parsed.state;

  await prisma.crop.update({ where: { id }, data: parsed.data });

  revalidatePath("/crops");
  revalidatePath(`/crops/${id}`);
  redirect(`/crops/${id}`);
}

export async function deleteCrop(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const salesCount = await prisma.sale.count({ where: { cropId: id } });
  if (salesCount > 0) {
    // Sales are financial records - keep them. Mark the crop as completed instead.
    await prisma.crop.update({ where: { id }, data: { status: "COMPLETED" } });
  } else {
    await prisma.crop.delete({ where: { id } });
  }
  revalidatePath("/crops");
  redirect("/crops");
}
