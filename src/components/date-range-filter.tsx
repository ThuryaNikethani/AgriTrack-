import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form-controls";

type Option = { value: string; label: string };

/** GET form used to filter list pages by date range and an optional select. */
export function DateRangeFilter({
  from,
  to,
  select,
}: {
  from: string;
  to: string;
  select?: { name: string; label: string; value?: string; options: Option[] };
}) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-3 print:hidden">
      <div className="flex flex-col gap-1">
        <Label htmlFor="from">From</Label>
        <Input id="from" name="from" type="date" defaultValue={from} className="w-40" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="to">To</Label>
        <Input id="to" name="to" type="date" defaultValue={to} className="w-40" />
      </div>
      {select && (
        <div className="flex flex-col gap-1">
          <Label htmlFor={select.name}>{select.label}</Label>
          <Select id={select.name} name={select.name} defaultValue={select.value ?? ""} className="w-48">
            <option value="">All</option>
            {select.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      )}
      <Button type="submit" variant="outline">
        Apply
      </Button>
    </form>
  );
}
