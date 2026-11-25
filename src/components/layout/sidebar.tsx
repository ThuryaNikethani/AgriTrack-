"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, X } from "lucide-react";
import { navGroups, navItems } from "./nav-items";
import { BrandLockup } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

export function Sidebar({
  isAdmin = false,
  open = false,
  onClose,
  unread = 0,
}: {
  isAdmin?: boolean;
  open?: boolean;
  onClose?: () => void;
  unread?: number;
}) {
  const pathname = usePathname();
  const items = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-green-950/40 backdrop-blur-sm lg:hidden print:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-green-950 text-green-50 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 print:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* decorative background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-green-900 via-green-950 to-[#04170b]" />
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-green-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-gold-400/15 blur-3xl" />

        <div className="relative flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link href="/dashboard" onClick={onClose}>
            <BrandLockup />
          </Link>
          <button className="rounded-lg p-1 text-green-200 hover:bg-white/10 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="relative flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {navGroups.map((group) => {
            const groupItems = items.filter((i) => i.group === group);
            if (groupItems.length === 0) return null;
            return (
              <div key={group}>
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300/80">{group}</p>
                <div className="space-y-1">
                  {groupItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-gradient-to-r from-white/15 to-white/5 text-white shadow-inner ring-1 ring-white/10"
                            : "text-green-100/75 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {active && (
                          <span className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-gold-300 to-gold-500" />
                        )}
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition",
                            active
                              ? "bg-gradient-to-br from-gold-300 to-gold-500 text-green-950 shadow-md shadow-black/20"
                              : "bg-white/5 text-green-200 group-hover:bg-white/10 group-hover:text-white",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.href === "/notifications" && unread > 0 && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="relative m-4 rounded-2xl border border-gold-300/20 bg-gradient-to-br from-gold-300/15 to-transparent p-4">
          <div className="flex items-center gap-2 text-gold-200">
            <Leaf className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-wider">Kurunduwatta</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-green-100/70">
            Fresh polytunnel vegetables for Villa &amp; Cottages guests and Tea Factory visitors.
          </p>
        </div>
      </aside>
    </>
  );
}
