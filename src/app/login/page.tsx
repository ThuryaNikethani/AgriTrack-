import { BarChart3, Bell, Leaf, ShoppingBasket } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

const highlights = [
  { icon: ShoppingBasket, text: "Track every harvest against its schedule and target" },
  { icon: Bell, text: "Get reminders before fertilizer runs out" },
  { icon: BarChart3, text: "See income, expenses and profit for each crop" },
];

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-green-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-800 via-green-950 to-[#04170b]" />
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-green-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-gold-400/20 blur-3xl" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
          <defs>
            <pattern id="rows" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
              <path d="M0 24 Q12 12 24 24 T48 24" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rows)" />
        </svg>

        <div className="relative flex items-center gap-4">
          <BrandLogo className="h-16 w-16 shadow-xl shadow-black/30" />
          <div>
            <p className="text-lg font-extrabold uppercase tracking-[0.16em]">Athukorala Group</p>
            <p className="text-sm font-semibold text-gold-300">Kurunduwatta Villa &amp; Cottages</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/30 bg-gold-300/10 px-3 py-1 text-xs font-semibold text-gold-200">
            <Leaf className="h-3.5 w-3.5" /> Smart Polytunnel Management
          </span>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.1]">
            Fresh from our polytunnel,
            <span className="block bg-gradient-to-r from-gold-200 to-gold-400 bg-clip-text text-transparent">
              managed with care.
            </span>
          </h1>
          <ul className="mt-8 space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-green-50/85">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-gold-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-green-100/50">© {new Date().getFullYear()} Athukorala Group · AgriTrack</p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <BrandLogo className="h-16 w-16 shadow-lg lg:hidden" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-gold-600 lg:mt-0">AgriTrack</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-green-950">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-500">Sign in to manage the Kurunduwatta polytunnel.</p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-lift">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
