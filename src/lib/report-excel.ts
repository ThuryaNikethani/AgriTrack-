import ExcelJS from "exceljs";
import type { CellFormat, Report } from "@/lib/report-format";

const NUM_FORMATS: Partial<Record<CellFormat, string>> = {
  currency: '"LKR" #,##0.00',
  kg: '#,##0.00 "kg"',
  number: "#,##0.##",
  percent: '0.0"%"',
  date: "dd mmm yyyy",
};

const GREEN = "FF15803D";
const FILLS = { danger: "FFFEE2E2", warning: "FFFEF3C7" } as const;

export async function renderReportExcel(report: Report): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "AgriTrack";
  wb.created = new Date();

  const ws = wb.addWorksheet(report.title.slice(0, 31));
  const maxCols = Math.max(...report.sections.map((s) => s.columns.length), 2);

  const titleRow = ws.addRow([report.title]);
  titleRow.font = { bold: true, size: 14, color: { argb: GREEN } };
  ws.mergeCells(titleRow.number, 1, titleRow.number, maxCols);
  ws.addRow([report.subtitle]).font = { italic: true, color: { argb: "FF4B5563" } };
  ws.addRow([`Generated ${report.generatedAt} - AgriTrack, Kurunduwatta Villa & Cottages`]).font = {
    size: 9,
    color: { argb: "FF6B7280" },
  };
  ws.addRow([]);

  for (const s of report.summary) {
    const row = ws.addRow([s.label, s.value]);
    row.getCell(1).font = { bold: true };
  }

  for (const section of report.sections) {
    ws.addRow([]);
    if (section.title) ws.addRow([section.title]).font = { bold: true, size: 12 };

    const header = ws.addRow(section.columns.map((c) => c.header));
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } };
      cell.border = { bottom: { style: "thin" } };
    });

    for (const r of section.rows) {
      const values = section.columns.map((c) => {
        const v = r[c.key];
        if (v === null || v === undefined) return null;
        if (c.format === "date") return new Date(v);
        return v;
      });
      const row = ws.addRow(values);
      section.columns.forEach((c, i) => {
        const fmt = c.format ? NUM_FORMATS[c.format] : undefined;
        if (fmt) row.getCell(i + 1).numFmt = fmt;
      });
      if (r._highlight) {
        row.eachCell({ includeEmpty: true }, (cell, col) => {
          if (col <= section.columns.length) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FILLS[r._highlight!] } };
          }
        });
      }
    }

    if (section.totals) {
      const row = ws.addRow(section.columns.map((c) => section.totals?.[c.key] ?? null));
      row.font = { bold: true };
      section.columns.forEach((c, i) => {
        const fmt = c.format ? NUM_FORMATS[c.format] : undefined;
        if (fmt && typeof section.totals?.[c.key] === "number") row.getCell(i + 1).numFmt = fmt;
        row.getCell(i + 1).border = { top: { style: "thin" } };
      });
    }
  }

  if (report.notes?.length) {
    ws.addRow([]);
    for (const n of report.notes) ws.addRow([n]).font = { italic: true, size: 9 };
  }

  ws.columns.forEach((col) => {
    let width = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      if (cell.isMerged) return;
      const len = cell.value instanceof Date ? 12 : String(cell.value ?? "").length;
      width = Math.max(width, Math.min(len + 2, 45));
    });
    col.width = width;
  });

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
