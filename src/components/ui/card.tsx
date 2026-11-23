import * as React from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Boxes,
  FlaskConical,
  HandCoins,
  Info,
  Leaf,
  PackagePlus,
  PieChart,
  PlusCircle,
  Receipt,
  ShoppingBasket,
  Sprout,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-fade-up overflow-hidden rounded-2xl border border-gray-200/70 bg-white/95 shadow-soft transition-shadow hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-gray-100 bg-gradient-to-r from-green-50/90 via-gold-50/40 to-white px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

/** Picks an icon from the card title so every card gets a matching symbol. */
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/^(record|add|new|schedule)\b/i, PlusCircle],
  [/restock|purchase/i, PackagePlus],
  [/movement|in \/ out/i, ArrowLeftRight],
  [/fertili[sz]er|usage/i, FlaskConical],
  [/sale|revenue/i, HandCoins],
  [/expense/i, Receipt],
  [/profit/i, TrendingUp],
  [/category/i, PieChart],
  [/harvest/i, ShoppingBasket],
  [/stock|inventory|seeds|reorder/i, Boxes],
  [/crop/i, Sprout],
  [/account|user/i, Users],
  [/income|chart|vs/i, BarChart3],
  [/notification|alert/i, Bell],
  [/detail/i, Info],
];

function firstText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    for (const c of children) {
      const t = firstText(c);
      if (t) return t;
    }
  }
  return "";
}

export function CardTitle({
  className,
  icon,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { icon?: LucideIcon }) {
  const text = firstText(children);
  const Icon = icon ?? ICON_RULES.find(([re]) => re.test(text))?.[1] ?? Leaf;
  return (
    // A trailing element (link / badge) after the title text is pushed to the right.
    <h3
      className={cn(
        "flex items-center gap-3 text-[16px] font-bold tracking-tight text-gray-900 [&>*:last-child:not(:first-child)]:ml-auto",
        className,
      )}
      {...props}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white shadow-md shadow-green-900/20 ring-2 ring-gold-200/70">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {children}
    </h3>
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
