import Link from "next/link";
import { Plus, Sprout } from "lucide-react";
import { CropAvatar, ProgressBar } from "@/components/crop-avatar";
import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { FilterTabs } from "@/components/filter-tabs";
import { ReportMenu } from "@/components/report-menu";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
          <>
            <ReportMenu module="Crops" />
            <Link href="/crops/new" className={buttonVariants({ variant: "gold" })}>
              <Plus /> Add crop
            </Link>
          </>
        }
      />

      <FilterTabs
        className="mb-6"
        tabs={filters.map((f) => ({
          href: f ? `/crops?status=${f}` : "/crops",
          label: f ? enumLabel(f) : "All",
          active: validStatus === f,
        }))}
      />

      {crops.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white/70 p-12 text-center text-gray-500">
          <Sprout className="h-8 w-8 text-green-500" />
          <p>No crops found.</p>
          <Link href="/crops/new" className={buttonVariants()}>
            <Plus /> Add the first crop
          </Link>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {crops.map((crop) => {
          const harvested = crop.harvests.reduce((sum, h) => sum + (h.actualQuantityKg ?? 0), 0);
          const pct = crop.expectedYieldKg > 0 ? (harvested / crop.expectedYieldKg) * 100 : 0;
          const daysLeft = differenceInCalendarDays(crop.expectedHarvestDate, new Date());
          const age = differenceInCalendarDays(new Date(), crop.plantedDate);
          return (
            <Link
              key={crop.id}
              href={`/crops/${crop.id}`}
              className="group relative flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white/95 p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-green-300 hover:shadow-lift"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold-200/30 blur-2xl transition group-hover:bg-gold-300/40" />
              <div className="relative flex items-start gap-4">
                <CropAvatar name={crop.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-gray-900 group-hover:text-green-700">{crop.name}</p>
                  <p className="truncate text-sm text-gray-500">
                    {[crop.variety, crop.bedLocation].filter(Boolean).join(" · ") || "Polytunnel"}
                  </p>
                </div>
                <Badge variant={cropStatusVariant[crop.status]}>{enumLabel(crop.status)}</Badge>
              </div>

              <div className="relative mt-5">
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-gray-700">Harvested</span>
                  <span className="text-gray-500">
                    <strong className="text-gray-900">{formatKg(harvested)}</strong> / {formatKg(crop.expectedYieldKg)}
                  </span>
                </div>
                <ProgressBar value={pct} />
              </div>

              <dl className="relative mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
                <div>
                  <dt className="text-xs text-gray-500">Planted</dt>
                  <dd className="text-sm font-semibold text-gray-800">{formatDate(crop.plantedDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Harvest</dt>
                  <dd
                    className={
                      crop.status === "GROWING" && daysLeft < 0
                        ? "text-sm font-semibold text-red-600"
                        : "text-sm font-semibold text-gray-800"
                    }
                  >
                    {crop.status === "GROWING"
                      ? daysLeft < 0
                        ? `${-daysLeft}d overdue`
                        : `in ${daysLeft}d`
                      : formatDate(crop.expectedHarvestDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Plants · Age</dt>
                  <dd className="text-sm font-semibold text-gray-800">
                    {crop.plantedQuantity} · {age}d
                  </dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </div>
    </>
  );
}
