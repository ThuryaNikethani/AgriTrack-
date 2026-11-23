import Link from "next/link";
import { FileBarChart, HandCoins, Receipt, ShoppingBasket } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const actions = [
  { href: "/harvests?filter=pending", label: "Record harvest", icon: ShoppingBasket },
  { href: "/sales", label: "Record sale", icon: HandCoins },
  { href: "/expenses", label: "Add expense", icon: Receipt },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Colombo" }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero({ name, alerts }: { name: string; alerts: number }) {
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(new Date());

  return (
    <section className="relative mb-8 animate-fade-up overflow-hidden rounded-3xl bg-green-950 p-6 text-white shadow-lift sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-700 via-green-900 to-green-950" />
      <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-gold-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-green-400/20 blur-3xl" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
        <defs>
          <pattern id="hero-rows" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
            <path d="M0 20 Q10 10 20 20 T40 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-rows)" />
      </svg>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <BrandLogo className="hidden h-20 w-20 shadow-xl shadow-black/30 sm:block" />
          <div>
            <p className="text-sm font-semibold text-gold-300">{today}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
              {greeting()}, {name.split(" ")[0]}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-green-50/80">
              {alerts > 0
                ? `${alerts} item${alerts === 1 ? "" : "s"} need${alerts === 1 ? "s" : ""} your attention in the Kurunduwatta polytunnel today.`
                : "Everything in the Kurunduwatta polytunnel is on track today."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {actions.map(({ href, label, icon: Icon }, i) => (
            <Link
              key={href}
              href={href}
              className={
                i === 0
                  ? "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 px-4 py-2.5 text-sm font-bold text-green-950 shadow-lg shadow-black/20 transition hover:from-gold-200 hover:to-gold-400"
                  : "inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/15 backdrop-blur transition hover:bg-white/20"
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
