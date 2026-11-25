"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseForm } from "@/lib/forms";
import type { ActionState } from "@/components/form-helpers";

const changeSchema = z
  .object({
    currentPassword: z.string({ required_error: "Enter your current password" }).min(1),
    newPassword: z.string({ required_error: "Enter a new password" }).min(8, "At least 8 characters"),
    confirmPassword: z.string({ required_error: "Confirm the new password" }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Choose a password different from the current one",
    path: ["newPassword"],
  });

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sessionUser = await requireUser();
  const parsed = parseForm(changeSchema, formData);
  if (!parsed.success) return parsed.state;

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return { ok: false, message: "Account not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, message: "Current password is incorrect.", errors: { currentPassword: ["Incorrect password"] } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });
  return { ok: true, message: "Your password has been changed." };
}
