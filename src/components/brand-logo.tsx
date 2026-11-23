"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Path of the company logo inside /public. */
export const LOGO_SRC = "/athukorala-logo.png";

/**
 * Athukorala Group logo. Falls back to an "AG" monogram until
 * public/athukorala-logo.png is added.
 */
export function BrandLogo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The image may fail before React hydrates (onError would be missed), so check once mounted.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-700 font-extrabold text-white",
          className,
        )}
        aria-label="Athukorala Group"
      >
        AG
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={LOGO_SRC}
      alt="Athukorala Group"
      className={cn("rounded-full bg-white object-contain ring-2 ring-gold-300/70", className)}
      onError={() => setFailed(true)}
    />
  );
}

/** Logo with the company and product names. */
export function BrandLockup({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div className="flex items-center gap-3">
      <BrandLogo className="h-11 w-11 shrink-0 shadow-lg shadow-black/20" />
      <div className="min-w-0 leading-tight">
        <p
          className={cn(
            "truncate text-[14px] font-extrabold uppercase tracking-[0.12em]",
            tone === "light" ? "text-white" : "text-green-800",
          )}
        >
          Athukorala Group
        </p>
        <p className={cn("text-[12px] font-semibold", tone === "light" ? "text-gold-300" : "text-gold-600")}>
          AgriTrack · Polytunnel
        </p>
      </div>
    </div>
  );
}
