import Link from "next/link";
import { startOfMonth, startOfYear, subDays, subMonths, subYears } from "date-fns";
import { Percent, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FilterTabs } from "@/components/filter-tabs";
import { StatCard } from "@/components/stat-card";
import { DateRangeFilter } from "@/components/date-range-filter";
import { BreakdownPie, CropProfitChart, IncomeExpenseChart } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cropLabel } from "@/lib/crops";
import { parseDateRange } from "@/lib/date-range";
import { getCropProfitability, getFinancialSummary, getPeriodSeries, type Granularity } from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata = { title: "Financial Analytics" };

const VIEWS: Record<Granularity, { label: string; defaultFrom: () => Date }> = {
  day: { label: "Daily", defaultFrom: () => subDays(new Date(), 29) },
  month: { label: "Monthly", defaultFrom: () => startOfMonth(subMonths(new Date(), 11)) },
  year: { label: "Annual", defaultFrom: () => startOfYear(subYears(new Date(), 4)) },
};

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const view: Granularity = params.view && params.view in VIEWS ? (params.view as Granularity) : "month";
  const range = parseDateRange(params, VIEWS[view].defaultFrom());

  const [series, summary, crops] = await Promise.all([
    getPeriodSeries(range.from, range.to, view),
    getFinancialSummary(range.from, range.to),
    getCropProfitability({ from: range.from, to: range.to }),
  ]);

  const activeCrops = crops.filter((c) => c.revenue > 0 || c.totalCost > 0).sort((a, b) => b.profit - a.profit);
  const best = activeCrops[0];

  return (
    <>
      <PageHeader
        title="Financial Analytics"
        description="Income, expenses and profitability of the polytunnel cultivation."      />

      <FilterTabs
        className="mb-4"
        tabs={(Object.keys(VIEWS) as Granularity[]).map((v) => ({
          href: `/finance?view=${v}`,
          label: VIEWS[v].label,
          active: view === v,
        }))}
      />

      <DateRangeFilter from={range.fromInput} to={range.toInput} hidden={{ view }} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sales revenue" value={formatCurrency(summary.totalRevenue)} icon={TrendingUp} />
        <StatCard label="Total cultivation expenses" value={formatCurrency(summary.totalExpenses)} icon={TrendingDown} tone="red" />
        <StatCard
          label={summary.netProfit >= 0 ? "Net profit" : "Net loss"}
          value={formatCurrency(summary.netProfit)}
          icon={Wallet}
          tone={summary.netProfit >= 0 ? "sky" : "red"}
          hint="Revenue - Expenses"
        />
        <StatCard
          label="Profit margin"
          value={summary.margin == null ? "-" : `${summary.margin}%`}
          icon={Percent}
          tone="gray"
          hint={best ? `Most profitable: ${best.name}` : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{VIEWS[view].label} income &amp; expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by customer</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownPie data={summary.revenueByCustomer.map((r) => ({ label: r.label, value: r.revenue }))} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Crop-wise profitability</CardTitle>
          </CardHeader>
          <CardContent>
            {activeCrops.length > 0 ? (
              <CropProfitChart data={activeCrops} />
            ) : (
              <p className="py-16 text-center text-sm text-gray-500">No crop income or costs in this period.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownPie data={summary.expenseByCategory.map((e) => ({ label: e.label, value: e.amount }))} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Crop profitability details</CardTitle>
          </CardHeader>
          <Table>
            <THead>
              <tr>
                <TH>Crop</TH>
                <TH className="text-right">Villa revenue</TH>
                <TH className="text-right">Other revenue</TH>
                <TH className="text-right">Direct expenses</TH>
                <TH className="text-right">Fertilizer cost</TH>
                <TH className="text-right">Profit / Loss</TH>
                <TH className="text-right">Margin</TH>
              </tr>
            </THead>
            <TBody>
              {activeCrops.length === 0 && <EmptyRow colSpan={7} />}
              {activeCrops.map((c) => (
                <TR key={c.cropId}>
                  <TD>
                    <Link href={`/crops/${c.cropId}`} className="text-green-700 hover:underline">
                      {cropLabel(c)}
                    </Link>
                  </TD>
                  <TD className="text-right">{formatCurrency(c.villaRevenue)}</TD>
                  <TD className="text-right">{formatCurrency(c.externalRevenue)}</TD>
                  <TD className="text-right">{formatCurrency(c.directExpenses)}</TD>
                  <TD className="text-right">{formatCurrency(c.fertilizerCost)}</TD>
                  <TD className={cn("text-right font-medium", c.profit < 0 ? "text-red-600" : "text-green-700")}>
                    {formatCurrency(c.profit)}
                  </TD>
                  <TD className="text-right">{c.margin == null ? "-" : `${c.margin}%`}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <p className="px-5 py-3 text-xs text-gray-500">
            Fertilizer cost is estimated from the average purchase price of each fertilizer and the quantity applied to
            the crop. General expenses not linked to a crop are included in the totals above but not in crop profit.
          </p>
        </Card>
      </div>
    </>
  );
}
