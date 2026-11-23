import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { HarvestQuantityBadge, HarvestTimingBadge } from "@/components/harvest-badges";
import { harvestRowClass, isCompleted } from "@/lib/harvest";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/form-helpers";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cropStatusVariant } from "@/lib/crops";
import { enumLabel, formatCurrency, formatDate, formatKg, formatNumber } from "@/lib/utils";
import { getCropProfitability } from "@/lib/finance";
import { deleteCrop } from "../actions";

export default async function CropDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crop = await prisma.crop.findUnique({
    where: { id },
    include: {
      harvests: { orderBy: { scheduledDate: "asc" } },
      fertilizerUsages: { orderBy: { date: "desc" }, include: { fertilizer: true } },
    },
  });
  if (!crop) notFound();
  const [profit] = await getCropProfitability(undefined, crop.id);

  const harvested = crop.harvests.reduce((sum, h) => sum + (h.actualQuantityKg ?? 0), 0);

  const details: [string, React.ReactNode][] = [
    ["Variety", crop.variety ?? "-"],
    ["Bed / section", crop.bedLocation ?? "-"],
    ["Planted", formatDate(crop.plantedDate)],
    ["Expected harvest", formatDate(crop.expectedHarvestDate)],
    ["Plants", crop.plantedQuantity],
    ["Expected yield", formatKg(crop.expectedYieldKg)],
    ["Harvested so far", formatKg(harvested)],
    ["Sold", formatKg(profit?.soldKg ?? 0)],
  ];

  const financials: [string, number][] = profit
    ? [
        ["Revenue - Villa", profit.villaRevenue],
        ["Revenue - Tea Factory / external", profit.externalRevenue],
        ["Direct expenses", -profit.directExpenses],
        ["Fertilizer cost (estimated)", -profit.fertilizerCost],
      ]
    : [];

  return (
    <>
      <PageHeader
        title={crop.name}
        description={crop.notes ?? undefined}
        actions={
          <>
            <Link href={`/crops/${crop.id}/edit`} className={buttonVariants({ variant: "outline" })}>
              <Pencil /> Edit
            </Link>
            <DeleteButton
              action={deleteCrop}
              id={crop.id}
              confirmText="Delete this crop? Crops with sales are marked completed instead."
            />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Crop details
              <Badge variant={cropStatusVariant[crop.status]}>{enumLabel(crop.status)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-100 text-sm">
              {details.map(([label, value]) => (
                <div key={label} className="flex justify-between py-2">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Harvest schedule
              <Link href={`/harvests/new?cropId=${crop.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                <Plus /> Schedule
              </Link>
            </CardTitle>
          </CardHeader>
          <Table>
            <THead>
              <tr>
                <TH>Scheduled</TH>
                <TH>Expected</TH>
                <TH>Harvested on</TH>
                <TH>Actual</TH>
                <TH>Timing</TH>
                <TH>Quantity</TH>
                <TH />
              </tr>
            </THead>
            <TBody>
              {crop.harvests.length === 0 && <EmptyRow colSpan={7} />}
              {crop.harvests.map((h) => (
                <TR key={h.id} className={harvestRowClass(h)}>
                  <TD>{formatDate(h.scheduledDate)}</TD>
                  <TD>{formatKg(h.expectedQuantityKg)}</TD>
                  <TD>{formatDate(h.actualDate)}</TD>
                  <TD>{h.actualQuantityKg != null ? formatKg(h.actualQuantityKg) : "-"}</TD>
                  <TD>
                    <HarvestTimingBadge harvest={h} />
                  </TD>
                  <TD>
                    <HarvestQuantityBadge harvest={h} />
                  </TD>
                  <TD>
                    <Link href={`/harvests/${h.id}/record`} className="text-xs text-green-700 hover:underline">
                      {isCompleted(h) ? "Edit" : "Record"}
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crop cycle profitability</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-100 text-sm">
              {financials.map(([label, value]) => (
                <div key={label} className="flex justify-between py-2">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className={value < 0 ? "text-red-600" : "text-gray-900"}>{formatCurrency(value)}</dd>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold">
                <dt>{(profit?.profit ?? 0) >= 0 ? "Net profit" : "Net loss"}</dt>
                <dd className={(profit?.profit ?? 0) < 0 ? "text-red-600" : "text-green-700"}>
                  {formatCurrency(profit?.profit ?? 0)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fertilizer applied</CardTitle>
          </CardHeader>
          <Table>
            <THead>
              <tr>
                <TH>Date</TH>
                <TH>Fertilizer</TH>
                <TH className="text-right">Quantity</TH>
                <TH>Notes</TH>
              </tr>
            </THead>
            <TBody>
              {crop.fertilizerUsages.length === 0 && <EmptyRow colSpan={4} />}
              {crop.fertilizerUsages.map((u) => (
                <TR key={u.id}>
                  <TD>{formatDate(u.date)}</TD>
                  <TD>
                    <Link href={`/fertilizers/${u.fertilizer.id}`} className="text-green-700 hover:underline">
                      {u.fertilizer.name}
                    </Link>
                  </TD>
                  <TD className="text-right">
                    {formatNumber(u.quantity)} {u.fertilizer.unit}
                  </TD>
                  <TD>{u.notes ?? "-"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
