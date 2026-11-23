"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { findNavItem } from "./nav-items";

export function AppShell({
  isAdmin,
  unread = 0,
  topbar,
  children,
}: {
  isAdmin: boolean;
  unread?: number;
  topbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = findNavItem(pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} open={open} onClose={() => setOpen(false)} unread={unread} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200/60 bg-white/70 px-4 backdrop-blur-xl sm:px-8 print:hidden">
          <button
            className="rounded-xl p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
            <span className="font-semibold text-gold-600">{current?.group ?? "AgriTrack"}</span>
            {current && (
              <>
                <span className="text-gray-300">/</span>
                <span className="truncate font-semibold text-gray-800">{current.label}</span>
              </>
            )}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">{topbar}</div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 sm:p-8 print:max-w-none print:p-0">{children}</main>
        <footer className="px-8 pb-6 text-center text-xs text-gray-400 print:hidden">
          © {new Date().getFullYear()} Athukorala Group · AgriTrack Polytunnel Management
        </footer>
      </div>
    </div>
  );
}
