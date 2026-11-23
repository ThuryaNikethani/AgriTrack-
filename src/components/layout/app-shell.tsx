"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function AppShell({
  isAdmin,
  topbar,
  children,
}: {
  isAdmin: boolean;
  topbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6 print:hidden">
          <button
            className="rounded-md p-1.5 text-gray-700 hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center justify-end gap-3">{topbar}</div>
        </header>
        <main className="flex-1 p-4 sm:p-6 print:p-0">{children}</main>
      </div>
    </div>
  );
}
