"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseForm } from "@/lib/forms";
import { isEmailConfigured, sendMail } from "@/lib/email";
import { createResetToken, findValidToken } from "@/lib/password-reset";
import type { ActionState } from "@/components/form-helpers";

async function baseUrl() {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// The same message is shown whether or not the e-mail exists, so accounts cannot be discovered.
const SENT_MESSAGE =
  "If an account exists for that email, a password reset link has been sent. The link is valid for 1 hour.";

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(z.object({ email: z.string({ required_error: "Enter your email" }).email("Enter a valid email") }), formData);
  if (!parsed.success) return parsed.state;

  if (!isEmailConfigured()) {
    return {
      ok: false,
      message: "Password reset by email is not set up yet. Please ask your AgriTrack administrator to reset your password.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (user?.active) {
    const token = await createResetToken(user.id);
    if (token) {
      const link = `${await baseUrl()}/reset-password?token=${token}`;
      await sendMail({
        to: user.email,
        subject: "AgriTrack - reset your password",
        text:
          `Hello ${user.name},\n\n` +
          `We received a request to reset your AgriTrack password.\n` +
          `Open this link to choose a new password (valid for 1 hour):\n\n${link}\n\n` +
          `If you did not ask for this, you can ignore this email - your password will not change.\n\n` +
          `Athukorala Group (Pvt) Ltd - AgriTrack`,
      });
    }
  }
  return { ok: true, message: SENT_MESSAGE };
}

const resetSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string({ required_error: "Enter a new password" }).min(8, "At least 8 characters"),
    confirmPassword: z.string({ required_error: "Confirm the new password" }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(resetSchema, formData);
  if (!parsed.success) return parsed.state;

  const record = await findValidToken(parsed.data.token);
  if (!record) {
    return { ok: false, message: "This reset link is invalid or has expired. Please request a new one." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
  ]);

  redirect("/login?reset=1");
}
