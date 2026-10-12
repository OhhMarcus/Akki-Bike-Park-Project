"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { ISODate, ParkEvent } from "@/types";
import { parts } from "@/lib/time";
import { MonthGrid, MonthNav } from "@/components/calendar/MonthCalendar";
import { eventTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SpotsText } from "./parts";
import { eventPath, titleWrap, whenText, ymIndex, ymOf, type EventSpots, type YM } from "./utils";

type Item = { event: ParkEvent; spots: EventSpots };

function CalendarChip({ event, spots }: Item) {
  const { t, l, fmt } = useI18n();
  const tone = eventTone[event.type];
  const type = t(`evtype.${event.type}`);
  const when = whenText(t, fmt, event);
  return (
    <Link
      href={eventPath(event)}
      aria-label={t("events.chip.aria", { type, title: l(event.title), when })}
      className={cn("relative block overflow-hidden rounded-sm py-1.5 pl-2.5 pr-1.5 transition-colors hover:bg-white/10", tone.bg, spots.ended && "opacity-50")}
    >
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", tone.dot)} />
      <span className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-tight">
        <span className={cn("font-bold uppercase", tone.text)}>{type}</span>
        <span className="font-semibold tabular text-fg/70">{fmt.time(event.start)}</span>
      </span>
      <span className={cn("mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-snug text-fg", titleWrap)}>{l(event.title)}</span>
      {!spots.ended && spots.status !== "available" && <SpotsText spots={spots} className="mt-0.5 block text-[11px]" />}
    </Link>
  );
}

/**
 * Desktop month calendar: event chips sit in their day, coloured by type,
 * each one linking to the event. `jumpTo` offers a way out of an empty month.
 */
export function EventsCalendar({
  month, onMonthChange, min, max, items, today, jumpTo,
}: {
  month: YM;
  onMonthChange: (m: YM) => void;
  min: YM;
  max: YM;
  /** filtered events (past ones in view are dimmed) */
  items: Item[];
  today: ISODate;
  jumpTo?: YM;
}) {
  const { t, fmt } = useI18n();
  const byDate = useMemo(() => {
    const map = new Map<ISODate, Item[]>();
    for (const it of items) map.set(it.event.date, [...(map.get(it.event.date) ?? []), it]);
    return map;
  }, [items]);
  const inMonth = items.filter((it) => ymIndex(ymOf(it.event.date)) === ymIndex(month));
  const upcomingInMonth = inMonth.some((it) => !it.spots.ended);

  return (
    <section aria-label={t("events.calendar.label")} className="surface p-4 xl:p-5">
      <MonthNav month={month} onChange={onMonthChange} min={min} max={max} />
      <MonthGrid
        className="mt-4"
        month={month}
        renderCell={(date, isInMonth) => {
          if (!isInMonth) return <div aria-hidden className="h-full min-h-[118px] rounded-md bg-ink/30" />;
          const list = byDate.get(date) ?? [];
          const isToday = date === today;
          const past = date < today;
          return (
            <div
              className={cn(
                "flex h-full min-h-[118px] flex-col gap-1.5 rounded-md border p-1.5 xl:p-2",
                isToday ? "border-fg/60 bg-card-2" : list.length ? "border-line-strong bg-card-2" : "border-line/70 bg-ink/40",
              )}
            >
              <div aria-hidden className="flex items-center justify-between gap-1 px-0.5 pt-0.5">
                <span
                  className={cn(
                    "font-display text-lg font-extrabold italic leading-none tabular [font-synthesis:none]",
                    isToday ? "rounded-sm bg-fg px-1.5 py-0.5 text-ink" : past ? "text-muted/40" : "text-fg/80",
                  )}
                >
                  {parts(date).d}
                </span>
                {isToday && <span className="truncate text-[10px] font-bold uppercase text-fg">{t("fmt.today")}</span>}
              </div>
              {list.map((it) => (
                <CalendarChip key={it.event.id} {...it} />
              ))}
            </div>
          );
        }}
      />
      {!upcomingInMonth && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-line-strong px-4 py-3">
          <p className="text-sm text-muted">
            {inMonth.length ? t("events.month.none", { month: fmt.monthName(month.m) }) : t("events.calendar.monthEmpty", { month: fmt.monthName(month.m) })}
          </p>
          {jumpTo && ymIndex(jumpTo) !== ymIndex(month) && (
            <Button variant="secondary" size="sm" font="sans" onClick={() => onMonthChange(jumpTo)}>
              {t("events.calendar.jump", { month: fmt.monthName(jumpTo.m) })}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
