import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { toDateInput } from "@/lib/utils";

export type PeriodPreset = { key: string; label: string; from: string; to: string };

/** Quick period choices for reports (weeks start on Monday). */
export function getPeriodPresets(now = new Date()): PeriodPreset[] {
  const week = { weekStartsOn: 1 as const };
  const make = (key: string, label: string, from: Date, to: Date): PeriodPreset => ({
    key,
    label,
    from: toDateInput(from),
    to: toDateInput(to),
  });
  const lastWeek = subWeeks(now, 1);
  const lastMonth = subMonths(now, 1);
  const lastYear = subYears(now, 1);

  return [
    make("today", "Today", now, now),
    make("yesterday", "Yesterday", subDays(now, 1), subDays(now, 1)),
    make("this-week", "This week", startOfWeek(now, week), endOfWeek(now, week)),
    make("last-week", "Last week", startOfWeek(lastWeek, week), endOfWeek(lastWeek, week)),
    make("this-month", "This month", startOfMonth(now), endOfMonth(now)),
    make("last-month", "Last month", startOfMonth(lastMonth), endOfMonth(lastMonth)),
    make("this-year", "This year", startOfYear(now), endOfYear(now)),
    make("last-year", "Last year", startOfYear(lastYear), endOfYear(lastYear)),
  ];
}

/** The preset matching a date range, if any. */
export function matchPreset(from: string, to: string, now = new Date()) {
  return getPeriodPresets(now).find((p) => p.from === from && p.to === to);
}
