import { format, startOfDay, startOfYear, subYears } from "date-fns";
import { prisma } from "@/lib/prisma";
import { cropLabel } from "@/lib/crops";
import { parseDateRange, type DateRange } from "@/lib/date-range";
import { expenseCategoryLabel } from "@/lib/expenses";
import { getCropProfitability, getFinancialSummary, getPeriodSeries } from "@/lib/finance";
import { getQuantity, getTiming, isCompleted, timingBadge, quantityBadge } from "@/lib/harvest";
import { customerTypeLabel } from "@/lib/sales";
import { getStockStatus, stockBadge } from "@/lib/stock";
import { enumLabel, toNumber } from "@/lib/utils";
import { formatLkr, type Report, type ReportRow } from "@/lib/report-format";

export const REPORT_TYPES = {
  cultivation: { label: "Daily Cultivation Report", daily: true, usesCrop: true },
  harvest: { label: "Daily Harvest Report", daily: true, usesCrop: true },
  sales: { label: "Daily Sales Report", daily: true, usesCrop: true },
  expenses: { label: "Daily Expense Report", daily: true, usesCrop: true },
  "monthly-financial": { label: "Monthly Financial Report", daily: false, usesCrop: false },
  "annual-financial": { label: "Annual Financial Report", daily: false, usesCrop: false },
  "crop-performance": { label: "Crop Performance Report", daily: false, usesCrop: true },
  "fertilizer-usage": { label: "Fertilizer Usage Report", daily: false, usesCrop: true },
  "profit-loss": { label: "Profit & Loss Report", daily: false, usesCrop: false },
  inventory: { label: "Inventory Report", daily: false, usesCrop: false },
} as const;

export type ReportType = keyof typeof REPORT_TYPES;

export type ReportParams = { type?: string; from?: string; to?: string; cropId?: string };

export function resolveReportParams(params: ReportParams) {
  const type: ReportType = params.type && params.type in REPORT_TYPES ? (params.type as ReportType) : "harvest";
  const cfg = REPORT_TYPES[type];

  let defaultFrom: Date | undefined;
  if (cfg.daily) defaultFrom = startOfDay(new Date());
  else if (type === "monthly-financial") defaultFrom = startOfYear(new Date());
  else if (type === "annual-financial") defaultFrom = startOfYear(subYears(new Date(), 4));

  const range = parseDateRange(params, defaultFrom);
  const cropId = cfg.usesCrop && params.cropId ? params.cropId : undefined;
  return { type, range, cropId };
}

function subtitle(range: DateRange, cropName?: string) {
  const sameDay = range.fromInput === range.toInput;
  const period = sameDay
    ? format(range.from, "dd MMM yyyy")
    : `${format(range.from, "dd MMM yyyy")} - ${format(range.to, "dd MMM yyyy")}`;
  return cropName ? `${period} | Crop: ${cropName}` : period;
}

const sum = (rows: ReportRow[], key: string) => rows.reduce((s, r) => s + toNumber(r[key]), 0);

export async function buildReport(params: ReportParams): Promise<Report> {
  const { type, range, cropId } = resolveReportParams(params);
  const crop = cropId ? await prisma.crop.findUnique({ where: { id: cropId } }) : null;
  const base = {
    type,
    title: REPORT_TYPES[type].label,
    subtitle: type === "inventory" ? `As at ${format(new Date(), "dd MMM yyyy")}` : subtitle(range, crop ? cropLabel(crop) : undefined),
    generatedAt: format(new Date(), "dd MMM yyyy HH:mm"),
  };
  const dates = { gte: range.from, lte: range.to };

  switch (type) {
    case "cultivation": {
      const [crops, usages, harvests] = await Promise.all([
        prisma.crop.findMany({
          where: {
            id: cropId,
            OR: [{ status: { in: ["GROWING", "HARVESTING"] } }, { plantedDate: dates }],
          },
          orderBy: { plantedDate: "asc" },
        }),
        prisma.fertilizerUsage.findMany({
          where: { date: dates, cropId },
          include: { crop: true, fertilizer: true },
          orderBy: { date: "asc" },
        }),
        prisma.harvest.count({ where: { actualDate: dates, cropId } }),
      ]);
      const cropRows: ReportRow[] = crops.map((c) => ({
        crop: cropLabel(c),
        status: enumLabel(c.status),
        planted: c.plantedDate.toISOString(),
        expectedHarvest: c.expectedHarvestDate.toISOString(),
        plants: c.plantedQuantity,
        expectedYield: c.expectedYieldKg,
      }));
      const usageRows: ReportRow[] = usages.map((u) => ({
        date: u.date.toISOString(),
        crop: cropLabel(u.crop),
        fertilizer: u.fertilizer.name,
        quantity: `${u.quantity} ${u.fertilizer.unit}`,
        notes: u.notes,
      }));
      return {
        ...base,
        summary: [
          { label: "Active crops", value: String(crops.filter((c) => c.status === "GROWING" || c.status === "HARVESTING").length) },
          { label: "Fertilizer applications", value: String(usages.length) },
          { label: "Harvests recorded", value: String(harvests) },
        ],
        sections: [
          {
            title: "Crops in the polytunnel",
            columns: [
              { key: "crop", header: "Crop" },
              { key: "status", header: "Status" },
              { key: "planted", header: "Planted", format: "date" },
              { key: "expectedHarvest", header: "Expected harvest", format: "date" },
              { key: "plants", header: "Plants", format: "number" },
              { key: "expectedYield", header: "Expected yield", format: "kg" },
            ],
            rows: cropRows,
          },
          {
            title: "Fertilizer applied",
            columns: [
              { key: "date", header: "Date", format: "date" },
              { key: "crop", header: "Crop" },
              { key: "fertilizer", header: "Fertilizer" },
              { key: "quantity", header: "Quantity" },
              { key: "notes", header: "Notes" },
            ],
            rows: usageRows,
          },
        ],
      };
    }

    case "harvest": {
      const harvests = await prisma.harvest.findMany({
        where: { cropId, OR: [{ scheduledDate: dates }, { actualDate: dates }] },
        include: { crop: true },
        orderBy: { scheduledDate: "asc" },
      });
      const rows: ReportRow[] = harvests.map((h) => {
        const timing = getTiming(h);
        const qty = getQuantity(h);
        return {
          crop: cropLabel(h.crop),
          scheduled: h.scheduledDate.toISOString(),
          expected: h.expectedQuantityKg,
          harvested: h.actualDate?.toISOString() ?? null,
          actual: h.actualQuantityKg,
          variance: qty ? qty.variancePct : null,
          timing: timingBadge[timing.status].label(timing.days),
          quantity: qty ? quantityBadge[qty.status].label : null,
          _highlight:
            timing.status === "OVERDUE" || timing.status === "LATE" || qty?.status === "BELOW"
              ? "danger"
              : timing.status === "DUE_SOON"
                ? "warning"
                : null,
        };
      });
      const completed = harvests.filter(isCompleted);
      return {
        ...base,
        summary: [
          { label: "Harvests", value: String(harvests.length) },
          { label: "Completed", value: String(completed.length) },
          { label: "Total harvested", value: `${sum(rows, "actual").toFixed(2)} kg` },
          { label: "Late / overdue", value: String(harvests.filter((h) => ["LATE", "OVERDUE"].includes(getTiming(h).status)).length) },
          { label: "Below target", value: String(harvests.filter((h) => getQuantity(h)?.status === "BELOW").length) },
        ],
        sections: [
          {
            columns: [
              { key: "crop", header: "Crop" },
              { key: "scheduled", header: "Scheduled", format: "date" },
              { key: "expected", header: "Expected", format: "kg" },
              { key: "harvested", header: "Harvested on", format: "date" },
              { key: "actual", header: "Actual", format: "kg" },
              { key: "variance", header: "Variance", format: "percent" },
              { key: "timing", header: "Timing" },
              { key: "quantity", header: "Quantity status" },
            ],
            rows,
            totals: { crop: "Total", expected: sum(rows, "expected"), actual: sum(rows, "actual") },
          },
        ],
        notes: ["Highlighted rows: overdue, late or below the expected quantity."],
      };
    }

    case "sales": {
      const sales = await prisma.sale.findMany({
        where: { saleDate: dates, cropId },
        include: { crop: true },
        orderBy: { saleDate: "asc" },
      });
      const rows: ReportRow[] = sales.map((s) => ({
        date: s.saleDate.toISOString(),
        crop: cropLabel(s.crop),
        quantity: s.quantityKg,
        unitPrice: toNumber(s.unitPrice),
        total: toNumber(s.totalAmount),
        customer: customerTypeLabel[s.customerType] + (s.customerName ? ` (${s.customerName})` : ""),
      }));
      const byType = (t: string) =>
        sales.filter((s) => s.customerType === t).reduce((a, s) => a + toNumber(s.totalAmount), 0);
      return {
        ...base,
        summary: [
          { label: "Total revenue", value: formatLkr(sum(rows, "total")) },
          { label: "Quantity sold", value: `${sum(rows, "quantity").toFixed(2)} kg` },
          { label: "Villa", value: formatLkr(byType("VILLA")) },
          { label: "Tea Factory", value: formatLkr(byType("TEA_FACTORY")) },
          { label: "External", value: formatLkr(byType("EXTERNAL")) },
        ],
        sections: [
          {
            columns: [
              { key: "date", header: "Date", format: "date" },
              { key: "crop", header: "Vegetable" },
              { key: "quantity", header: "Quantity", format: "kg" },
              { key: "unitPrice", header: "Unit price", format: "currency" },
              { key: "total", header: "Total", format: "currency" },
              { key: "customer", header: "Sold to" },
            ],
            rows,
            totals: { date: "Total", quantity: sum(rows, "quantity"), total: sum(rows, "total") },
          },
        ],
      };
    }

    case "expenses": {
      const expenses = await prisma.expense.findMany({
        where: { date: dates, cropId },
        include: { crop: true },
        orderBy: { date: "asc" },
      });
      const rows: ReportRow[] = expenses.map((e) => ({
        date: e.date.toISOString(),
        category: expenseCategoryLabel[e.category],
        description: e.description,
        crop: e.crop ? cropLabel(e.crop) : "General",
        amount: toNumber(e.amount),
      }));
      const categories = [...new Set(rows.map((r) => String(r.category)))];
      return {
        ...base,
        summary: [
          { label: "Total expenses", value: formatLkr(sum(rows, "amount")) },
          ...categories.map((c) => ({
            label: c,
            value: formatLkr(sum(rows.filter((r) => r.category === c), "amount")),
          })),
        ],
        sections: [
          {
            columns: [
              { key: "date", header: "Date", format: "date" },
              { key: "category", header: "Category" },
              { key: "description", header: "Description" },
              { key: "crop", header: "Crop" },
              { key: "amount", header: "Amount", format: "currency" },
            ],
            rows,
            totals: { date: "Total", amount: sum(rows, "amount") },
          },
        ],
      };
    }

    case "monthly-financial":
    case "annual-financial": {
      const g = type === "monthly-financial" ? "month" : "year";
      const [series, summary] = await Promise.all([
        getPeriodSeries(range.from, range.to, g),
        getFinancialSummary(range.from, range.to),
      ]);
      const rows: ReportRow[] = series.map((r) => ({
        period: r.label,
        revenue: r.revenue,
        expenses: r.expenses,
        profit: r.profit,
        _highlight: r.profit < 0 ? "danger" : null,
      }));
      return {
        ...base,
        summary: [
          { label: "Total revenue", value: formatLkr(summary.totalRevenue) },
          { label: "Total expenses", value: formatLkr(summary.totalExpenses) },
          { label: summary.netProfit >= 0 ? "Net profit" : "Net loss", value: formatLkr(summary.netProfit) },
        ],
        sections: [
          {
            title: g === "month" ? "Monthly summary" : "Annual summary",
            columns: [
              { key: "period", header: g === "month" ? "Month" : "Year" },
              { key: "revenue", header: "Income", format: "currency" },
              { key: "expenses", header: "Expenses", format: "currency" },
              { key: "profit", header: "Net profit / loss", format: "currency" },
            ],
            rows,
            totals: {
              period: "Total",
              revenue: summary.totalRevenue,
              expenses: summary.totalExpenses,
              profit: summary.netProfit,
            },
          },
          {
            title: "Income by customer",
            columns: [
              { key: "label", header: "Customer" },
              { key: "quantityKg", header: "Quantity", format: "kg" },
              { key: "revenue", header: "Income", format: "currency" },
            ],
            rows: summary.revenueByCustomer.map((r) => ({ label: r.label, quantityKg: r.quantityKg, revenue: r.revenue })),
          },
          {
            title: "Expenses by category",
            columns: [
              { key: "label", header: "Category" },
              { key: "amount", header: "Amount", format: "currency" },
            ],
            rows: summary.expenseByCategory.map((e) => ({ label: e.label, amount: e.amount })),
          },
        ],
        notes: ["Highlighted periods made a loss."],
      };
    }

    case "crop-performance": {
      const [crops, profits] = await Promise.all([
        prisma.crop.findMany({
          where: { id: cropId, plantedDate: { lte: range.to } },
          include: { harvests: true },
          orderBy: { plantedDate: "asc" },
        }),
        getCropProfitability(undefined, cropId),
      ]);
      const profitMap = new Map(profits.map((p) => [p.cropId, p]));
      const rows: ReportRow[] = crops.map((c) => {
        const done = c.harvests.filter(isCompleted);
        const harvested = done.reduce((s, h) => s + (h.actualQuantityKg ?? 0), 0);
        const onTime = done.filter((h) => getTiming(h).status !== "LATE").length;
        const below = done.filter((h) => getQuantity(h)?.status === "BELOW").length;
        const achievement = c.expectedYieldKg > 0 ? (harvested / c.expectedYieldKg) * 100 : null;
        const p = profitMap.get(c.id);
        return {
          crop: cropLabel(c),
          status: enumLabel(c.status),
          expectedYield: c.expectedYieldKg,
          harvested,
          achievement,
          onTime: done.length ? (onTime / done.length) * 100 : null,
          below,
          revenue: p?.revenue ?? 0,
          profit: p?.profit ?? 0,
          _highlight: below > 0 || (p?.profit ?? 0) < 0 ? "danger" : null,
        };
      });
      return {
        ...base,
        summary: [
          { label: "Crops", value: String(rows.length) },
          { label: "Total harvested", value: `${sum(rows, "harvested").toFixed(2)} kg` },
          { label: "Total revenue", value: formatLkr(sum(rows, "revenue")) },
          { label: "Total crop profit", value: formatLkr(sum(rows, "profit")) },
        ],
        sections: [
          {
            columns: [
              { key: "crop", header: "Crop" },
              { key: "status", header: "Status" },
              { key: "expectedYield", header: "Expected yield", format: "kg" },
              { key: "harvested", header: "Harvested", format: "kg" },
              { key: "achievement", header: "Yield achieved", format: "percent" },
              { key: "onTime", header: "On-time harvests", format: "percent" },
              { key: "below", header: "Below target", format: "number" },
              { key: "revenue", header: "Revenue", format: "currency" },
              { key: "profit", header: "Profit / loss", format: "currency" },
            ],
            rows,
          },
        ],
        notes: ["Highlighted crops had below-target harvests or made a loss."],
      };
    }

    case "fertilizer-usage": {
      const usages = await prisma.fertilizerUsage.findMany({
        where: { date: dates, cropId },
        include: { crop: true, fertilizer: true },
        orderBy: { date: "asc" },
      });
      const rows: ReportRow[] = usages.map((u) => ({
        date: u.date.toISOString(),
        fertilizer: u.fertilizer.name,
        type: enumLabel(u.fertilizer.type),
        crop: cropLabel(u.crop),
        quantity: u.quantity,
        unit: u.fertilizer.unit,
      }));
      const totals = new Map<string, { name: string; unit: string; quantity: number; uses: number }>();
      for (const u of usages) {
        const t = totals.get(u.fertilizerId) ?? { name: u.fertilizer.name, unit: u.fertilizer.unit, quantity: 0, uses: 0 };
        t.quantity += u.quantity;
        t.uses += 1;
        totals.set(u.fertilizerId, t);
      }
      return {
        ...base,
        summary: [
          { label: "Applications", value: String(usages.length) },
          { label: "Fertilizer types used", value: String(totals.size) },
        ],
        sections: [
          {
            title: "Usage by fertilizer",
            columns: [
              { key: "name", header: "Fertilizer" },
              { key: "uses", header: "Applications", format: "number" },
              { key: "quantity", header: "Total used", format: "number" },
              { key: "unit", header: "Unit" },
            ],
            rows: [...totals.values()].map((t) => ({ ...t })),
          },
          {
            title: "Usage log",
            columns: [
              { key: "date", header: "Date", format: "date" },
              { key: "fertilizer", header: "Fertilizer" },
              { key: "type", header: "Type" },
              { key: "crop", header: "Crop" },
              { key: "quantity", header: "Quantity", format: "number" },
              { key: "unit", header: "Unit" },
            ],
            rows,
          },
        ],
      };
    }

    case "profit-loss": {
      const summary = await getFinancialSummary(range.from, range.to);
      const rows: ReportRow[] = [
        ...summary.revenueByCustomer.map((r) => ({ section: "Income", item: `Sales - ${r.label}`, amount: r.revenue })),
        { section: "Income", item: "Total income", amount: summary.totalRevenue, _highlight: null },
        ...summary.expenseByCategory.map((e) => ({ section: "Expenses", item: e.label, amount: e.amount })),
        { section: "Expenses", item: "Total expenses", amount: summary.totalExpenses },
        {
          section: "Result",
          item: summary.netProfit >= 0 ? "Net profit" : "Net loss",
          amount: summary.netProfit,
          _highlight: summary.netProfit < 0 ? "danger" : null,
        },
      ];
      return {
        ...base,
        summary: [
          { label: "Total income", value: formatLkr(summary.totalRevenue) },
          { label: "Total expenses", value: formatLkr(summary.totalExpenses) },
          { label: summary.netProfit >= 0 ? "Net profit" : "Net loss", value: formatLkr(summary.netProfit) },
          { label: "Profit margin", value: summary.margin == null ? "-" : `${summary.margin}%` },
        ],
        sections: [
          {
            columns: [
              { key: "section", header: "Section" },
              { key: "item", header: "Item" },
              { key: "amount", header: "Amount", format: "currency" },
            ],
            rows,
          },
        ],
        notes: ["Net Profit = Total Revenue - Total Expenses"],
      };
    }

    case "inventory": {
      const [fertilizers, items] = await Promise.all([
        prisma.fertilizer.findMany({ orderBy: { name: "asc" } }),
        prisma.inventoryItem.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
      ]);
      const toRow = (name: string, category: string, qty: number, reorder: number, unit: string): ReportRow => {
        const status = getStockStatus(qty, reorder);
        return {
          name,
          category,
          quantity: qty,
          reorder,
          unit,
          status: stockBadge[status].label,
          _highlight: status === "OUT" ? "danger" : status === "LOW" ? "warning" : null,
        };
      };
      const rows = [
        ...fertilizers.map((f) => toRow(f.name, `Fertilizer (${enumLabel(f.type)})`, f.currentStock, f.reorderLevel, f.unit)),
        ...items.map((i) => toRow(i.name, enumLabel(i.category), i.quantity, i.reorderLevel, i.unit)),
      ];
      return {
        ...base,
        summary: [
          { label: "Items", value: String(rows.length) },
          { label: "Low stock", value: String(rows.filter((r) => r._highlight === "warning").length) },
          { label: "Out of stock", value: String(rows.filter((r) => r._highlight === "danger").length) },
        ],
        sections: [
          {
            columns: [
              { key: "name", header: "Item" },
              { key: "category", header: "Category" },
              { key: "quantity", header: "In stock", format: "number" },
              { key: "reorder", header: "Reorder level", format: "number" },
              { key: "unit", header: "Unit" },
              { key: "status", header: "Status" },
            ],
            rows,
          },
        ],
        notes: ["Highlighted items are low or out of stock and should be reordered."],
      };
    }
  }
}

/** Query string for the report download links. */
export function reportQuery(params: { type: string; from: string; to: string; cropId?: string }) {
  const q = new URLSearchParams({ type: params.type, from: params.from, to: params.to });
  if (params.cropId) q.set("cropId", params.cropId);
  return q.toString();
}
