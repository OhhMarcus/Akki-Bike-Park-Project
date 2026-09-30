"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { monthGrid } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ParkEvent } from "@/types";
import { EventCard } from "./EventCard";

/** Month grid (weeks start Sunday). Tap a day to list its events. */
export function EventCalendar({ events, today }: { events: ParkEvent[]; today: string | null }) {
  const { t, date } = useI18n();
  const first = events.find((e) => !today || e.date >= today)?.date ?? today ?? events[0]?.date;
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const base = first ? { y: Number(first.slice(0, 4)), m: Number(first.slice(5, 7)) - 1 } : { y: new Date().getFullYear(), m: new Date().getMonth() };
  const { y, m } = cursor ?? base;

  const cells = useMemo(() => monthGrid(y, m), [y, m]);
  const byDay = useMemo(() => {
    const map = new Map<string, ParkEvent[]>();
    for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e]);
    return map;
  }, [events]);

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(y, m + delta, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
    setPicked(null);
  };
  const monthIso = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const monthLabel = date(monthIso, { weekday: undefined, day: undefined, month: "long", year: "numeric" });
  const dayEvents = picked ? (byDay.get(picked) ?? []) : [];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button variant="secondary" size="icon" onClick={() => shift(-1)} aria-label={t("events.cal.prev")}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
        <h3 className="font-display text-xl font-bold uppercase" aria-live="polite">{monthLabel}</h3>
        <Button variant="secondary" size="icon" onClick={() => shift(1)} aria-label={t("events.cal.next")}>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div role="grid" aria-label={t("events.cal.grid", { month: monthLabel })} className="overflow-hidden rounded-lg border border-graphite-700 bg-graphite-900">
        <div role="row" className="grid grid-cols-7 border-b border-graphite-700">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} role="columnheader" className="py-2 text-center text-xs font-medium text-silver-dim">
              {t(`weekday.${i}` as "weekday.0")}
            </div>
          ))}
        </div>
        {Array.from({ length: cells.length / 7 }).map((_, w) => (
          <div key={w} role="row" className="grid grid-cols-7">
            {cells.slice(w * 7, w * 7 + 7).map((iso, i) => {
              if (!iso) return <div key={i} role="gridcell" aria-hidden className="min-h-12 border-b border-r border-graphite-800 bg-ink/40 last:border-r-0" />;
              const list = byDay.get(iso) ?? [];
              const isToday = iso === today;
              const isPicked = iso === picked;
              const label = `${date(iso, { weekday: "long", month: "long", day: "numeric" })}${list.length ? `, ${list.length === 1 ? t("events.cal.dayEvent1") : t("events.cal.dayEvents", { n: list.length })}` : ""}${isToday ? `, ${t("events.cal.today")}` : ""}`;
              return (
                <div key={i} role="gridcell" className="border-b border-r border-graphite-800 last:border-r-0">
                  <button
                    type="button"
                    onClick={() => setPicked(isPicked ? null : iso)}
                    aria-label={label}
                    aria-pressed={isPicked}
                    aria-current={isToday ? "date" : undefined}
                    className={cn(
                      "flex min-h-12 w-full flex-col items-center justify-center gap-1 text-sm transition-colors hover:bg-graphite-800 focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-silver",
                      isPicked && "bg-graphite-700",
                      list.length === 0 && "text-silver-dim",
                    )}
                  >
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs", isToday && "border border-silver font-bold text-bone")}>{Number(iso.slice(8))}</span>
                    <span aria-hidden className="flex h-1.5 gap-0.5">
                      {list.slice(0, 3).map((e) => (
                        <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-bone" />
                      ))}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-6" aria-live="polite">
        {!picked && <p className="text-sm text-silver-dim">{t("events.cal.pick")}</p>}
        {picked && (
          <>
            <h3 className="mb-4 font-display text-lg font-bold uppercase">{t("events.cal.eventsOn", { date: date(picked, { weekday: "long", month: "long", day: "numeric" }) })}</h3>
            {dayEvents.length === 0 ? (
              <p className="text-sm text-silver">{t("events.cal.dayNone")}</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dayEvents.map((e) => (
                  <EventCard key={e.id} event={e} today={today} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
