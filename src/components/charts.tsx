"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = {
  revenue: "#15803d",
  expenses: "#dc2626",
  profit: "#0369a1",
};

const PIE_COLORS = ["#15803d", "#0369a1", "#ca8a04", "#9333ea", "#dc2626", "#64748b"];

const lkr = (v: number) =>
  `LKR ${Number(v).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

const compact = (v: number) =>
  Number(v).toLocaleString("en-LK", { notation: "compact", maximumFractionDigits: 1 });

export function IncomeExpenseChart({
  data,
}: {
  data: { label: string; revenue: number; expenses: number; profit: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={compact} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => lkr(v)} />
        <Legend />
        <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[3, 3, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill={COLORS.expenses} radius={[3, 3, 0, 0]} />
        <Line type="monotone" dataKey="profit" name="Net profit" stroke={COLORS.profit} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function BreakdownPie({ data }: { data: { label: string; value: number }[] }) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return <p className="py-16 text-center text-sm text-gray-500">No data for this period.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={filtered} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {filtered.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => lkr(v)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CropProfitChart({
  data,
}: {
  data: { name: string; revenue: number; totalCost: number; profit: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={compact} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => lkr(v)} />
        <Legend />
        <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[3, 3, 0, 0]} />
        <Bar dataKey="totalCost" name="Cost" fill={COLORS.expenses} radius={[3, 3, 0, 0]} />
        <Bar dataKey="profit" name="Profit" fill={COLORS.profit} radius={[3, 3, 0, 0]} />
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
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit=" kg" />
        <Tooltip formatter={(v: number) => `${v} kg`} />
        <Legend />
        <Bar dataKey="expected" name="Expected" fill="#94a3b8" radius={[3, 3, 0, 0]} />
        <Bar dataKey="actual" name="Harvested" fill={COLORS.revenue} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
