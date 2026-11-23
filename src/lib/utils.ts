import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Converts Prisma Decimal / string / number values to a plain number. */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 2,
});

export function formatCurrency(value: unknown): string {
  return currencyFormatter.format(toNumber(value));
}

export function formatNumber(value: unknown, digits = 2): string {
  return toNumber(value).toLocaleString("en-LK", {
    maximumFractionDigits: digits,
  });
}

export function formatKg(value: unknown): string {
  return `${formatNumber(value)} kg`;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return format(new Date(value), "dd MMM yyyy");
}

/** Value for <input type="date" /> */
export function toDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  return format(new Date(value), "yyyy-MM-dd");
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Human readable label for an enum value e.g. TEA_FACTORY -> Tea Factory */
export function enumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
