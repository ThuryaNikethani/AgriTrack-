import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/** Reset links are valid for 1 hour and can be used once. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
/** A new link is not created if one was requested less than 2 minutes ago. */
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Creates a reset token for the user and returns the raw token (only its hash is stored). */
export async function createResetToken(userId: string): Promise<string | null> {
  const recent = await prisma.passwordResetToken.findFirst({
    where: { userId, usedAt: null, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
  });
  if (recent) return null;

  // Old unused links stop working when a new one is issued.
  await prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } });

  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });
  return token;
}

/** Returns the token record if it exists, is unused and has not expired. */
export async function findValidToken(token: string) {
  if (!token) return null;
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, active: true } } },
  });
  if (!record || record.usedAt || record.expiresAt < new Date() || !record.user.active) return null;
  return record;
}
