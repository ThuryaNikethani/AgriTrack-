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
  group: NavGroup;
  adminOnly?: boolean;
};

export type NavGroup = "Overview" | "Cultivation" | "Business" | "Administration";

export const navGroups: NavGroup[] = ["Overview", "Cultivation", "Business", "Administration"];

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { href: "/notifications", label: "Notifications", icon: Bell, group: "Overview" },
  { href: "/crops", label: "Crops", icon: Sprout, group: "Cultivation" },
  { href: "/harvests", label: "Harvests", icon: ShoppingBasket, group: "Cultivation" },
  { href: "/fertilizers", label: "Fertilizers", icon: FlaskConical, group: "Cultivation" },
  { href: "/inventory", label: "Inventory", icon: Boxes, group: "Cultivation" },
  { href: "/sales", label: "Sales", icon: HandCoins, group: "Business" },
  { href: "/expenses", label: "Expenses", icon: Receipt, group: "Business" },
  { href: "/finance", label: "Finance", icon: LineChart, group: "Business" },
  { href: "/reports", label: "Reports", icon: FileBarChart, group: "Business" },
  { href: "/users", label: "Users", icon: Users, group: "Administration", adminOnly: true },
];

export function findNavItem(pathname: string) {
  return navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
