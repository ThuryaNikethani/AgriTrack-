import { Badge } from "@/components/ui/badge";
import { getQuantity, getTiming, quantityBadge, timingBadge, type HarvestLike } from "@/lib/harvest";

export function HarvestTimingBadge({ harvest }: { harvest: HarvestLike }) {
  const { status, days } = getTiming(harvest);
  const cfg = timingBadge[status];
  return <Badge variant={cfg.variant}>{cfg.label(days)}</Badge>;
}

export function HarvestQuantityBadge({ harvest }: { harvest: HarvestLike }) {
  const q = getQuantity(harvest);
  if (!q) return <span className="text-gray-400">-</span>;
  const cfg = quantityBadge[q.status];
  const sign = q.variancePct > 0 ? "+" : "";
  return (
    <Badge variant={cfg.variant} title={`${sign}${q.variancePct.toFixed(1)}% vs expected`}>
      {cfg.label} ({sign}
      {q.variancePct.toFixed(0)}%)
    </Badge>
  );
}

export function HarvestLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm bg-red-100 ring-1 ring-red-200" /> Overdue, late or below target
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm bg-amber-100 ring-1 ring-amber-200" /> Due soon
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm bg-sky-100 ring-1 ring-sky-200" /> Above target
      </span>
    </div>
  );
}
