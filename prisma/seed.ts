import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { VEGETABLES } from "../src/lib/vegetables";

const prisma = new PrismaClient();

/** All crops on the Plant Identification cards were planted on 07-09-2026. */
const PLANTED = new Date("2026-09-07T00:00:00+05:30");

/** Number of plants in the polytunnel: 50 tomato plants, 25 of every other crop. */
const plantsFor = (name: string) => (name === "Tomato" ? 50 : 25);

/**
 * Expected yield = plants x typical kg per plant. The per-plant figures are
 * estimates, to be corrected from the Crops page.
 */
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
    const plants = plantsFor(veg.name);
    const expectedYieldKg = Math.round(plants * (KG_PER_PLANT[veg.name] ?? 1) * 100) / 100;
    await prisma.crop.create({
      data: {
        name: veg.name,
        scientificName: veg.scientificName,
        plantedDate: PLANTED,
        expectedHarvestDate,
        plantedQuantity: plants,
        expectedYieldKg,
        status: "GROWING",
        notes: "Expected yield is an estimate - please update.",
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
