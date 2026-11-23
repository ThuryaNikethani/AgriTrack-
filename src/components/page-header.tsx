"use client";

import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { findNavItem } from "@/components/layout/nav-items";

/**
 * Page banner: dark green with gold accents, an icon for the section and
 * optional actions. The icon and section name come from the navigation.
 */
export function PageHeader({
  title,
  description,
  actions,
  icon,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  eyebrow?: string;
}) {
  const pathname = usePathname();
  const item = findNavItem(pathname);
  const Icon = icon ?? item?.icon;

  return (
    // z-20 + decoration clipped in its own layer, so dropdowns in `actions` can overflow the banner.
    <section className="relative z-20 mb-8 animate-fade-up rounded-3xl bg-green-950 px-6 py-6 text-white shadow-lift sm:px-8 sm:py-7 print:mb-4 print:bg-white print:p-0 print:text-black print:shadow-none">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl print:hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-900 to-green-950" />
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gold-400/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-green-400/15 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.05]">
          <defs>
            <pattern id="page-rows" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
              <path d="M0 20 Q10 10 20 20 T40 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#page-rows)" />
        </svg>
      </div>

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-200 to-gold-500 text-green-950 shadow-lg shadow-black/25 ring-4 ring-white/10 print:hidden">
              <Icon className="h-7 w-7" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gold-300 print:text-gray-500">
              {eyebrow ?? item?.group ?? "AgriTrack"}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
            {description && (
              <p className="mt-1.5 max-w-2xl text-sm text-green-50/75 print:text-gray-600">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 print:hidden">{actions}</div>}
      </div>
    </section>
  );
}
