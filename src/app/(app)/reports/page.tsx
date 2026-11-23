import Link from "next/link";
import { FileSpreadsheet, FileText, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { PrintButton } from "@/components/print-button";
import { ReportView } from "@/components/report-view";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form-controls";
import { cropLabel } from "@/lib/crops";
import { findNavItem } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import {
  REPORT_MODULES,
  REPORT_TYPES,
  buildReport,
  reportConfig,
  reportQuery,
  reportsForModule,
  resolveReportParams,
} from "@/lib/reports";

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
  const cfg = reportConfig(type);

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Reports"
          description="Reports for every module - crops, harvests, fertilizers, inventory, sales, expenses and finance. Filter, print, or download as PDF / Excel."
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

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {REPORT_MODULES.map((m) => {
            const Icon = findNavItem(`/${m.toLowerCase()}`)?.icon;
            const types = reportsForModule(m);
            const activeModule = types.includes(type);
            return (
              <div
                key={m}
                className={cn(
                  "animate-fade-up rounded-2xl border bg-white/95 p-4 shadow-soft transition hover:shadow-lift",
                  activeModule ? "border-gold-300 ring-2 ring-gold-200" : "border-gray-200/70",
                )}
              >
                <div className="mb-3 flex items-center gap-3">
                  {Icon && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white shadow-md shadow-green-900/20">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                  )}
                  <p className="font-bold text-gray-900">{m}</p>
                </div>
                <ul className="space-y-1">
                  {types.map((t) => (
                    <li key={t}>
                      <Link
                        href={`/reports?type=${t}`}
                        className={cn(
                          "block rounded-lg px-2.5 py-1.5 text-sm transition",
                          t === type
                            ? "bg-gradient-to-r from-green-600 to-green-700 font-semibold text-white"
                            : "text-gray-600 hover:bg-green-50 hover:text-green-800",
                        )}
                      >
                        {REPORT_TYPES[t].label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

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
            <Select id="type" name="type" defaultValue={type} className="w-72">
              {REPORT_MODULES.map((m) => (
                <optgroup key={m} label={m}>
                  {reportsForModule(m).map((t) => (
                    <option key={t} value={t}>
                      {REPORT_TYPES[t].label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
          {!cfg.snapshot && (
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
