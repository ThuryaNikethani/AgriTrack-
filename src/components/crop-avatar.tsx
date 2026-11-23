import Link from "next/link";
import { cn } from "@/lib/utils";

const PALETTES = [
  "from-green-400 to-green-700 text-white",
  "from-gold-200 to-gold-500 text-green-950",
  "from-lime-300 to-green-600 text-white",
  "from-emerald-300 to-teal-600 text-white",
  "from-orange-300 to-red-500 text-white",
  "from-yellow-200 to-lime-500 text-green-950",
];

function paletteFor(name: string) {
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

/** Coloured initial badge for a vegetable / crop name. */
export function CropAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-extrabold shadow-sm",
        paletteFor(name),
        size === "sm" && "h-8 w-8 text-sm",
        size === "md" && "h-10 w-10 text-base",
        size === "lg" && "h-16 w-16 rounded-2xl text-2xl",
      )}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** Table cell content: avatar + crop name link + secondary line. */
export function CropCell({ id, name, sub }: { id: string; name: string; sub?: string | null }) {
  return (
    <Link href={`/crops/${id}`} className="group flex items-center gap-3">
      <CropAvatar name={name} size="sm" />
      <span className="leading-tight">
        <span className="block font-semibold text-gray-900 group-hover:text-green-700">{name}</span>
        {sub && <span className="block text-xs text-gray-500">{sub}</span>}
      </span>
    </Link>
  );
}

/** Thin progress bar with green fill (gold when complete, red when far behind). */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-100", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r transition-all",
          pct >= 100 ? "from-gold-300 to-gold-500" : "from-green-400 to-green-600",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
