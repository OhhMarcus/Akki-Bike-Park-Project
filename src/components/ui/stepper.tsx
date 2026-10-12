"use client";

import { Minus, Plus } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** − value + control. Announces the value for screen readers. Uses aria-disabled so focus never drops out at min/max. */
export function NumberStepper({
  value, onChange, min = 0, max = 99, label, id, className, size = "md",
}: {
  value: number; onChange: (n: number) => void; min?: number; max?: number; label: string; id?: string; className?: string; size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const btn = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-line bg-[#0E0D0D]", className)} role="group" aria-label={label}>
      <button
        type="button"
        className={cn(btn, "grid place-items-center rounded-l-lg text-fg hover:bg-white/5 aria-disabled:cursor-not-allowed aria-disabled:opacity-30 aria-disabled:hover:bg-transparent")}
        onClick={() => value > min && onChange(Math.max(min, value - 1))}
        aria-disabled={value <= min}
        aria-label={`${t("btn.decrease")}: ${label}`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <output id={id} aria-live="polite" className={cn("min-w-10 text-center font-display text-2xl font-extrabold italic tabular [font-synthesis:none]", size === "sm" && "min-w-8 text-xl")}>
        {value}
      </output>
      <button
        type="button"
        className={cn(btn, "grid place-items-center rounded-r-lg text-fg hover:bg-white/5 aria-disabled:cursor-not-allowed aria-disabled:opacity-30 aria-disabled:hover:bg-transparent")}
        onClick={() => value < max && onChange(Math.min(max, value + 1))}
        aria-disabled={value >= max}
        aria-label={`${t("btn.increase")}: ${label}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
