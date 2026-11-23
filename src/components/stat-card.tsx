import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  sky: "bg-sky-50 text-sky-700",
  gray: "bg-gray-100 text-gray-700",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold text-gray-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        {Icon && (
          <span className={cn("rounded-md p-2", tones[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}
