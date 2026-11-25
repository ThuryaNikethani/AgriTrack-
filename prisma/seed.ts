import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { VEGETABLES } from "../src/lib/vegetables";

const prisma = new PrismaClient();

/** All crops on the Plant Identification cards were planted on 07-09-2026. */
const PLANTED = new Date("2026-09-07T00:00:00+05:30");

/**
 * Plant numbers and yields are not known yet - these are placeholders
 * (PLANTS plants x typical kg per plant) to be corrected from the Crops page.
 */
const PLANTS = 20;
const KG_PER_PLANT: Record<string, number> = {
  Tomato: 3,
  Capsicum: 1.5,
  Chilli: 0.8,
  "Nai miris": 0.5,
  Cabbage: 1.2,
  "Red cabbage": 1,
  "Green beans": 0.4,
  Radish: 0.25,
  Carrot: 0.12,
  "Spring onion": 0.15,
  "Salad cucumber": 3,
};

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000);

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@agritrack.local" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@agritrack.local",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { email: "staff@agritrack.local" },
    update: {},
    create: {
      name: "Polytunnel Staff",
      email: "staff@agritrack.local",
      passwordHash: await bcrypt.hash("staff123", 10),
      role: "STAFF",
    },
  });

  if ((await prisma.crop.count()) > 0) {
    console.log("Crops already exist - skipping crop data.");
    return;
  }

  for (const veg of VEGETABLES) {
    const expectedHarvestDate = addDays(PLANTED, veg.daysToHarvest);
    const expectedYieldKg = Math.round(PLANTS * (KG_PER_PLANT[veg.name] ?? 1) * 100) / 100;
    await prisma.crop.create({
      data: {
        name: veg.name,
        scientificName: veg.scientificName,
        plantedDate: PLANTED,
        expectedHarvestDate,
        plantedQuantity: PLANTS,
        expectedYieldKg,
        status: "GROWING",
        notes: "Number of plants and expected yield are estimates - please update.",
        harvests: { create: { scheduledDate: expectedHarvestDate, expectedQuantityKg: expectedYieldKg } },
      },
    });
  }
  console.log(`Created ${VEGETABLES.length} polytunnel crops.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
