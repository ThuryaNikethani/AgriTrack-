import type { CustomerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const customerTypeLabel: Record<CustomerType, string> = {
  VILLA: "Kurunduwatta Villa",
  TEA_FACTORY: "Tea Factory",
  EXTERNAL: "External Customer",
};

export type CropStock = {
  cropId: string;
  name: string;
  variety: string | null;
  bedLocation: string | null;
  harvestedKg: number;
  soldKg: number;
  availableKg: number;
};

/** Harvested vs sold quantity per crop (remaining vegetable stock). */
export async function getCropStock(where?: { cropId?: string }): Promise<CropStock[]> {
  const [crops, harvests, sales] = await Promise.all([
    prisma.crop.findMany({
      where: where?.cropId ? { id: where.cropId } : undefined,
      select: { id: true, name: true, variety: true, bedLocation: true },
      orderBy: { name: "asc" },
    }),
    prisma.harvest.groupBy({
      by: ["cropId"],
      where: where?.cropId ? { cropId: where.cropId } : undefined,
      _sum: { actualQuantityKg: true },
    }),
    prisma.sale.groupBy({
      by: ["cropId"],
      where: where?.cropId ? { cropId: where.cropId } : undefined,
      _sum: { quantityKg: true },
    }),
  ]);

  const harvested = new Map(harvests.map((h) => [h.cropId, h._sum.actualQuantityKg ?? 0]));
  const sold = new Map(sales.map((s) => [s.cropId, s._sum.quantityKg ?? 0]));

  return crops.map((c) => {
    const harvestedKg = harvested.get(c.id) ?? 0;
    const soldKg = sold.get(c.id) ?? 0;
    return {
      cropId: c.id,
      name: c.name,
      variety: c.variety,
      bedLocation: c.bedLocation,
      harvestedKg,
      soldKg,
      availableKg: Math.max(0, Math.round((harvestedKg - soldKg) * 1000) / 1000),
    };
  });
}
