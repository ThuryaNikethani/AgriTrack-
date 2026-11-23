import { LogOut } from "lucide-react";
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

export function UserMenu({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white py-1 pl-1 pr-1 shadow-soft sm:pr-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-sm font-bold text-white ring-2 ring-gold-300/60">
        {initials(name) || "U"}
      </span>
      <div className="hidden leading-tight sm:block">
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-[12px] font-medium text-gold-600">{enumLabel(role)}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
