import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/form-helpers";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cropStatusVariant } from "@/lib/crops";
import { enumLabel, formatDate, formatKg } from "@/lib/utils";
import { deleteCrop } from "../actions";

export default async function CropDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crop = await prisma.crop.findUnique({
    where: { id },
    include: { harvests: { orderBy: { scheduledDate: "asc" } } },
  });
  if (!crop) notFound();

  const harvested = crop.harvests.reduce((sum, h) => sum + (h.actualQuantityKg ?? 0), 0);

  const details: [string, React.ReactNode][] = [
    ["Variety", crop.variety ?? "-"],
    ["Bed / section", crop.bedLocation ?? "-"],
    ["Planted", formatDate(crop.plantedDate)],
    ["Expected harvest", formatDate(crop.expectedHarvestDate)],
    ["Plants", crop.plantedQuantity],
    ["Expected yield", formatKg(crop.expectedYieldKg)],
    ["Harvested so far", formatKg(harvested)],
  ];

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
            <CardTitle>Harvest schedule</CardTitle>
          </CardHeader>
          <Table>
            <THead>
              <tr>
                <TH>Scheduled</TH>
                <TH>Expected</TH>
                <TH>Harvested on</TH>
                <TH>Actual</TH>
              </tr>
            </THead>
            <TBody>
              {crop.harvests.length === 0 && <EmptyRow colSpan={4} />}
              {crop.harvests.map((h) => (
                <TR key={h.id}>
                  <TD>{formatDate(h.scheduledDate)}</TD>
                  <TD>{formatKg(h.expectedQuantityKg)}</TD>
                  <TD>{formatDate(h.actualDate)}</TD>
                  <TD>{h.actualQuantityKg != null ? formatKg(h.actualQuantityKg) : "-"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
