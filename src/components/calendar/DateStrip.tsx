"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/provider";
import type { ISODate, SlotStatus } from "@/types";
import { parts } from "@/lib/time";
import { cn } from "@/lib/utils";

const bar: Record<SlotStatus | "none", string> = {
  available: "bg-grad",
  almost: "bg-brand-amber",
  full: "bg-state-full",
  closed: "hatch-closed bg-state-closed/30",
  none: "bg-line",
};

/**
 * Swipeable date strip (pump track). Each day shows weekday, date and a small
 * availability bar. Selected day gets the brand gradient.
 */
export function DateStrip({
  dates, value, onChange, dayState, today, className,
}: {
  dates: ISODate[];
  value: ISODate;
  onChange: (d: ISODate) => void;
  dayState: (d: ISODate) => SlotStatus | "none";
  today: ISODate;
  className?: string;
}) {
  const { t, fmt } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-date="${value}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [value]);

  const move = (d: number) => {
    const i = dates.indexOf(value);
    const n = Math.min(dates.length - 1, Math.max(0, i + d));
    onChange(dates[n]);
    requestAnimationFrame(() => ref.current?.querySelector<HTMLButtonElement>(`[data-date="${dates[n]}"]`)?.focus());
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={t("label.date")}
      className={cn("no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0", className)}
    >
      {dates.map((d) => {
        const s = dayState(d);
        const selected = d === value;
        const { d: day, m } = parts(d);
        const showMonth = day === 1 || d === dates[0];
        return (
          <button
            key={d}
            data-date={d}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            aria-label={`${fmt.dateLong(d)} · ${s === "none" ? t("status.closed") : t(`status.${s}`)}`}
            onClick={() => onChange(d)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
              if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
            }}
            className={cn(
              "flex w-[64px] shrink-0 snap-start flex-col items-center gap-1 rounded-lg border px-1 pb-2 pt-2 transition-colors",
              selected ? "border-transparent bg-grad text-ink" : "border-line bg-card text-fg hover:border-line-strong",
            )}
          >
            <span className={cn("text-[11px] font-semibold uppercase", selected ? "text-ink/80" : "text-muted")}>
              {d === today ? t("fmt.today") : fmt.weekday(d)}
            </span>
            <span className="font-display text-[28px] font-extrabold italic leading-none [font-synthesis:none]">{day}</span>
            <span className={cn("text-[10px] font-semibold", selected ? "text-ink/70" : "text-muted")}>{showMonth ? fmt.monthShort(m) : " "}</span>
            <span aria-hidden className={cn("mt-0.5 h-1 w-8 rounded-sm", selected ? "bg-ink/40" : bar[s])} />
          </button>
        );
      })}
    </div>
  );
}
