import { cn } from "@/lib/utils";
import { formatCell, isNumericFormat, type Report } from "@/lib/report-format";

/** Print-ready HTML rendering of a report. */
export function ReportView({ report }: { report: Report }) {
  return (
    <article className="report rounded-lg border border-gray-200 bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none">
      {/* Company letterhead: logo left, company / report / print details centred, thick rule below. */}
      <header className="mb-4 grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b-[5px] border-green-950 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/athukorala-logo.png" alt="Athukorala Group" className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
        <div className="text-center">
          <p className="text-2xl font-extrabold tracking-wide text-green-700 sm:text-4xl">ATHUKORALA GROUP (PVT) LTD</p>
          <p className="mt-2 text-lg font-bold text-gray-900 sm:text-xl">
            {report.title} · {report.period}
          </p>
          <p className="mt-1.5 text-sm text-gray-600">
            Printed on: {report.generatedAt}
            {report.printedBy && <> | Printed by: {report.printedBy}</>}
          </p>
        </div>
        {/* keeps the text block centred on the page */}
        <span className="h-24 w-24 sm:h-28 sm:w-28" aria-hidden="true" />
      </header>
      {report.filters.length > 0 && (
        <p className="mb-4 text-center text-sm font-medium text-gray-700">{report.filters.join(" | ")}</p>
      )}

      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
        {report.summary.map((s) => (
          <div key={s.label} className="rounded-md bg-gray-50 p-3 print:bg-transparent print:p-1">
            <dt className="text-[12px] uppercase tracking-wide text-gray-500">{s.label}</dt>
            <dd className="mt-0.5 font-semibold text-gray-900">{s.value}</dd>
          </div>
        ))}
      </dl>

      {report.sections.map((section, idx) => (
        <section key={idx} className="mb-6 break-inside-avoid-page">
          {section.title && <h3 className="mb-2 font-semibold text-gray-900">{section.title}</h3>}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm print:text-[11px]">
              <thead>
                <tr className="bg-green-700 text-white print:bg-green-700">
                  {section.columns.map((c) => (
                    <th
                      key={c.key}
                      className={cn(
                        "border border-gray-300 px-2 py-1.5 font-semibold",
                        isNumericFormat(c.format) ? "text-right" : "text-left",
                      )}
                    >
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.length === 0 && (
                  <tr>
                    <td colSpan={section.columns.length} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                      No records for this period.
                    </td>
                  </tr>
                )}
                {section.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(row._highlight === "danger" && "bg-red-50", row._highlight === "warning" && "bg-amber-50")}
                  >
                    {section.columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          "border border-gray-300 px-2 py-1.5",
                          isNumericFormat(c.format) ? "text-right tabular-nums" : "text-left",
                        )}
                      >
                        {formatCell(row[c.key], c.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {section.totals && (
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    {section.columns.map((c) => {
                      const v = section.totals?.[c.key];
                      return (
                        <td
                          key={c.key}
                          className={cn(
                            "border border-gray-300 px-2 py-1.5",
                            isNumericFormat(c.format) ? "text-right tabular-nums" : "text-left",
                          )}
                        >
                          {v === undefined ? "" : formatCell(v, typeof v === "number" ? c.format : "text")}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      ))}

      {report.notes?.map((n) => (
        <p key={n} className="text-xs text-gray-500">
          {n}
        </p>
      ))}
      <p className="mt-4 text-xs text-gray-400">AgriTrack · Kurunduwatta Villa &amp; Cottages Polytunnel</p>
    </article>
  );
}
