import { NextResponse } from "next/server";
import { syncNotifications } from "@/lib/notifications";
import { sendPendingNotificationEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Scheduled job (see vercel.json): refreshes alerts and e-mails new ones.
 * Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncNotifications();
  const emailed = await sendPendingNotificationEmails();
  return NextResponse.json({ ...result, emailed });
}
