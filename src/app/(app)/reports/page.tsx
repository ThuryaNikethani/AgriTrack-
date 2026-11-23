import { FileSpreadsheet, FileText, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { PrintButton } from "@/components/print-button";
import { ReportView } from "@/components/report-view";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form-controls";
import { cropLabel } from "@/lib/crops";
import { REPORT_TYPES, buildReport, reportQuery, resolveReportParams, type ReportType } from "@/lib/reports";

export const metadata = { title: "Reports" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; from?: string; to?: string; cropId?: string }>;
}) {
  const params = await searchParams;
  const { type, range, cropId } = resolveReportParams(params);
  const [report, crops] = await Promise.all([
    buildReport(params),
    prisma.crop.findMany({ orderBy: [{ status: "asc" }, { name: "asc" }] }),
  ]);
  const query = reportQuery({ type, from: range.fromInput, to: range.toInput, cropId });
  const cfg = REPORT_TYPES[type];

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Reports"
          description="Daily, monthly and annual reports. Filter, print, or download as PDF / Excel."
          actions={
            <>
              <PrintButton />
              <a href={`/api/reports/pdf?${query}`} className={buttonVariants({ variant: "gold" })}>
                <FileText /> PDF
              </a>
              <a href={`/api/reports/excel?${query}`} className={buttonVariants({ variant: "outline" })}>
                <FileSpreadsheet /> Excel
              </a>
            </>
          }
        />

        <form
          method="get"
          className="mb-6 flex animate-fade-up flex-wrap items-end gap-4 rounded-2xl border border-gray-200/70 bg-white/95 p-5 shadow-soft"
        >
          <div className="flex items-center gap-3 self-center pr-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-200 to-gold-400 text-green-950">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900">Report options</p>
              <p className="text-xs text-gray-500">Type, period and crop</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="type">Report</Label>
            <Select id="type" name="type" defaultValue={type} className="w-64">
              {(Object.keys(REPORT_TYPES) as ReportType[]).map((t) => (
                <option key={t} value={t}>
                  {REPORT_TYPES[t].label}
                </option>
              ))}
            </Select>
          </div>
          {type !== "inventory" && (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="from">From</Label>
                <Input id="from" name="from" type="date" defaultValue={range.fromInput} className="w-40" />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="to">To</Label>
                <Input id="to" name="to" type="date" defaultValue={range.toInput} className="w-40" />
              </div>
            </>
          )}
          {cfg.usesCrop && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="cropId">Crop</Label>
              <Select id="cropId" name="cropId" defaultValue={cropId ?? ""} className="w-56">
                <option value="">All crops</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {cropLabel(c)}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <Button type="submit">Generate</Button>
        </form>
      </div>

      <ReportView report={report} />
    </>
  );
}
