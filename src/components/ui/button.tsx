import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/25 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-green-600 to-green-700 text-white shadow-sm shadow-green-900/20 ring-1 ring-inset ring-white/10 hover:from-green-500 hover:to-green-700 hover:shadow-md hover:shadow-green-900/20",
        gold:
          "bg-gradient-to-b from-gold-300 to-gold-500 text-green-950 shadow-sm shadow-gold-700/20 ring-1 ring-inset ring-white/30 hover:from-gold-200 hover:to-gold-400",
        secondary: "bg-green-50 text-green-800 ring-1 ring-inset ring-green-200/70 hover:bg-green-100",
        outline:
          "bg-white text-gray-700 shadow-soft ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:ring-gray-300",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link: "text-green-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-6 text-[15px]",
        icon: "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
