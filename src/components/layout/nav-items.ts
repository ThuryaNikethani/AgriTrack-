import {
  Boxes,
  FlaskConical,
  HandCoins,
  LayoutDashboard,
  ShoppingBasket,
  Sprout,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crops", label: "Crops", icon: Sprout },
  { href: "/harvests", label: "Harvests", icon: ShoppingBasket },
  { href: "/sales", label: "Sales", icon: HandCoins },
  { href: "/fertilizers", label: "Fertilizers", icon: FlaskConical },
  { href: "/inventory", label: "Inventory", icon: Boxes },
];
