import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { HarvestTimingBadge } from "@/components/harvest-badges";
import { formatDate, formatKg, toDateInput } from "@/lib/utils";
import { RecordHarvestForm } from "../../harvest-forms";

export const metadata = { title: "Record harvest" };

export default async function RecordHarvestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const harvest = await prisma.harvest.findUnique({ where: { id }, include: { crop: true } });
  if (!harvest) notFound();

  return (
    <>
      <PageHeader title={`Record harvest - ${harvest.crop.name}`} />
      <Card className="max-w-3xl">
        <CardContent className="space-y-5 pt-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md bg-gray-50 p-3 text-sm">
            <span>
              Scheduled: <strong>{formatDate(harvest.scheduledDate)}</strong>
            </span>
            <span>
              Expected: <strong>{formatKg(harvest.expectedQuantityKg)}</strong>
            </span>
            <HarvestTimingBadge harvest={harvest} />
          </div>
          <RecordHarvestForm
            harvestId={harvest.id}
            defaultDate={toDateInput(harvest.actualDate ?? new Date())}
            defaultQuantity={harvest.actualQuantityKg ?? undefined}
            defaultNotes={harvest.notes ?? undefined}
          />
        </CardContent>
      </Card>
    </>
  );
}
