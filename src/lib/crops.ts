import type { CropStatus } from "@prisma/client";
import type { BadgeVariant } from "@/components/ui/badge";

export const cropStatusVariant: Record<CropStatus, BadgeVariant> = {
  GROWING: "info",
  HARVESTING: "success",
  COMPLETED: "default",
  FAILED: "danger",
};

export function cropLabel(crop: { name: string; variety?: string | null; bedLocation?: string | null }) {
  const parts = [crop.name];
  if (crop.variety) parts[0] += ` (${crop.variety})`;
  if (crop.bedLocation) parts.push(crop.bedLocation);
  return parts.join(" - ");
}
