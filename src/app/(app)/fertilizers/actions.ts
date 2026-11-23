"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseForm, zDate, zNonNegative, zOptionalText, zPositive } from "@/lib/forms";
import type { ActionState } from "@/components/form-helpers";

function revalidateFertilizerPages(id?: string) {
  revalidatePath("/fertilizers");
  if (id) revalidatePath(`/fertilizers/${id}`);
  revalidatePath("/crops", "layout");
  revalidatePath("/dashboard");
}

const fertilizerSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1).max(100),
  type: z.enum(["ORGANIC", "CHEMICAL"]),
  unit: z.string().min(1).max(20).default("kg"),
  currentStock: zNonNegative.default(0),
  reorderLevel: zNonNegative.default(0),
  supplier: z.string().max(100).optional(),
  notes: zOptionalText,
});

export async function createFertilizer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(fertilizerSchema, formData);
  if (!parsed.success) return parsed.state;

  const fertilizer = await prisma.fertilizer.create({ data: parsed.data });
  revalidateFertilizerPages();
  redirect(`/fertilizers/${fertilizer.id}`);
}

export async function updateFertilizer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  // Stock is changed only through usage / restock records, so it is not editable here.
  const parsed = parseForm(fertilizerSchema.omit({ currentStock: true }), formData);
  if (!parsed.success) return parsed.state;

  await prisma.fertilizer.update({ where: { id }, data: parsed.data });
  revalidateFertilizerPages(id);
  return { ok: true, message: "Fertilizer details updated." };
}

export async function deleteFertilizer(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.fertilizer.delete({ where: { id } });
  revalidateFertilizerPages();
  redirect("/fertilizers");
}

// Usage ----------------------------------------------------------------------

const usageSchema = z.object({
  fertilizerId: z.string().min(1),
  cropId: z.string({ required_error: "Select a crop" }).min(1),
  date: zDate,
  quantity: zPositive,
  notes: zOptionalText,
});

export async function recordUsage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(usageSchema, formData);
  if (!parsed.success) return parsed.state;
  const data = parsed.data;

  const fertilizer = await prisma.fertilizer.findUnique({ where: { id: data.fertilizerId } });
  if (!fertilizer) return { ok: false, message: "Fertilizer not found." };
  if (data.quantity > fertilizer.currentStock) {
    return {
      ok: false,
      message: `Only ${fertilizer.currentStock} ${fertilizer.unit} in stock.`,
      errors: { quantity: ["Not enough stock"] },
    };
  }

  await prisma.$transaction([
    prisma.fertilizerUsage.create({ data }),
    prisma.fertilizer.update({
      where: { id: data.fertilizerId },
      data: { currentStock: { decrement: data.quantity } },
    }),
  ]);

  revalidateFertilizerPages(data.fertilizerId);
  return { ok: true, message: "Usage recorded and stock updated." };
}

export async function deleteUsage(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const usage = await prisma.fertilizerUsage.findUnique({ where: { id } });
  if (!usage) return;

  await prisma.$transaction([
    prisma.fertilizerUsage.delete({ where: { id } }),
    prisma.fertilizer.update({
      where: { id: usage.fertilizerId },
      data: { currentStock: { increment: usage.quantity } },
    }),
  ]);
  revalidateFertilizerPages(usage.fertilizerId);
}

// Purchases (restock) --------------------------------------------------------

const purchaseSchema = z.object({
  fertilizerId: z.string().min(1),
  date: zDate,
  quantity: zPositive,
  totalCost: zNonNegative,
});

/** Restocks a fertilizer and records the cost as a FERTILIZER expense. */
export async function recordPurchase(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(purchaseSchema, formData);
  if (!parsed.success) return parsed.state;
  const data = parsed.data;

  const fertilizer = await prisma.fertilizer.findUnique({ where: { id: data.fertilizerId } });
  if (!fertilizer) return { ok: false, message: "Fertilizer not found." };

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        date: data.date,
        category: "FERTILIZER",
        description: `${fertilizer.name} - ${data.quantity} ${fertilizer.unit}`,
        amount: data.totalCost,
      },
    });
    await tx.fertilizerPurchase.create({
      data: { ...data, expenseId: expense.id },
    });
    await tx.fertilizer.update({
      where: { id: data.fertilizerId },
      data: { currentStock: { increment: data.quantity } },
    });
  });

  revalidateFertilizerPages(data.fertilizerId);
  revalidatePath("/expenses");
  return { ok: true, message: "Stock added and expense recorded." };
}

export async function deletePurchase(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const purchase = await prisma.fertilizerPurchase.findUnique({ where: { id } });
  if (!purchase) return;

  await prisma.$transaction(async (tx) => {
    await tx.fertilizerPurchase.delete({ where: { id } });
    if (purchase.expenseId) await tx.expense.deleteMany({ where: { id: purchase.expenseId } });
    await tx.fertilizer.update({
      where: { id: purchase.fertilizerId },
      data: { currentStock: { decrement: purchase.quantity } },
    });
  });

  revalidateFertilizerPages(purchase.fertilizerId);
  revalidatePath("/expenses");
}
