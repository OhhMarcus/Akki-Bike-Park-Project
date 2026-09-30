import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40 min-h-11 px-5",
  {
    variants: {
      variant: {
        primary: "bg-bone text-ink hover:bg-white",
        secondary: "border border-graphite-600 bg-transparent text-bone hover:bg-graphite-800",
        silver: "bg-silver text-ink hover:bg-silver/90",
        ghost: "text-silver hover:bg-graphite-800 hover:text-bone",
        danger: "bg-danger/90 text-ink hover:bg-danger",
      },
      size: { default: "", sm: "min-h-9 px-3 text-xs", lg: "min-h-12 px-7 text-base", icon: "min-h-11 w-11 px-0" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, type, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} type={asChild ? undefined : (type ?? "button")} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
export { buttonVariants };
