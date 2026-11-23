import { Badge } from "@/components/ui/badge";
import { getStockStatus, stockBadge } from "@/lib/stock";

export function StockBadge({ quantity, reorderLevel }: { quantity: number; reorderLevel: number }) {
  const cfg = stockBadge[getStockStatus(quantity, reorderLevel)];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
