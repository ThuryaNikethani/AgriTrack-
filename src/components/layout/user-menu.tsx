import Link from "next/link";
import { ChevronDown, KeyRound, LogOut, UserRound } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { enumLabel } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Avatar button with a dropdown: My account, Change password, Sign out. */
export function UserMenu({ name, email, role }: { name: string; email?: string | null; role: string }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl border border-gray-200/70 bg-white py-1 pl-1 pr-2 shadow-soft transition hover:border-gray-300 [&::-webkit-details-marker]:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-sm font-bold text-white ring-2 ring-gold-300/60">
          {initials(name) || "U"}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold text-gray-900">{name}</span>
          <span className="block text-[12px] font-medium text-gold-600">{enumLabel(role)}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-64 animate-fade-up overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lift">
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-gold-50/60 px-4 py-3">
          <p className="text-sm font-bold text-gray-900">{name}</p>
          {email && <p className="truncate text-xs text-gray-500">{email}</p>}
        </div>
        <nav className="p-1.5 text-sm">
          <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-800">
            <UserRound className="h-4 w-4" /> My account
          </Link>
          <Link href="/account#password" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-800">
            <KeyRound className="h-4 w-4" /> Change password
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </nav>
      </div>
    </details>
  );
}
