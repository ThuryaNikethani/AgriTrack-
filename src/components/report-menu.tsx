import Link from "next/link";
import { ChevronDown, Eye, FileBarChart, FileSpreadsheet, FileText } from "lucide-react";
import { REPORT_TYPES, reportsForModule, type ReportModule } from "@/lib/reports";

/**
 * "Reports" dropdown shown in a module's page banner. Lists that module's reports
 * with View / PDF / Excel links, carrying the page's current filters.
 */
export function ReportMenu({
  module,
  from,
  to,
  cropId,
}: {
  module: ReportModule;
  from?: string;
  to?: string;
  cropId?: string;
}) {
  const types = reportsForModule(module);

  const query = (type: string) => {
    const q = new URLSearchParams({ type });
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    if (cropId) q.set("cropId", cropId);
    return q.toString();
  };

  return (
    <details className="group relative">
      <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-green-900 shadow-soft ring-1 ring-inset ring-white/40 transition hover:bg-gold-50 [&::-webkit-details-marker]:hidden">
        <FileBarChart className="h-4 w-4 text-gold-600" />
        Reports
        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] animate-fade-up overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-gray-800 shadow-lift">
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-gold-50/60 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-700">{module} reports</p>
          <p className="text-xs text-gray-500">View & print, or download as PDF / Excel</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {types.map((t) => (
            <li key={t} className="px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{REPORT_TYPES[t].label}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Link
                  href={`/reports?${query(t)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800 ring-1 ring-inset ring-green-200 hover:bg-green-100"
                >
                  <Eye className="h-3.5 w-3.5" /> View / Print
                </Link>
                <a
                  href={`/api/reports/pdf?${query(t)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-700 ring-1 ring-inset ring-gold-200 hover:bg-gold-100"
                >
                  <FileText className="h-3.5 w-3.5" /> PDF
                </a>
                <a
                  href={`/api/reports/excel?${query(t)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
