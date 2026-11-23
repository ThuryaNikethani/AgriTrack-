import type { BadgeVariant } from "@/components/ui/badge";

export type StockStatus = "OK" | "LOW" | "OUT";

export function getStockStatus(quantity: number, reorderLevel: number): StockStatus {
  if (quantity <= 0) return "OUT";
  if (quantity <= reorderLevel) return "LOW";
  return "OK";
}

export const stockBadge: Record<StockStatus, { label: string; variant: BadgeVariant }> = {
  OK: { label: "In stock", variant: "success" },
  LOW: { label: "Low stock - reorder", variant: "warning" },
  OUT: { label: "Out of stock", variant: "danger" },
};

export function stockRowClass(status: StockStatus): string {
  if (status === "OUT") return "bg-red-50/70 hover:bg-red-50";
  if (status === "LOW") return "bg-amber-50/70 hover:bg-amber-50";
  return "";
}
