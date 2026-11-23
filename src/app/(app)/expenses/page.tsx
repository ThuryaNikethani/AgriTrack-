import Link from "next/link";
import { Receipt } from "lucide-react";
import type { ExpenseCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ReportMenu } from "@/components/report-menu";
import { StatCard } from "@/components/stat-card";
import { DateRangeFilter } from "@/components/date-range-filter";
import { DeleteButton } from "@/components/form-helpers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cropLabel } from "@/lib/crops";
import { parseDateRange } from "@/lib/date-range";
import { EXPENSE_CATEGORIES, expenseCategoryLabel } from "@/lib/expenses";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { deleteExpense } from "./actions";
import { ExpenseForm } from "./expense-form";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; category?: string }>;
}) {
  const params = await searchParams;
  const range = parseDateRange(params);
  const category = EXPENSE_CATEGORIES.some((c) => c.value === params.category)
    ? (params.category as ExpenseCategory)
    : undefined;

  const [expenses, crops] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: range.from, lte: range.to }, category },
      orderBy: { date: "desc" },
      include: {
        crop: { select: { id: true, name: true, variety: true, bedLocation: true } },
        fertilizerPurchase: { select: { id: true, fertilizerId: true } },
      },
    }),
    prisma.crop.findMany({ orderBy: [{ status: "asc" }, { name: "asc" }] }),
  ]);

  const total = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    ...c,
    total: expenses.filter((e) => e.category === c.value).reduce((sum, e) => sum + toNumber(e.amount), 0),
  }));

  return (
    <>
      <PageHeader
        title="Expense Management"
        description="All costs of running the polytunnel cultivation."
        actions={<ReportMenu module="Expenses" from={range.fromInput} to={range.toInput} />}
      />

      <DateRangeFilter
        from={range.fromInput}
        to={range.toInput}
        select={{
          name: "category",
          label: "Category",
          value: category,
          options: EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
        }}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total expenses" value={formatCurrency(total)} hint={`${expenses.length} records`} icon={Receipt} tone="red" />
        {byCategory
          .filter((c) => c.total > 0)
          .sort((a, b) => b.total - a.total)
          .slice(0, 3)
          .map((c) => (
            <StatCard key={c.value} label={c.label} value={formatCurrency(c.total)} tone="gray" />
          ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <Table>
            <THead>
              <tr>
                <TH>Date</TH>
                <TH>Category</TH>
                <TH>Description</TH>
                <TH>Crop</TH>
                <TH className="text-right">Amount</TH>
                <TH />
              </tr>
            </THead>
            <TBody>
              {expenses.length === 0 && <EmptyRow colSpan={6} message="No expenses in this period." />}
              {expenses.map((e) => (
                <TR key={e.id}>
                  <TD>{formatDate(e.date)}</TD>
                  <TD>
                    <Badge>{expenseCategoryLabel[e.category]}</Badge>
                  </TD>
                  <TD className="max-w-xs truncate whitespace-normal">{e.description}</TD>
                  <TD>
                    {e.crop ? (
                      <Link href={`/crops/${e.crop.id}`} className="text-green-700 hover:underline">
                        {cropLabel(e.crop)}
                      </Link>
                    ) : (
                      <span className="text-gray-400">General</span>
                    )}
                  </TD>
                  <TD className="text-right font-medium">{formatCurrency(e.amount)}</TD>
                  <TD>
                    {e.fertilizerPurchase ? (
                      <Link
                        href={`/fertilizers/${e.fertilizerPurchase.fertilizerId}`}
                        className="text-xs text-gray-500 hover:underline"
                        title="Manage from the fertilizer page"
                      >
                        Purchase
                      </Link>
                    ) : (
                      <DeleteButton action={deleteExpense} id={e.id} confirmText="Delete this expense?" />
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record expense</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm crops={crops.map((c) => ({ id: c.id, label: cropLabel(c) }))} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>By category</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-100 text-sm">
                {byCategory.map((c) => (
                  <li key={c.value} className="flex justify-between py-2">
                    <span className="text-gray-600">{c.label}</span>
                    <span className="font-medium">{formatCurrency(c.total)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
