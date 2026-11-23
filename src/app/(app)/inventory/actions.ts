"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseForm, zDate, zNonNegative, zOptionalText, zPositive } from "@/lib/forms";
import type { ActionState } from "@/components/form-helpers";

function revalidateInventory() {
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

const itemSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1).max(100),
  category: z.enum(["SEED", "SUPPLY", "EQUIPMENT"]),
  unit: z.string({ required_error: "Unit is required" }).min(1).max(20),
  quantity: zNonNegative.default(0),
  reorderLevel: zNonNegative.default(0),
  notes: zOptionalText,
});

export async function createItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(itemSchema, formData);
  if (!parsed.success) return parsed.state;

  await prisma.inventoryItem.create({ data: parsed.data });
  revalidateInventory();
  return { ok: true, message: `${parsed.data.name} added to inventory.` };
}

export async function deleteItem(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.inventoryItem.delete({ where: { id } });
  revalidateInventory();
}

const movementSchema = z.object({
  itemId: z.string({ required_error: "Select an item" }).min(1),
  type: z.enum(["IN", "OUT"]),
  date: zDate,
  quantity: zPositive,
  note: zOptionalText,
});

/** Stock in (purchase) or stock out (used / issued). */
export async function recordMovement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(movementSchema, formData);
  if (!parsed.success) return parsed.state;
  const data = parsed.data;

  const item = await prisma.inventoryItem.findUnique({ where: { id: data.itemId } });
  if (!item) return { ok: false, message: "Item not found." };
  if (data.type === "OUT" && data.quantity > item.quantity) {
    return {
      ok: false,
      message: `Only ${item.quantity} ${item.unit} of ${item.name} in stock.`,
      errors: { quantity: ["Not enough stock"] },
    };
  }

  await prisma.$transaction([
    prisma.inventoryMovement.create({ data }),
    prisma.inventoryItem.update({
      where: { id: data.itemId },
      data: { quantity: data.type === "IN" ? { increment: data.quantity } : { decrement: data.quantity } },
    }),
  ]);

  revalidateInventory();
  return { ok: true, message: "Stock updated." };
}
