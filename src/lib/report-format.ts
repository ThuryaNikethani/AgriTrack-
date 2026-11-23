import { format } from "date-fns";

/** Shared report types and cell formatting (used by the web preview, PDF and Excel). */

export type CellFormat = "text" | "date" | "currency" | "kg" | "number" | "percent";

export type ReportColumn = {
  key: string;
  header: string;
  format?: CellFormat;
};

export type ReportCell = string | number | null;

export type ReportRow = Record<string, ReportCell> & { _highlight?: "danger" | "warning" | null };

export type ReportSection = {
  title?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  totals?: Record<string, ReportCell>;
};

export type Report = {
  type: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  summary: { label: string; value: string }[];
  sections: ReportSection[];
  notes?: string[];
};

export function isNumericFormat(f?: CellFormat) {
  return f === "currency" || f === "kg" || f === "number" || f === "percent";
}

export function formatCell(value: ReportCell | undefined, f: CellFormat = "text"): string {
  if (value === null || value === undefined || value === "") return "-";
  switch (f) {
    case "date":
      return format(new Date(value), "dd MMM yyyy");
    case "currency":
      return `LKR ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "kg":
      return `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} kg`;
    case "number":
      return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
    case "percent":
      return `${Number(value).toFixed(1)}%`;
    default:
      return String(value);
  }
}

export function formatLkr(value: number) {
  return formatCell(value, "currency");
}
