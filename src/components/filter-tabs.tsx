import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterTab = { href: string; label: string; active: boolean; count?: number };

/** Segmented control used for list filters (status, period, ...). */
export function FilterTabs({ tabs, className }: { tabs: FilterTab[]; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-gray-200/70 bg-white/90 p-1.5 shadow-soft print:hidden",
        className,
      )}
    >
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
            t.active
              ? "bg-gradient-to-b from-green-600 to-green-700 text-white shadow-md shadow-green-900/20"
              : "text-gray-600 hover:bg-green-50 hover:text-green-800",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                t.active ? "bg-gold-300 text-green-950" : "bg-gray-100 text-gray-600",
              )}
            >
              {t.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
