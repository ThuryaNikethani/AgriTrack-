"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Password field with a lock icon and a show / hide toggle. */
export function PasswordInput({
  className,
  onValueChange,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { onValueChange?: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        {...props}
        type={visible ? "text" : "password"}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        className={cn(
          "flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-11 text-sm text-gray-900 shadow-soft transition placeholder:text-gray-400 hover:border-gray-300 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/15",
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/** Text / email field with a leading icon, matching PasswordInput. */
export function IconInput({
  icon: Icon,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        {...props}
        className={cn(
          "flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3.5 text-sm text-gray-900 shadow-soft transition placeholder:text-gray-400 hover:border-gray-300 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/15",
          className,
        )}
      />
    </div>
  );
}

/** Simple strength meter: length, mixed case, digits and symbols. */
export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const level = Math.min(4, Math.max(1, score)) as 1 | 2 | 3 | 4;
  const labels = { 1: "Weak", 2: "Fair", 3: "Good", 4: "Strong" };
  const colors = { 1: "bg-red-500", 2: "bg-gold-400", 3: "bg-green-400", 4: "bg-green-600" };
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= level ? colors[level] : "bg-gray-200")} />
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Strength: <span className="font-semibold text-gray-700">{labels[level]}</span>
        {value.length < 8 && " · use at least 8 characters"}
      </p>
    </div>
  );
}
