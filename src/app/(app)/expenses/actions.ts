"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseForm, zDate, zPositive } from "@/lib/forms";
import type { ActionState } from "@/components/form-helpers";

const expenseSchema = z.object({
  date: zDate,
  category: z.enum(["FERTILIZER", "SEEDS", "LABOUR", "EQUIPMENT", "MAINTENANCE", "OTHER"]),
  description: z.string({ required_error: "Description is required" }).min(1).max(300),
  amount: zPositive,
  cropId: z.string().optional(),
});

export async function createExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(expenseSchema, formData);
  if (!parsed.success) return parsed.state;

  await prisma.expense.create({ data: parsed.data });

  revalidatePath("/expenses");
  if (parsed.data.cropId) revalidatePath(`/crops/${parsed.data.cropId}`);
  revalidatePath("/dashboard");
  return { ok: true, message: "Expense recorded." };
}

export async function deleteExpense(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { fertilizerPurchase: true },
  });
  if (!expense) return;
  if (expense.fertilizerPurchase) {
    // Fertilizer purchases must be removed from the fertilizer page so stock stays correct.
    return;
  }
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  if (expense.cropId) revalidatePath(`/crops/${expense.cropId}`);
  revalidatePath("/dashboard");
}
