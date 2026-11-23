import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-current before:opacity-80 before:content-['']",
  {
    variants: {
      variant: {
        default: "bg-gray-50 text-gray-600 ring-gray-200",
        success: "bg-green-50 text-green-700 ring-green-200",
        warning: "bg-gold-50 text-gold-700 ring-gold-200",
        danger: "bg-red-50 text-red-700 ring-red-200",
        info: "bg-sky-50 text-sky-700 ring-sky-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
