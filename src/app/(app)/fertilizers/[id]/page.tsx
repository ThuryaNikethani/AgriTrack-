import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ReportMenu } from "@/components/report-menu";
import { StockBadge } from "@/components/stock-badge";
import { DeleteButton } from "@/components/form-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cropLabel } from "@/lib/crops";
import { enumLabel, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { deleteFertilizer, deletePurchase, deleteUsage } from "../actions";
import { FertilizerForm, PurchaseForm, UsageForm } from "../fertilizer-forms";

export default async function FertilizerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [fertilizer, crops] = await Promise.all([
    prisma.fertilizer.findUnique({
      where: { id },
      include: {
        usages: { orderBy: { date: "desc" }, include: { crop: true } },
        purchases: { orderBy: { date: "desc" } },
      },
    }),
    prisma.crop.findMany({
      where: { status: { in: ["GROWING", "HARVESTING"] } },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!fertilizer) notFound();

  const totalUsed = fertilizer.usages.reduce((s, u) => s + u.quantity, 0);
  // Only plain fields go to the client form (purchases contain Decimal values).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { usages, purchases, ...fertilizerFields } = fertilizer;

  return (
    <>
      <PageHeader
        title={fertilizer.name}
        description={`${enumLabel(fertilizer.type)} fertilizer - total used ${formatNumber(totalUsed)} ${fertilizer.unit}`}
        actions={
          <>
            <ReportMenu module="Fertilizers" />
            <span className="rounded-lg bg-white">
              <DeleteButton
                action={deleteFertilizer}
                id={fertilizer.id}
                confirmText="Delete this fertilizer and all its usage records?"
              />
            </span>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <p className="text-xs uppercase text-gray-500">Current stock</p>
          <p className="text-2xl font-bold">
            {formatNumber(fertilizer.currentStock)} {fertilizer.unit}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">Reorder level</p>
          <p className="text-lg font-semibold">
            {formatNumber(fertilizer.reorderLevel)} {fertilizer.unit}
          </p>
        </div>
        <StockBadge quantity={fertilizer.currentStock} reorderLevel={fertilizer.reorderLevel} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Usage history</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Crop</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH>Notes</TH>
                  <TH />
                </tr>
              </THead>
              <TBody>
                {fertilizer.usages.length === 0 && <EmptyRow colSpan={5} />}
                {fertilizer.usages.map((u) => (
                  <TR key={u.id}>
                    <TD>{formatDate(u.date)}</TD>
                    <TD>
                      <Link href={`/crops/${u.crop.id}`} className="text-green-700 hover:underline">
                        {cropLabel(u.crop)}
                      </Link>
                    </TD>
                    <TD className="text-right">
                      {formatNumber(u.quantity)} {fertilizer.unit}
                    </TD>
                    <TD className="max-w-xs truncate">{u.notes ?? "-"}</TD>
                    <TD>
                      <DeleteButton action={deleteUsage} id={u.id} confirmText="Delete this usage? Stock will be restored." />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchases</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH className="text-right">Cost</TH>
                  <TH />
                </tr>
              </THead>
              <TBody>
                {fertilizer.purchases.length === 0 && <EmptyRow colSpan={4} />}
                {fertilizer.purchases.map((p) => (
                  <TR key={p.id}>
                    <TD>{formatDate(p.date)}</TD>
                    <TD className="text-right">
                      {formatNumber(p.quantity)} {fertilizer.unit}
                    </TD>
                    <TD className="text-right">{formatCurrency(p.totalCost)}</TD>
                    <TD>
                      <DeleteButton
                        action={deletePurchase}
                        id={p.id}
                        confirmText="Delete this purchase? Stock and the linked expense will be removed."
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FertilizerForm fertilizer={fertilizerFields} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record usage</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageForm
                fertilizerId={fertilizer.id}
                unit={fertilizer.unit}
                crops={crops.map((c) => ({ id: c.id, label: cropLabel(c) }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Restock</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseForm fertilizerId={fertilizer.id} unit={fertilizer.unit} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
