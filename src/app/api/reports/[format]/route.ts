import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildReport } from "@/lib/reports";
import { renderReportPdf } from "@/lib/report-pdf";
import { renderReportExcel } from "@/lib/report-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ format: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { format } = await params;
  if (format !== "pdf" && format !== "excel") {
    return NextResponse.json({ error: "Unknown format" }, { status: 404 });
  }

  const sp = new URL(request.url).searchParams;
  const report = await buildReport({
    type: sp.get("type") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    cropId: sp.get("cropId") ?? undefined,
  });

  const fileBase = `agritrack-${report.type}-${new Date().toISOString().slice(0, 10)}`;

  if (format === "pdf") {
    const pdf = await renderReportPdf(report);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
      },
    });
  }

  const xlsx = await renderReportExcel(report);
  return new NextResponse(new Uint8Array(xlsx), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileBase}.xlsx"`,
    },
  });
}
