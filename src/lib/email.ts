import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
  });
}

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

/** Sends one e-mail. Returns false when SMTP is not configured. */
export async function sendMail(message: { to: string; subject: string; text: string; html?: string }) {
  const transport = getTransport();
  if (!transport) return false;
  await transport.sendMail({ from: process.env.SMTP_FROM ?? "AgriTrack <no-reply@example.com>", ...message });
  return true;
}

/**
 * E-mails all notifications that have not been e-mailed yet as one digest.
 * Does nothing when SMTP or NOTIFY_EMAIL_TO is not configured.
 */
export async function sendPendingNotificationEmails(): Promise<number> {
  const transport = getTransport();
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!transport || !to) return 0;

  const pending = await prisma.notification.findMany({
    where: { emailed: false },
    orderBy: { createdAt: "asc" },
  });
  if (pending.length === 0) return 0;

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
  const lines = pending.map((n) => `- ${n.title}\n  ${n.message}${n.link && baseUrl ? `\n  ${baseUrl}${n.link}` : ""}`);

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? "AgriTrack <no-reply@example.com>",
    to,
    subject: `AgriTrack: ${pending.length} new alert(s)`,
    text: `The following polytunnel alerts need attention:\n\n${lines.join("\n\n")}\n\n- AgriTrack`,
  });

  await prisma.notification.updateMany({
    where: { id: { in: pending.map((n) => n.id) } },
    data: { emailed: true },
  });
  return pending.length;
}
