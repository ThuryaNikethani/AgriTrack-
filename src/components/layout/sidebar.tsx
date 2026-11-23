"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, X } from "lucide-react";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";

export function Sidebar({
  isAdmin = false,
  open = false,
  onClose,
}: {
  isAdmin?: boolean;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const items = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden print:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-green-900/20 bg-green-900 text-green-50 transition-transform lg:static lg:translate-x-0 print:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <Sprout className="h-7 w-7 text-green-300" />
            <div className="leading-tight">
              <p className="text-lg font-bold">AgriTrack</p>
              <p className="text-[11px] text-green-300">Kurunduwatta Polytunnel</p>
            </div>
          </Link>
          <button className="lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-green-700 text-white" : "text-green-100 hover:bg-green-800",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="px-5 py-4 text-[11px] text-green-400">Athukorala Tea Factory</p>
      </aside>
    </>
  );
}
