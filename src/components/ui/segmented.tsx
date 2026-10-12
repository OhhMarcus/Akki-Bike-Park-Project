"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Single-choice segmented control (radio group with arrow-key support). */
export function Segmented<T extends string>({
  value, onChange, options, label, className, size = "md",
}: {
  value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; label: string; className?: string; size?: "sm" | "md";
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = options.findIndex((o) => o.value === value);
  const move = (d: number) => {
    const n = (idx + d + options.length) % options.length;
    onChange(options[n].value);
    refs.current[n]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-lg border border-line bg-[#0E0D0D] p-1", className)}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(1); }
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(-1); }
            }}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 font-semibold transition-colors",
              size === "sm" ? "min-h-8 text-xs" : "min-h-9 text-sm",
              active ? "bg-fg text-ink" : "text-muted hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
