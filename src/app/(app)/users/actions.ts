"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { parseForm } from "@/lib/forms";
import type { ActionState } from "@/components/form-helpers";

const userSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1).max(100),
  email: z.string({ required_error: "Email is required" }).email("Enter a valid email"),
  password: z.string({ required_error: "Password is required" }).min(8, "At least 8 characters"),
  role: z.enum(["ADMIN", "STAFF"]),
});

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseForm(userSchema, formData);
  if (!parsed.success) return parsed.state;

  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    return { ok: false, message: "A user with this email already exists.", errors: { email: ["Already in use"] } };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      role: parsed.data.role,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    },
  });
  revalidatePath("/users");
  return { ok: true, message: `Account created for ${parsed.data.name}.` };
}

const resetSchema = z.object({
  id: z.string().min(1),
  password: z.string({ required_error: "Password is required" }).min(8, "At least 8 characters"),
});

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseForm(resetSchema, formData);
  if (!parsed.success) return parsed.state;

  await prisma.user.update({
    where: { id: parsed.data.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
  });
  return { ok: true, message: "Password updated." };
}

export async function toggleActive(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === admin.id) return; // cannot deactivate yourself
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  revalidatePath("/users");
}

export async function changeRole(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "STAFF";
  if (id === admin.id) return; // keep at least the current admin
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/users");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === admin.id) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
}
