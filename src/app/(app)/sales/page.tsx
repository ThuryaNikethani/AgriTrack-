import { Building2, Factory, Store, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { CropCell } from "@/components/crop-avatar";
import { ReportMenu } from "@/components/report-menu";
import { StatCard } from "@/components/stat-card";
import { DateRangeFilter } from "@/components/date-range-filter";
import { DeleteButton } from "@/components/form-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cropLabel } from "@/lib/crops";
import { parseDateRange } from "@/lib/date-range";
import { customerTypeLabel, getCropStock } from "@/lib/sales";
import { formatCurrency, formatDate, formatKg, toNumber } from "@/lib/utils";
import { deleteSale } from "./actions";
import { SaleForm } from "./sale-form";

export const metadata = { title: "Sales" };

const CUSTOMER_TYPES = ["VILLA", "TEA_FACTORY", "EXTERNAL"] as const;
type CustomerTypeValue = (typeof CUSTOMER_TYPES)[number];

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; customer?: string }>;
}) {
  const params = await searchParams;
  const range = parseDateRange(params);
  const customer = CUSTOMER_TYPES.includes(params.customer as CustomerTypeValue)
    ? (params.customer as CustomerTypeValue)
    : undefined;

  const [sales, stock] = await Promise.all([
    prisma.sale.findMany({
      where: { saleDate: { gte: range.from, lte: range.to }, customerType: customer },
      orderBy: { saleDate: "desc" },
      include: { crop: { select: { id: true, name: true, variety: true, bedLocation: true } } },
    }),
    getCropStock(),
  ]);

  const total = (type?: CustomerTypeValue) =>
    sales.filter((s) => !type || s.customerType === type).reduce((sum, s) => sum + toNumber(s.totalAmount), 0);
  const totalKg = sales.reduce((sum, s) => sum + s.quantityKg, 0);
  const inStock = stock.filter((s) => s.harvestedKg > 0);

  return (
    <>
      <PageHeader
        title="Sales & Revenue"
        description="Harvested vegetables sold to the Villa, the Tea Factory and external customers."
        actions={<ReportMenu module="Sales" from={range.fromInput} to={range.toInput} />}
      />

      <DateRangeFilter
        from={range.fromInput}
        to={range.toInput}
        select={{
          name: "customer",
          label: "Sold to",
          value: customer,
          options: CUSTOMER_TYPES.map((t) => ({ value: t, label: customerTypeLabel[t] })),
        }}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={formatCurrency(total())} hint={`${formatKg(totalKg)} sold`} icon={Wallet} />
        <StatCard label="Villa" value={formatCurrency(total("VILLA"))} icon={Building2} tone="sky" />
        <StatCard label="Tea Factory" value={formatCurrency(total("TEA_FACTORY"))} icon={Factory} tone="gray" />
        <StatCard label="External customers" value={formatCurrency(total("EXTERNAL"))} icon={Store} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Vegetable</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH className="text-right">Unit price</TH>
                  <TH className="text-right">Total</TH>
                  <TH>Sold to</TH>
                  <TH />
                </tr>
              </THead>
              <TBody>
                {sales.length === 0 && <EmptyRow colSpan={7} message="No sales in this period." />}
                {sales.map((s) => (
                  <TR key={s.id}>
                    <TD>{formatDate(s.saleDate)}</TD>
                    <TD>
                      <CropCell id={s.crop.id} name={s.crop.name} sub={s.crop.bedLocation} />
                    </TD>
                    <TD className="text-right">{formatKg(s.quantityKg)}</TD>
                    <TD className="text-right">{formatCurrency(s.unitPrice)}</TD>
                    <TD className="text-right font-medium">{formatCurrency(s.totalAmount)}</TD>
                    <TD>
                      {customerTypeLabel[s.customerType]}
                      {s.customerName && <span className="ml-1 text-xs text-gray-500">({s.customerName})</span>}
                    </TD>
                    <TD>
                      <DeleteButton action={deleteSale} id={s.id} confirmText="Delete this sale?" />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Harvest stock (harvested vs sold)</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Crop</TH>
                  <TH className="text-right">Harvested</TH>
                  <TH className="text-right">Sold</TH>
                  <TH className="text-right">Remaining</TH>
                </tr>
              </THead>
              <TBody>
                {inStock.length === 0 && <EmptyRow colSpan={4} message="No harvests recorded yet." />}
                {inStock.map((s) => (
                  <TR key={s.cropId}>
                    <TD>{cropLabel(s)}</TD>
                    <TD className="text-right">{formatKg(s.harvestedKg)}</TD>
                    <TD className="text-right">{formatKg(s.soldKg)}</TD>
                    <TD className="text-right font-medium">{formatKg(s.availableKg)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Record sale</CardTitle>
          </CardHeader>
          <CardContent>
            <SaleForm
              crops={inStock.map((s) => ({ id: s.cropId, label: cropLabel(s), availableKg: s.availableKg }))}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
