import {
  Bell,
  Boxes,
  FileBarChart,
  FlaskConical,
  HandCoins,
  LayoutDashboard,
  LineChart,
  Receipt,
  ShoppingBasket,
  Sprout,
  Users,
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
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/finance", label: "Finance", icon: LineChart },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/fertilizers", label: "Fertilizers", icon: FlaskConical },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/users", label: "Users", icon: Users, adminOnly: true },
];
