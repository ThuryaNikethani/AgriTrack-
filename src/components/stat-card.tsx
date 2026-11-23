import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  green: { icon: "from-green-500 to-green-700 text-white shadow-green-700/30", glow: "bg-green-400/15" },
  gold: { icon: "from-gold-300 to-gold-500 text-green-950 shadow-gold-600/30", glow: "bg-gold-300/20" },
  amber: { icon: "from-gold-300 to-gold-500 text-green-950 shadow-gold-600/30", glow: "bg-gold-300/20" },
  red: { icon: "from-red-400 to-red-600 text-white shadow-red-600/30", glow: "bg-red-400/15" },
  sky: { icon: "from-sky-400 to-sky-600 text-white shadow-sky-600/30", glow: "bg-sky-400/15" },
  gray: { icon: "from-gray-100 to-gray-200 text-gray-600 shadow-gray-400/20", glow: "bg-gray-300/15" },
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
  const t = tones[tone];
  return (
    <div className="group relative animate-fade-up overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl", t.glow)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 truncate text-[26px] font-extrabold leading-none tracking-tight text-gray-900">{value}</p>
          {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition group-hover:scale-105",
              t.icon,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}
