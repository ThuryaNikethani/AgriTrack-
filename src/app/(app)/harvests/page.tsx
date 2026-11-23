import Link from "next/link";
import { AlertTriangle, CalendarClock, ClipboardCheck, Plus, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { FilterTabs } from "@/components/filter-tabs";
import { CropCell } from "@/components/crop-avatar";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/form-helpers";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { HarvestLegend, HarvestQuantityBadge, HarvestTimingBadge } from "@/components/harvest-badges";
import { getQuantity, getTiming, harvestRowClass, isCompleted, needsAttention } from "@/lib/harvest";
import { cn, formatDate, formatKg } from "@/lib/utils";
import { deleteHarvest } from "./actions";

export const metadata = { title: "Harvests" };

const FILTERS = {
  all: "All",
  pending: "Pending",
  overdue: "Overdue",
  completed: "Completed",
  issues: "Needs attention",
} as const;
type Filter = keyof typeof FILTERS;

export default async function HarvestsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = rawFilter && rawFilter in FILTERS ? (rawFilter as Filter) : "all";

  const harvests = await prisma.harvest.findMany({
    orderBy: [{ scheduledDate: "desc" }],
    include: { crop: { select: { id: true, name: true, variety: true, bedLocation: true } } },
  });

  const overdue = harvests.filter((h) => getTiming(h).status === "OVERDUE");
  const dueSoon = harvests.filter((h) => getTiming(h).status === "DUE_SOON");
  const late = harvests.filter((h) => getTiming(h).status === "LATE");
  const below = harvests.filter((h) => getQuantity(h)?.status === "BELOW");

  const matches = (h: (typeof harvests)[number], f: Filter) => {
    switch (f) {
      case "pending":
        return !isCompleted(h);
      case "overdue":
        return getTiming(h).status === "OVERDUE";
      case "completed":
        return isCompleted(h);
      case "issues":
        return needsAttention(h);
      default:
        return true;
    }
  };
  const visible = harvests.filter((h) => matches(h, filter));
  const counts = Object.fromEntries(
    (Object.keys(FILTERS) as Filter[]).map((f) => [f, harvests.filter((h) => matches(h, f)).length]),
  ) as Record<Filter, number>;

  return (
    <>
      <PageHeader
        title="Harvest Management"
        description="Scheduled vs actual harvests. Late, overdue and below-target harvests are highlighted."
        actions={
          <Link href="/harvests/new" className={buttonVariants({ variant: "gold" })}>
            <Plus /> Schedule harvest
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overdue harvests" value={overdue.length} icon={AlertTriangle} tone="red" hint="Not harvested on schedule" />
        <StatCard label="Due in 3 days" value={dueSoon.length} icon={CalendarClock} tone="amber" />
        <StatCard label="Harvested late" value={late.length} icon={ClipboardCheck} tone="red" />
        <StatCard label="Below target" value={below.length} icon={TrendingDown} tone="red" hint="Less than expected quantity" />
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          tabs={(Object.keys(FILTERS) as Filter[]).map((f) => ({
            href: f === "all" ? "/harvests" : `/harvests?filter=${f}`,
            label: FILTERS[f],
            active: filter === f,
            count: counts[f],
          }))}
        />
        <HarvestLegend />
      </div>

      <Card>
        <Table>
          <THead>
            <tr>
              <TH>Crop</TH>
              <TH>Scheduled</TH>
              <TH>Expected</TH>
              <TH>Harvested on</TH>
              <TH>Actual</TH>
              <TH>Timing</TH>
              <TH>Quantity</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {visible.length === 0 && <EmptyRow colSpan={8} message="No harvests match this filter." />}
            {visible.map((h) => (
              <TR key={h.id} className={cn(harvestRowClass(h))}>
                <TD>
                  <CropCell id={h.crop.id} name={h.crop.name} sub={h.crop.bedLocation} />
                </TD>
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
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/harvests/${h.id}/record`}
                      className={buttonVariants({ variant: isCompleted(h) ? "ghost" : "secondary", size: "sm" })}
                    >
                      {isCompleted(h) ? "Edit" : "Record"}
                    </Link>
                    <DeleteButton action={deleteHarvest} id={h.id} confirmText="Delete this harvest record?" />
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
