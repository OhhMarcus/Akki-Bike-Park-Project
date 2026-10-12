"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { ISODate, SlotStatus } from "@/types";
import { addDays, monthMatrix, parts } from "@/lib/time";
import { cn } from "@/lib/utils";

type YM = { y: number; m: number };
const shift = ({ y, m }: YM, d: number): YM => {
  const n = y * 12 + (m - 1) + d;
  return { y: Math.floor(n / 12), m: (n % 12) + 1 };
};
const cmp = (a: YM, b: YM) => a.y * 12 + a.m - (b.y * 12 + b.m);

/** Month header + prev/next. Month and weekday names come from the dictionary. */
export function MonthNav({ month, onChange, min, max, className }: { month: YM; onChange: (m: YM) => void; min?: YM; max?: YM; className?: string }) {
  const { t, fmt } = useI18n();
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <p className="h-display text-2xl" aria-live="polite">{fmt.monthYear(month.y, month.m)}</p>
      <div className="flex gap-1">
        <button type="button" onClick={() => onChange(shift(month, -1))} disabled={!!min && cmp(month, min) <= 0} aria-label={t("btn.prevMonth")} className="grid h-10 w-10 place-items-center rounded-lg border border-line hover:border-line-strong disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onChange(shift(month, 1))} disabled={!!max && cmp(month, max) >= 0} aria-label={t("btn.nextMonth")} className="grid h-10 w-10 place-items-center rounded-lg border border-line hover:border-line-strong disabled:opacity-30">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Bare month grid (Sunday first). renderCell decides what goes in each day. */
export function MonthGrid({ month, renderCell, className, cellClassName }: { month: YM; renderCell: (date: ISODate, inMonth: boolean) => React.ReactNode; className?: string; cellClassName?: string }) {
  const { fmt } = useI18n();
  const cells = monthMatrix(month.y, month.m, 0);
  return (
    <div className={className}>
      <div className="grid grid-cols-7 gap-1 pb-1 text-center text-xs font-semibold text-muted" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
          <span key={d} className="py-1">{fmt.weekday(d)}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => (
          <div key={c.date} className={cellClassName}>
            {renderCell(c.date, c.inMonth)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Date picker that highlights days by availability. Selected = brand gradient.
 * Arrow keys move day by day, Enter/Space selects.
 */
export function AvailabilityCalendar({
  month, onMonthChange, value, onChange, dayState, min, max, className,
}: {
  month: YM;
  onMonthChange: (m: YM) => void;
  value?: ISODate;
  onChange: (d: ISODate) => void;
  dayState: (d: ISODate) => SlotStatus | "none";
  min: ISODate;
  max: ISODate;
  className?: string;
}) {
  const { t, fmt } = useI18n();
  const grid = useRef<HTMLDivElement>(null);
  const minYM = { y: parts(min).y, m: parts(min).m };
  const maxYM = { y: parts(max).y, m: parts(max).m };

  const focusDate = (d: ISODate) => {
    const p = parts(d);
    if (p.y !== month.y || p.m !== month.m) onMonthChange({ y: p.y, m: p.m });
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${d}"]`)?.focus());
  };

  return (
    <div className={className}>
      <MonthNav month={month} onChange={onMonthChange} min={minYM} max={maxYM} />
      <div ref={grid} className="mt-4">
        <MonthGrid
          month={month}
          renderCell={(date, inMonth) => {
            const inRange = date >= min && date <= max;
            const state = inRange ? dayState(date) : "none";
            const bookable = inRange && (state === "available" || state === "almost");
            const selected = value === date;
            const label = `${fmt.dateLong(date)} · ${state === "none" ? t("status.closed") : t(`status.${state}`)}`;
            if (!inMonth) return <span aria-hidden className="block aspect-square" />;
            return (
              <button
                type="button"
                data-date={date}
                disabled={!bookable}
                aria-pressed={selected}
                aria-label={label}
                tabIndex={selected || (!value && bookable && date === min) ? 0 : -1}
                onClick={() => onChange(date)}
                onKeyDown={(e) => {
                  const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
                  if (step) {
                    e.preventDefault();
                    let d = addDays(date, step);
                    for (let i = 0; i < 40 && d >= min && d <= max; i++) {
                      const s = dayState(d);
                      if (s === "available" || s === "almost") break;
                      d = addDays(d, step > 0 ? 1 : -1);
                    }
                    if (d >= min && d <= max) focusDate(d);
                  }
                }}
                className={cn(
                  "relative flex aspect-square w-full flex-col items-center justify-center rounded-lg text-[15px] font-semibold tabular transition-colors",
                  selected && "bg-grad text-ink",
                  !selected && bookable && "border border-line-strong bg-card-2 text-fg hover:border-fg",
                  !selected && !bookable && state === "full" && "text-state-full line-through decoration-state-full/60",
                  !selected && !bookable && state === "closed" && "hatch-closed text-state-closed/80",
                  !selected && !bookable && state === "none" && "text-muted/40",
                )}
              >
                {parts(date).d}
                {!selected && bookable && (
                  <span aria-hidden className={cn("absolute bottom-1.5 h-1 w-1 rounded-full", state === "almost" ? "bg-brand-amber" : "bg-grad")} />
                )}
              </button>
            );
          }}
        />
      </div>
    </div>
  );
}
