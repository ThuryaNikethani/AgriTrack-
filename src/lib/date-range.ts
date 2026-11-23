import { endOfDay, isValid, parseISO, startOfDay, startOfMonth } from "date-fns";
import { toDateInput } from "@/lib/utils";

export type DateRange = { from: Date; to: Date; fromInput: string; toInput: string };

/** Parses ?from=YYYY-MM-DD&to=YYYY-MM-DD, defaulting to the current month. */
export function parseDateRange(params: { from?: string; to?: string }, defaultFrom?: Date): DateRange {
  const now = new Date();
  const parsedFrom = params.from ? parseISO(params.from) : undefined;
  const parsedTo = params.to ? parseISO(params.to) : undefined;

  const from = startOfDay(parsedFrom && isValid(parsedFrom) ? parsedFrom : (defaultFrom ?? startOfMonth(now)));
  const to = endOfDay(parsedTo && isValid(parsedTo) ? parsedTo : now);

  return { from, to, fromInput: toDateInput(from), toInput: toDateInput(to) };
}
