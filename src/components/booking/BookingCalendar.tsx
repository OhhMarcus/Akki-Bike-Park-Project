"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { addDays, hkToday, monthGrid } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Availability } from "@/types";
import { availabilityMeta } from "./AvailabilityLegend";

const WEEKDAYS = ["weekday.0", "weekday.1", "weekday.2", "weekday.3", "weekday.4", "weekday.5", "weekday.6"] as const;
const MAX_MONTHS_AHEAD = 6;

/** Month calendar. Full, closed and past days are disabled and cannot be selected. */
export function BookingCalendar({ value, getStatus, onSelect }: { value?: string; getStatus: (iso: string) => Availability; onSelect: (iso: string) => void }) {
  const { t, date } = useI18n();
  const today = hkToday();
  const base = value && value >= today ? value : today;
  const [ym, setYm] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 });
  const cells = monthGrid(ym.y, ym.m);
  const cur = { y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 };
  const offset = (ym.y - cur.y) * 12 + (ym.m - cur.m);
  const move = (d: number) => setYm((p) => {
    const n = new Date(Date.UTC(p.y, p.m + d, 1));
    return { y: n.getUTCFullYear(), m: n.getUTCMonth() };
  });
  const monthLabel = date(`${ym.y}-${String(ym.m + 1).padStart(2, "0")}-01`, { year: "numeric", month: "long", weekday: undefined, day: undefined });
  const maxDate = addDays(today, MAX_MONTHS_AHEAD * 31);

  return (
    <div className="surface p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} disabled={offset <= 0} aria-label={t("booking.prevMonth")} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-silver hover:bg-graphite-800 hover:text-bone disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <p className="font-display text-xl font-bold uppercase" aria-live="polite">{monthLabel}</p>
        <button type="button" onClick={() => move(1)} disabled={offset >= MAX_MONTHS_AHEAD} aria-label={t("booking.nextMonth")} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-silver hover:bg-graphite-800 hover:text-bone disabled:opacity-30">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-silver-dim" aria-hidden>
        {WEEKDAYS.map((k) => <div key={k} className="py-1">{t(k)}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e${i}`} />;
          const status: Availability = iso > maxDate ? "closed" : getStatus(iso);
          const disabled = status === "full" || status === "closed";
          const meta = availabilityMeta[status];
          const Icon = meta.icon;
          const selected = value === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`${date(iso, { weekday: "long", month: "long", day: "numeric" })}, ${t(`avail.${status}`)}`}
              onClick={() => onSelect(iso)}
              className={cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-md border text-sm",
                selected ? "border-bone bg-bone font-bold text-ink" : cn("bg-graphite-950", meta.border, disabled ? "cursor-not-allowed text-silver-dim/60" : "text-bone hover:bg-graphite-800"),
                iso === today && !selected && "underline underline-offset-4",
              )}
            >
              <span className={cn(disabled && !selected && "line-through decoration-1")}>{Number(iso.slice(8))}</span>
              <Icon className={cn("h-3 w-3", selected ? "text-ink" : meta.text)} aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
