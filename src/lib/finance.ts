import { format, startOfDay, startOfMonth, startOfYear, addDays, addMonths, addYears } from "date-fns";
import type { CustomerType, ExpenseCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/expenses";
import { customerTypeLabel } from "@/lib/sales";

export type Granularity = "day" | "month" | "year";

export type PeriodRow = {
  key: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export type CropProfit = {
  cropId: string;
  name: string;
  variety: string | null;
  bedLocation: string | null;
  status: string;
  harvestedKg: number;
  soldKg: number;
  revenue: number;
  villaRevenue: number;
  externalRevenue: number;
  directExpenses: number;
  fertilizerCost: number;
  totalCost: number;
  profit: number;
  margin: number | null;
};

const round = (n: number) => Math.round(n * 100) / 100;

function periodStart(date: Date, g: Granularity) {
  if (g === "day") return startOfDay(date);
  if (g === "month") return startOfMonth(date);
  return startOfYear(date);
}

function nextPeriod(date: Date, g: Granularity) {
  if (g === "day") return addDays(date, 1);
  if (g === "month") return addMonths(date, 1);
  return addYears(date, 1);
}

function periodKey(date: Date, g: Granularity) {
  if (g === "day") return format(date, "yyyy-MM-dd");
  if (g === "month") return format(date, "yyyy-MM");
  return format(date, "yyyy");
}

function periodLabel(date: Date, g: Granularity) {
  if (g === "day") return format(date, "dd MMM");
  if (g === "month") return format(date, "MMM yyyy");
  return format(date, "yyyy");
}

/** Revenue, expenses and profit grouped by day, month or year. */
export async function getPeriodSeries(from: Date, to: Date, g: Granularity): Promise<PeriodRow[]> {
  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({ where: { saleDate: { gte: from, lte: to } }, select: { saleDate: true, totalAmount: true } }),
    prisma.expense.findMany({ where: { date: { gte: from, lte: to } }, select: { date: true, amount: true } }),
  ]);

  const rows = new Map<string, PeriodRow>();
  for (let d = periodStart(from, g); d <= to; d = nextPeriod(d, g)) {
    const key = periodKey(d, g);
    rows.set(key, { key, label: periodLabel(d, g), revenue: 0, expenses: 0, profit: 0 });
  }

  for (const s of sales) {
    const row = rows.get(periodKey(s.saleDate, g));
    if (row) row.revenue += toNumber(s.totalAmount);
  }
  for (const e of expenses) {
    const row = rows.get(periodKey(e.date, g));
    if (row) row.expenses += toNumber(e.amount);
  }

  return [...rows.values()].map((r) => ({
    ...r,
    revenue: round(r.revenue),
    expenses: round(r.expenses),
    profit: round(r.revenue - r.expenses),
  }));
}

/** Totals for a date range: revenue, expenses, net profit and their breakdowns. */
export async function getFinancialSummary(from: Date, to: Date) {
  const [salesByCustomer, expensesByCategory] = await Promise.all([
    prisma.sale.groupBy({
      by: ["customerType"],
      where: { saleDate: { gte: from, lte: to } },
      _sum: { totalAmount: true, quantityKg: true },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: { date: { gte: from, lte: to } },
      _sum: { amount: true },
    }),
  ]);

  const revenueByCustomer = (["VILLA", "TEA_FACTORY", "EXTERNAL"] as CustomerType[]).map((type) => {
    const row = salesByCustomer.find((s) => s.customerType === type);
    return {
      type,
      label: customerTypeLabel[type],
      revenue: round(toNumber(row?._sum.totalAmount)),
      quantityKg: row?._sum.quantityKg ?? 0,
    };
  });

  const expenseByCategory = EXPENSE_CATEGORIES.map((c) => {
    const row = expensesByCategory.find((e) => e.category === c.value);
    return { category: c.value as ExpenseCategory, label: c.label, amount: round(toNumber(row?._sum.amount)) };
  });

  const totalRevenue = round(revenueByCustomer.reduce((s, r) => s + r.revenue, 0));
  const totalExpenses = round(expenseByCategory.reduce((s, r) => s + r.amount, 0));
  const netProfit = round(totalRevenue - totalExpenses);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    margin: totalRevenue > 0 ? round((netProfit / totalRevenue) * 100) : null,
    revenueByCustomer,
    expenseByCategory,
  };
}

/** Average purchase cost per unit for each fertilizer (used to cost fertilizer usage per crop). */
async function getFertilizerUnitCosts() {
  const purchases = await prisma.fertilizerPurchase.groupBy({
    by: ["fertilizerId"],
    _sum: { quantity: true, totalCost: true },
  });
  return new Map(
    purchases.map((p) => {
      const qty = p._sum.quantity ?? 0;
      return [p.fertilizerId, qty > 0 ? toNumber(p._sum.totalCost) / qty : 0];
    }),
  );
}

/**
 * Profitability of each crop cycle: revenue from its sales minus the expenses
 * linked to it and the cost of fertilizer applied to it.
 * Optionally limited to activity inside a date range.
 */
export async function getCropProfitability(range?: { from: Date; to: Date }, cropId?: string): Promise<CropProfit[]> {
  const dateFilter = range ? { gte: range.from, lte: range.to } : undefined;

  const [crops, unitCosts] = await Promise.all([
    prisma.crop.findMany({
      where: cropId ? { id: cropId } : undefined,
      orderBy: { plantedDate: "desc" },
      include: {
        sales: { where: { saleDate: dateFilter }, select: { quantityKg: true, totalAmount: true, customerType: true } },
        expenses: { where: { date: dateFilter }, select: { amount: true } },
        fertilizerUsages: { where: { date: dateFilter }, select: { fertilizerId: true, quantity: true } },
        harvests: { where: { actualDate: dateFilter ?? { not: null } }, select: { actualQuantityKg: true } },
      },
    }),
    getFertilizerUnitCosts(),
  ]);

  return crops.map((c) => {
    const revenue = c.sales.reduce((s, x) => s + toNumber(x.totalAmount), 0);
    const villaRevenue = c.sales
      .filter((x) => x.customerType === "VILLA")
      .reduce((s, x) => s + toNumber(x.totalAmount), 0);
    const directExpenses = c.expenses.reduce((s, x) => s + toNumber(x.amount), 0);
    const fertilizerCost = c.fertilizerUsages.reduce(
      (s, u) => s + u.quantity * (unitCosts.get(u.fertilizerId) ?? 0),
      0,
    );
    const totalCost = directExpenses + fertilizerCost;
    const profit = revenue - totalCost;

    return {
      cropId: c.id,
      name: c.name,
      variety: c.variety,
      bedLocation: c.bedLocation,
      status: c.status,
      harvestedKg: c.harvests.reduce((s, h) => s + (h.actualQuantityKg ?? 0), 0),
      soldKg: c.sales.reduce((s, x) => s + x.quantityKg, 0),
      revenue: round(revenue),
      villaRevenue: round(villaRevenue),
      externalRevenue: round(revenue - villaRevenue),
      directExpenses: round(directExpenses),
      fertilizerCost: round(fertilizerCost),
      totalCost: round(totalCost),
      profit: round(profit),
      margin: revenue > 0 ? round((profit / revenue) * 100) : null,
    };
  });
}
