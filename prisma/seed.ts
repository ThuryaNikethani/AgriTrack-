import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n: number) => {
  const d = new Date(Date.now() + n * DAY);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  await prisma.user.upsert({
    where: { email: "admin@agritrack.local" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@agritrack.local",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@agritrack.local" },
    update: {},
    create: {
      name: "Polytunnel Staff",
      email: "staff@agritrack.local",
      passwordHash: staffPassword,
      role: "STAFF",
    },
  });

  if ((await prisma.crop.count()) > 0) {
    console.log("Sample data already present - skipping.");
    return;
  }

  const tomato = await prisma.crop.create({
    data: {
      name: "Tomato",
      variety: "Thilina",
      bedLocation: "Bed A",
      plantedDate: daysFromNow(-75),
      expectedHarvestDate: daysFromNow(-12),
      plantedQuantity: 120,
      expectedYieldKg: 180,
      status: "HARVESTING",
      harvests: {
        create: [
          { scheduledDate: daysFromNow(-12), expectedQuantityKg: 25, actualDate: daysFromNow(-12), actualQuantityKg: 26 },
          { scheduledDate: daysFromNow(-5), expectedQuantityKg: 30, actualDate: daysFromNow(-3), actualQuantityKg: 21 },
          { scheduledDate: daysFromNow(-1), expectedQuantityKg: 30 },
          { scheduledDate: daysFromNow(2), expectedQuantityKg: 30 },
        ],
      },
    },
  });

  const lettuce = await prisma.crop.create({
    data: {
      name: "Lettuce",
      variety: "Iceberg",
      bedLocation: "Bed B",
      plantedDate: daysFromNow(-40),
      expectedHarvestDate: daysFromNow(3),
      plantedQuantity: 200,
      expectedYieldKg: 60,
      status: "GROWING",
      harvests: { create: [{ scheduledDate: daysFromNow(3), expectedQuantityKg: 60 }] },
    },
  });

  const capsicum = await prisma.crop.create({
    data: {
      name: "Capsicum",
      variety: "California Wonder",
      bedLocation: "Bed C",
      plantedDate: daysFromNow(-90),
      expectedHarvestDate: daysFromNow(-20),
      plantedQuantity: 80,
      expectedYieldKg: 90,
      status: "HARVESTING",
      harvests: {
        create: [
          { scheduledDate: daysFromNow(-20), expectedQuantityKg: 20, actualDate: daysFromNow(-20), actualQuantityKg: 22 },
          { scheduledDate: daysFromNow(-10), expectedQuantityKg: 20, actualDate: daysFromNow(-9), actualQuantityKg: 19.5 },
        ],
      },
    },
  });

  const compost = await prisma.fertilizer.create({
    data: { name: "Compost", type: "ORGANIC", unit: "kg", currentStock: 120, reorderLevel: 50, supplier: "Local supplier" },
  });
  const npk = await prisma.fertilizer.create({
    data: { name: "NPK 20-20-20", type: "CHEMICAL", unit: "kg", currentStock: 4, reorderLevel: 10, supplier: "Agro shop" },
  });

  await prisma.fertilizerUsage.createMany({
    data: [
      { fertilizerId: compost.id, cropId: tomato.id, date: daysFromNow(-60), quantity: 30 },
      { fertilizerId: npk.id, cropId: tomato.id, date: daysFromNow(-30), quantity: 3 },
      { fertilizerId: npk.id, cropId: capsicum.id, date: daysFromNow(-25), quantity: 2 },
      { fertilizerId: compost.id, cropId: lettuce.id, date: daysFromNow(-35), quantity: 15 },
    ],
  });

  await prisma.inventoryItem.createMany({
    data: [
      { name: "Tomato seeds", category: "SEED", unit: "packets", quantity: 6, reorderLevel: 2 },
      { name: "Lettuce seeds", category: "SEED", unit: "packets", quantity: 1, reorderLevel: 2 },
      { name: "Drip irrigation tubes", category: "SUPPLY", unit: "rolls", quantity: 3, reorderLevel: 1 },
      { name: "Pruning shears", category: "EQUIPMENT", unit: "pcs", quantity: 4, reorderLevel: 1 },
    ],
  });

  await prisma.sale.createMany({
    data: [
      { cropId: tomato.id, saleDate: daysFromNow(-11), quantityKg: 15, unitPrice: 450, totalAmount: 6750, customerType: "VILLA" },
      { cropId: tomato.id, saleDate: daysFromNow(-10), quantityKg: 8, unitPrice: 500, totalAmount: 4000, customerType: "EXTERNAL", customerName: "Visitor" },
      { cropId: capsicum.id, saleDate: daysFromNow(-19), quantityKg: 12, unitPrice: 900, totalAmount: 10800, customerType: "VILLA" },
      { cropId: capsicum.id, saleDate: daysFromNow(-8), quantityKg: 10, unitPrice: 950, totalAmount: 9500, customerType: "TEA_FACTORY" },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { date: daysFromNow(-75), category: "SEEDS", description: "Tomato seedlings", amount: 6000, cropId: tomato.id },
      { date: daysFromNow(-90), category: "SEEDS", description: "Capsicum seedlings", amount: 5200, cropId: capsicum.id },
      { date: daysFromNow(-40), category: "SEEDS", description: "Lettuce seeds", amount: 1500, cropId: lettuce.id },
      { date: daysFromNow(-30), category: "LABOUR", description: "Weekly labour", amount: 8000 },
      { date: daysFromNow(-15), category: "MAINTENANCE", description: "Polytunnel sheet repair", amount: 4500 },
      { date: daysFromNow(-60), category: "FERTILIZER", description: "Compost 150kg", amount: 7500 },
    ],
  });

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
