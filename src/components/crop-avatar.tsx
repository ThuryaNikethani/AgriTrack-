import Link from "next/link";
import type { CropStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cropStatusVariant } from "@/lib/crops";
import { cn, enumLabel } from "@/lib/utils";
import { findVegetable } from "@/lib/vegetables";

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

const sizes = {
  sm: "h-8 w-8 rounded-lg text-sm",
  md: "h-10 w-10 rounded-xl text-base",
  lg: "h-16 w-16 rounded-2xl text-2xl",
};

/** Crop photo from the vegetable catalogue, or a coloured initial when there is no photo. */
export function CropAvatar({ name, size = "md" }: { name: string; size?: keyof typeof sizes }) {
  const photo = findVegetable(name)?.image;
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={cn("shrink-0 object-cover shadow-sm ring-2 ring-white", sizes[size])}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gradient-to-br font-extrabold shadow-sm",
        paletteFor(name),
        sizes[size],
      )}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** Photo strip at the top of a crop card, with the status badge on top. */
export function CropBanner({ name, status }: { name: string; status: CropStatus }) {
  const photo = findVegetable(name)?.image;
  return (
    <div className="relative h-40 overflow-hidden">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br", paletteFor(name))}>
          <span className="text-6xl font-extrabold opacity-90">{name.trim().charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      <Badge variant={cropStatusVariant[status]} className="absolute right-3 top-3 bg-white/95 shadow">
        {enumLabel(status)}
      </Badge>
    </div>
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
