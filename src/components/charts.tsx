"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

/** Brand palette: green & gold, with a muted red for costs. */
const COLORS = {
  revenue: "#339a43",
  revenueDark: "#1d632d",
  expenses: "#d9534f",
  expensesDark: "#a83a36",
  profit: "#c9932a",
  muted: "#cbd5c0",
};

const PIE_COLORS = ["#1d632d", "#e2b13a", "#57b565", "#a87322", "#8ccf96", "#eac65a"];

const lkr = (v: number) => `LKR ${Number(v).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

const compact = (v: number) => Number(v).toLocaleString("en-LK", { notation: "compact", maximumFractionDigits: 1 });

const axis = { fontSize: 12, fill: "#6b7280" };

function ChartTooltip({ active, payload, label, unit }: TooltipProps<number, string> & { unit?: "lkr" | "kg" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white/95 px-3.5 py-2.5 text-xs shadow-lift backdrop-blur">
      {label && <p className="mb-1.5 font-bold text-gray-900">{label}</p>}
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums text-gray-900">
              {unit === "kg" ? `${p.value} kg` : lkr(Number(p.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Rendered as a plain <defs> element: Recharts only renders SVG elements, not custom components.
const gradients = (
  <defs>
    <linearGradient id="g-revenue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={COLORS.revenue} />
      <stop offset="100%" stopColor={COLORS.revenueDark} />
    </linearGradient>
    <linearGradient id="g-expenses" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={COLORS.expenses} />
      <stop offset="100%" stopColor={COLORS.expensesDark} />
    </linearGradient>
    <linearGradient id="g-profit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#eac65a" />
      <stop offset="100%" stopColor="#a87322" />
    </linearGradient>
    <linearGradient id="g-profit-area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#e2b13a" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#e2b13a" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="g-expected" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#dbe4d3" />
      <stop offset="100%" stopColor="#b9c7ae" />
    </linearGradient>
  </defs>
);

const legendProps = {
  iconType: "circle" as const,
  iconSize: 8,
  wrapperStyle: { fontSize: 12, paddingTop: 8 },
};

export function IncomeExpenseChart({
  data,
}: {
  data: { label: string; revenue: number; expenses: number; profit: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4}>
        {gradients}
        <CartesianGrid strokeDasharray="4 4" stroke="#eef0ea" vertical={false} />
        <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={50} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(51 154 67 / 0.06)" }} />
        <Legend {...legendProps} />
        <Area
          type="monotone"
          dataKey="profit"
          name="Net profit"
          stroke={COLORS.profit}
          strokeWidth={2.5}
          fill="url(#g-profit-area)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
        />
        <Bar dataKey="revenue" name="Revenue" fill="url(#g-revenue)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        <Bar dataKey="expenses" name="Expenses" fill="url(#g-expenses)" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function BreakdownPie({ data }: { data: { label: string; value: number }[] }) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return <p className="py-16 text-center text-sm text-gray-400">No data for this period.</p>;
  }
  const total = filtered.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="label"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
            cy="45%"
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend {...legendProps} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[45%] -translate-y-1/2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</p>
        <p className="text-sm font-extrabold text-gray-900">{compact(total)}</p>
      </div>
    </div>
  );
}

export function CropProfitChart({
  data,
}: {
  data: { name: string; revenue: number; totalCost: number; profit: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4}>
        {gradients}
        <CartesianGrid strokeDasharray="4 4" stroke="#eef0ea" vertical={false} />
        <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={50} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(51 154 67 / 0.06)" }} />
        <Legend {...legendProps} />
        <Bar dataKey="revenue" name="Revenue" fill="url(#g-revenue)" radius={[6, 6, 0, 0]} maxBarSize={32} />
        <Bar dataKey="totalCost" name="Cost" fill="url(#g-expenses)" radius={[6, 6, 0, 0]} maxBarSize={32} />
        <Bar dataKey="profit" name="Profit" fill="url(#g-profit)" radius={[6, 6, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HarvestBarChart({
  data,
}: {
  data: { name: string; expected: number; actual: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4}>
        {gradients}
        <CartesianGrid strokeDasharray="4 4" stroke="#eef0ea" vertical={false} />
        <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} unit=" kg" width={60} />
        <Tooltip content={<ChartTooltip unit="kg" />} cursor={{ fill: "rgb(51 154 67 / 0.06)" }} />
        <Legend {...legendProps} />
        <Bar dataKey="expected" name="Expected" fill="url(#g-expected)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        <Bar dataKey="actual" name="Harvested" fill="url(#g-revenue)" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
