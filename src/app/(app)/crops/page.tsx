import Link from "next/link";
import { Plus } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cropStatusVariant } from "@/lib/crops";
import { enumLabel, formatDate, formatKg } from "@/lib/utils";

export const metadata = { title: "Crops" };

export default async function CropsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = ["GROWING", "HARVESTING", "COMPLETED", "FAILED"].includes(status ?? "")
    ? (status as "GROWING" | "HARVESTING" | "COMPLETED" | "FAILED")
    : undefined;

  const crops = await prisma.crop.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { plantedDate: "desc" },
    include: { harvests: { select: { actualQuantityKg: true } } },
  });

  const filters = [undefined, "GROWING", "HARVESTING", "COMPLETED", "FAILED"];

  return (
    <>
      <PageHeader
        title="Crop Management"
        description="Vegetables currently planted in the polytunnel and their lifecycle."
        actions={
          <Link href="/crops/new" className={buttonVariants({ variant: "gold" })}>
            <Plus /> Add crop
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f ?? "all"}
            href={f ? `/crops?status=${f}` : "/crops"}
            className={buttonVariants({ variant: validStatus === f ? "default" : "outline", size: "sm" })}
          >
            {f ? enumLabel(f) : "All"}
          </Link>
        ))}
      </div>

      <Card>
        <Table>
          <THead>
            <tr>
              <TH>Vegetable</TH>
              <TH>Bed</TH>
              <TH>Planted</TH>
              <TH>Expected harvest</TH>
              <TH>Plants</TH>
              <TH>Harvested / Expected</TH>
              <TH>Status</TH>
            </tr>
          </THead>
          <TBody>
            {crops.length === 0 && <EmptyRow colSpan={7} message="No crops found." />}
            {crops.map((crop) => {
              const harvested = crop.harvests.reduce((sum, h) => sum + (h.actualQuantityKg ?? 0), 0);
              const daysLeft = differenceInCalendarDays(crop.expectedHarvestDate, new Date());
              return (
                <TR key={crop.id}>
                  <TD>
                    <Link href={`/crops/${crop.id}`} className="font-medium text-green-700 hover:underline">
                      {crop.name}
                    </Link>
                    {crop.variety && <span className="ml-1 text-gray-500">({crop.variety})</span>}
                  </TD>
                  <TD>{crop.bedLocation ?? "-"}</TD>
                  <TD>{formatDate(crop.plantedDate)}</TD>
                  <TD>
                    {formatDate(crop.expectedHarvestDate)}
                    {crop.status === "GROWING" && (
                      <span className={daysLeft < 0 ? "ml-2 text-xs text-red-600" : "ml-2 text-xs text-gray-500"}>
                        {daysLeft < 0 ? `${-daysLeft}d overdue` : `in ${daysLeft}d`}
                      </span>
                    )}
                  </TD>
                  <TD>{crop.plantedQuantity}</TD>
                  <TD>
                    {formatKg(harvested)} / {formatKg(crop.expectedYieldKg)}
                  </TD>
                  <TD>
                    <Badge variant={cropStatusVariant[crop.status]}>{enumLabel(crop.status)}</Badge>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
