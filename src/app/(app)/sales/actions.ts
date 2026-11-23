"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getCropStock } from "@/lib/sales";
import { parseForm, zDate, zNonNegative, zOptionalText, zPositive } from "@/lib/forms";
import type { ActionState } from "@/components/form-helpers";

const saleSchema = z.object({
  cropId: z.string({ required_error: "Select a crop" }).min(1),
  saleDate: zDate,
  quantity: zPositive,
  quantityUnit: z.enum(["KG", "G"]).default("KG"),
  unitPrice: zNonNegative, // LKR per kg
  customerType: z.enum(["VILLA", "TEA_FACTORY", "EXTERNAL"]),
  customerName: z.string().max(100).optional(),
  notes: zOptionalText,
});

export async function createSale(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(saleSchema, formData);
  if (!parsed.success) return parsed.state;

  const { quantity, quantityUnit, ...data } = parsed.data;
  const quantityKg = quantityUnit === "G" ? quantity / 1000 : quantity;

  const [stock] = await getCropStock({ cropId: data.cropId });
  if (!stock) return { ok: false, message: "Crop not found." };
  if (quantityKg > stock.availableKg + 1e-9) {
    return {
      ok: false,
      message: `Only ${stock.availableKg} kg of ${stock.name} is available from recorded harvests.`,
      errors: { quantity: ["More than the available harvest stock"] },
    };
  }

  const totalAmount = Math.round(quantityKg * data.unitPrice * 100) / 100;

  await prisma.sale.create({
    data: { ...data, quantityKg, totalAmount },
  });

  revalidatePath("/sales");
  revalidatePath(`/crops/${data.cropId}`);
  revalidatePath("/dashboard");
  return { ok: true, message: `Sale recorded - LKR ${totalAmount.toFixed(2)}.` };
}

export async function deleteSale(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const sale = await prisma.sale.delete({ where: { id } });
  revalidatePath("/sales");
  revalidatePath(`/crops/${sale.cropId}`);
  revalidatePath("/dashboard");
}
