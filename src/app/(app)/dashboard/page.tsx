import Link from "next/link";
import { addDays, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { AlertTriangle, Building2, PackageX, Sprout, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardHero } from "@/components/dashboard-hero";
import { CropAvatar, CropCell } from "@/components/crop-avatar";
import { requireUser } from "@/lib/session";
import { StatCard } from "@/components/stat-card";
import { HarvestBarChart, IncomeExpenseChart } from "@/components/charts";
import { HarvestQuantityBadge, HarvestTimingBadge } from "@/components/harvest-badges";
import { StockBadge } from "@/components/stock-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getFinancialSummary, getPeriodSeries } from "@/lib/finance";
import { getQuantity, getTiming, harvestRowClass, HARVEST_RULES } from "@/lib/harvest";
import { customerTypeLabel } from "@/lib/sales";
import { getStockStatus } from "@/lib/stock";
import { formatCurrency, formatDate, formatKg, formatNumber, startOfToday } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const today = startOfToday();
  const monthStart = startOfMonth(now);

  const [activeCrops, attentionHarvests, recentCompleted, fertilizers, items, recentSales, month, series] =
    await Promise.all([
      prisma.crop.findMany({
        where: { status: { in: ["GROWING", "HARVESTING"] } },
        include: { harvests: { select: { expectedQuantityKg: true, actualQuantityKg: true, actualDate: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.harvest.findMany({
        where: {
          actualDate: null,
          scheduledDate: { lte: addDays(today, HARVEST_RULES.dueSoonDays) },
          crop: { status: { in: ["GROWING", "HARVESTING"] } },
        },
        include: { crop: { select: { id: true, name: true, bedLocation: true } } },
        orderBy: { scheduledDate: "asc" },
      }),
      prisma.harvest.findMany({
        where: { actualDate: { not: null } },
        include: { crop: { select: { id: true, name: true } } },
        orderBy: { actualDate: "desc" },
        take: 5,
      }),
      prisma.fertilizer.findMany(),
      prisma.inventoryItem.findMany(),
      prisma.sale.findMany({
        take: 5,
        orderBy: { saleDate: "desc" },
        include: { crop: { select: { name: true } } },
      }),
      getFinancialSummary(monthStart, endOfMonth(now)),
      getPeriodSeries(startOfMonth(subMonths(now, 5)), now, "month"),
    ]);

  const overdue = attentionHarvests.filter((h) => getTiming(h).status === "OVERDUE");
  const dueSoon = attentionHarvests.filter((h) => getTiming(h).status === "DUE_SOON");
  const belowTarget = recentCompleted.filter((h) => getQuantity(h)?.status === "BELOW");

  const lowStock = [
    ...fertilizers.map((f) => ({
      id: f.id,
      name: f.name,
      kind: "Fertilizer",
      quantity: f.currentStock,
      reorderLevel: f.reorderLevel,
      unit: f.unit,
      href: `/fertilizers/${f.id}`,
    })),
    ...items.map((i) => ({
      id: i.id,
      name: i.name,
      kind: "Inventory",
      quantity: i.quantity,
      reorderLevel: i.reorderLevel,
      unit: i.unit,
      href: "/inventory",
    })),
  ].filter((s) => getStockStatus(s.quantity, s.reorderLevel) !== "OK");

  const harvestChart = activeCrops.map((c) => ({
    name: c.name,
    expected: Math.round(c.harvests.reduce((s, h) => s + (h.actualDate ? h.expectedQuantityKg : 0), 0) * 100) / 100,
    actual: Math.round(c.harvests.reduce((s, h) => s + (h.actualQuantityKg ?? 0), 0) * 100) / 100,
  }));

  return (
    <>
      <DashboardHero name={user.name ?? "there"} alerts={overdue.length + dueSoon.length + lowStock.length} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active crops" value={activeCrops.length} icon={Sprout} />
        <StatCard
          label="Overdue harvests"
          value={overdue.length}
          icon={AlertTriangle}
          tone={overdue.length ? "red" : "gray"}
          hint={`${dueSoon.length} due in the next ${HARVEST_RULES.dueSoonDays} days`}
        />
        <StatCard
          label="Below-target harvests"
          value={belowTarget.length}
          icon={TrendingDown}
          tone={belowTarget.length ? "red" : "gray"}
          hint="In the last 5 harvests"
        />
        <StatCard
          label="Stock to reorder"
          value={lowStock.length}
          icon={PackageX}
          tone={lowStock.length ? "amber" : "gray"}
          hint="Fertilizer & supplies"
        />
        <StatCard label="Revenue this month" value={formatCurrency(month.totalRevenue)} icon={TrendingUp} tone="gold" />
        <StatCard label="Expenses this month" value={formatCurrency(month.totalExpenses)} icon={TrendingDown} tone="red" />
        <StatCard
          label={month.netProfit >= 0 ? "Net profit this month" : "Net loss this month"}
          value={formatCurrency(month.netProfit)}
          icon={Wallet}
          tone={month.netProfit >= 0 ? "sky" : "red"}
        />
        <StatCard
          label="Villa supply this month"
          value={formatKg(month.revenueByCustomer.find((r) => r.type === "VILLA")?.quantityKg ?? 0)}
          icon={Building2}
          tone="gray"
          hint={formatCurrency(month.revenueByCustomer.find((r) => r.type === "VILLA")?.revenue ?? 0)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Harvests needing attention
              <Link href="/harvests?filter=pending" className="text-sm font-normal text-green-700 hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <Table>
            <THead>
              <tr>
                <TH>Crop</TH>
                <TH>Scheduled</TH>
                <TH>Expected</TH>
                <TH>Status</TH>
                <TH />
              </tr>
            </THead>
            <TBody>
              {attentionHarvests.length === 0 && <EmptyRow colSpan={5} message="No harvests due or overdue." />}
              {attentionHarvests.map((h) => (
                <TR key={h.id} className={harvestRowClass(h)}>
                  <TD>
                    <CropCell id={h.crop.id} name={h.crop.name} sub={h.crop.bedLocation} />
                  </TD>
                  <TD>{formatDate(h.scheduledDate)}</TD>
                  <TD>{formatKg(h.expectedQuantityKg)}</TD>
                  <TD>
                    <HarvestTimingBadge harvest={h} />
                  </TD>
                  <TD>
                    <Link href={`/harvests/${h.id}/record`} className="text-sm text-green-700 hover:underline">
                      Record
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Reorder reminders
              <Link href="/inventory" className="text-sm font-normal text-green-700 hover:underline">
                Inventory
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">All stock levels are fine.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lowStock.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link href={s.href} className="text-sm font-medium text-gray-900 hover:underline">
                        {s.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {s.kind} - {formatNumber(s.quantity)} {s.unit} left
                      </p>
                    </div>
                    <StockBadge quantity={s.quantity} reorderLevel={s.reorderLevel} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Income &amp; expenses - last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent harvests</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompleted.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">No harvests recorded yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentCompleted.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <CropAvatar name={h.crop.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{h.crop.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(h.actualDate)} - {formatKg(h.actualQuantityKg)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <HarvestTimingBadge harvest={h} />
                      <HarvestQuantityBadge harvest={h} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Harvested vs expected (active crops)</CardTitle>
          </CardHeader>
          <CardContent>
            {harvestChart.length > 0 ? (
              <HarvestBarChart data={harvestChart} />
            ) : (
              <p className="py-16 text-center text-sm text-gray-500">No active crops.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent sales
              <Link href="/sales" className="text-sm font-normal text-green-700 hover:underline">
                Sales
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">No sales yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentSales.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <CropAvatar name={s.crop.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {s.crop.name} - {formatKg(s.quantityKg)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(s.saleDate)} - {customerTypeLabel[s.customerType]}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-gold-50 px-2 py-1 text-sm font-bold text-gold-700">
                      {formatCurrency(s.totalAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
