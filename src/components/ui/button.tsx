import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * primary  = brand gradient (the only gradient button; use once per view)
 * secondary = outlined, for the second action
 * ghost / subtle = quiet actions; danger = closures and destructive actions
 * font "display" = leaning condensed caps for public CTAs, "sans" for dense admin UI
 */
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-[filter,background-color,border-color,color,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-grad text-ink hover:brightness-110",
        secondary: "border border-fg/25 bg-ink/40 text-fg hover:border-fg hover:bg-white/5",
        subtle: "border border-line bg-card-2 text-fg hover:border-line-strong hover:bg-card-3",
        ghost: "text-muted hover:bg-white/5 hover:text-fg",
        danger: "bg-state-closed text-ink hover:brightness-110",
        link: "h-auto px-0 text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-fg",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-11 px-5",
        lg: "min-h-12 px-6",
        xl: "min-h-14 px-7",
        icon: "h-11 w-11 shrink-0 px-0",
        iconSm: "h-9 w-9 shrink-0 px-0",
      },
      font: {
        display: "font-display text-[17px] font-extrabold uppercase italic leading-none tracking-[0.02em] [font-synthesis:none]",
        sans: "font-sans text-sm font-semibold",
      },
    },
    compoundVariants: [
      { size: "sm", font: "display", className: "text-[15px]" },
      { size: "xl", font: "display", className: "text-xl" },
    ],
    defaultVariants: { variant: "primary", size: "md", font: "display" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, font, asChild, type, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} type={asChild ? undefined : (type ?? "button")} className={cn(buttonVariants({ variant, size, font }), className)} {...props} />;
});
Button.displayName = "Button";

export { buttonVariants };
