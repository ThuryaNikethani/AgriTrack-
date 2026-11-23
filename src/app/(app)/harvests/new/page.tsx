import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { cropLabel } from "@/lib/crops";
import { ScheduleHarvestForm } from "../harvest-forms";

export const metadata = { title: "Schedule harvest" };

export default async function NewHarvestPage({ searchParams }: { searchParams: Promise<{ cropId?: string }> }) {
  const { cropId } = await searchParams;
  const crops = await prisma.crop.findMany({
    where: { status: { in: ["GROWING", "HARVESTING"] } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader title="Schedule harvest" description="Plan a harvest with its expected date and quantity." />
      <Card className="max-w-3xl">
        <CardContent className="pt-5">
          <ScheduleHarvestForm
            crops={crops.map((c) => ({ id: c.id, label: cropLabel(c) }))}
            defaultCropId={cropId}
          />
        </CardContent>
      </Card>
    </>
  );
}
