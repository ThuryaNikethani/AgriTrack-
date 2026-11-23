import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { enumLabel } from "@/lib/utils";

export function UserMenu({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight sm:block">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{enumLabel(role)}</p>
      </div>
      <form action={logoutAction}>
        <Button variant="outline" size="sm" type="submit">
          <LogOut />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </form>
    </div>
  );
}
