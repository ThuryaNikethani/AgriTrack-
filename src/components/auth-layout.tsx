import { BarChart3, Bell, Leaf, ShoppingBasket } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const PHOTOS = [
  "/crops/tomato.jpg",
  "/crops/capsicum.jpg",
  "/crops/red-cabbage.jpg",
  "/crops/carrot.jpg",
  "/crops/green-beans.jpg",
  "/crops/nai-miris.jpg",
];

const highlights = [
  { icon: ShoppingBasket, text: "Every harvest tracked against its schedule and target" },
  { icon: Bell, text: "Reminders before fertilizer and seeds run out" },
  { icon: BarChart3, text: "Income, expenses and profit for each crop" },
];

/** Shared layout for the sign-in, forgot-password and reset-password pages. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen bg-[#f4f5ef] lg:grid-cols-[1.15fr_1fr]">
      {/* Brand panel with polytunnel photos */}
      <section className="relative hidden overflow-hidden bg-green-950 text-white lg:block">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 opacity-60">
          {PHOTOS.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="h-full w-full object-cover" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/95 via-green-900/85 to-green-950/70" />
        <div className="absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-gold-400/25 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-4">
            <BrandLogo className="h-16 w-16 shadow-xl shadow-black/40" />
            <div>
              <p className="text-lg font-extrabold uppercase tracking-[0.16em]">Athukorala Group</p>
              <p className="text-sm font-semibold text-gold-300">Kurunduwatta Villa &amp; Cottages</p>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-gold-300/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-200 backdrop-blur">
              <Leaf className="h-3.5 w-3.5" /> AgriTrack · Smart Polytunnel
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.08] xl:text-6xl">
              Fresh from our polytunnel,
              <span className="block bg-gradient-to-r from-gold-200 via-gold-300 to-gold-400 bg-clip-text text-transparent">
                managed with care.
              </span>
            </h1>
            <ul className="mt-10 space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-4 text-green-50/90">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                    <Icon className="h-5 w-5 text-gold-300" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-green-100/60">
            © {new Date().getFullYear()} Athukorala Group (Pvt) Ltd · Pitigala, Sri Lanka
          </p>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex items-center justify-center overflow-hidden p-6 sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-green-400/15 blur-3xl" />

        <div className="relative w-full max-w-md animate-fade-up">
          <div className="mb-8 flex flex-col items-center text-center">
            <BrandLogo className="h-20 w-20 shadow-lg lg:hidden" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-gold-600 lg:mt-0">AgriTrack</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-green-950">{title}</h2>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/90 p-7 shadow-lift ring-1 ring-gray-200/60 backdrop-blur sm:p-8">
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
          <p className="mt-8 text-center text-xs text-gray-400 lg:hidden">
            © {new Date().getFullYear()} Athukorala Group (Pvt) Ltd
          </p>
        </div>
      </section>
    </main>
  );
}
