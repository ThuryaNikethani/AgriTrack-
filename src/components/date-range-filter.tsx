import { CalendarRange, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form-controls";

type Option = { value: string; label: string };

/** GET form used to filter list pages by date range and an optional select. */
export function DateRangeFilter({
  from,
  to,
  select,
  hidden,
}: {
  from: string;
  to: string;
  select?: { name: string; label: string; value?: string; options: Option[] };
  /** Extra query parameters to keep when the filter is applied. */
  hidden?: Record<string, string>;
}) {
  return (
    <form
      method="get"
      className="mb-6 flex animate-fade-up flex-wrap items-end gap-4 rounded-2xl border border-gray-200/70 bg-white/90 p-4 shadow-soft print:hidden"
    >
      {hidden &&
        Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      <div className="flex items-center gap-3 self-center pr-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-200 to-gold-400 text-green-950">
          <CalendarRange className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-gray-900">Filter</p>
          <p className="text-xs text-gray-500">Choose a period</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="from">From</Label>
        <Input id="from" name="from" type="date" defaultValue={from} className="w-44" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="to">To</Label>
        <Input id="to" name="to" type="date" defaultValue={to} className="w-44" />
      </div>
      {select && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={select.name}>{select.label}</Label>
          <Select id={select.name} name={select.name} defaultValue={select.value ?? ""} className="w-52">
            <option value="">All</option>
            {select.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      )}
      <Button type="submit">
        <SlidersHorizontal /> Apply
      </Button>
    </form>
  );
}
