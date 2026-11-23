import type { ExpenseCategory } from "@prisma/client";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; examples: string }[] = [
  { value: "FERTILIZER", label: "Fertilizer", examples: "Organic / chemical fertilizer" },
  { value: "SEEDS", label: "Seeds", examples: "Vegetable seeds, seedlings" },
  { value: "LABOUR", label: "Labour", examples: "Daily labour payments" },
  { value: "EQUIPMENT", label: "Equipment", examples: "Farming tools" },
  { value: "MAINTENANCE", label: "Maintenance", examples: "Polytunnel repairs" },
  { value: "OTHER", label: "Other", examples: "Transport and miscellaneous" },
];

export const expenseCategoryLabel = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<ExpenseCategory, string>;
