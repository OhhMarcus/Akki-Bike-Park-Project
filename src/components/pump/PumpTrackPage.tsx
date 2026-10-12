"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { useAvailability, useNowHK, usePublishedEvents } from "@/lib/hooks";
import type { SlotView } from "@/lib/schedule";
import { dateRange } from "@/lib/time";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingSheet, type SheetTarget } from "./BookingSheet";
import { DayView } from "./DayView";
import { GroupLink } from "./parts";
import { PumpHero } from "./PumpHero";
import { WeekGrid } from "./WeekGrid";
import { WINDOW_DAYS, isBookable, isISODate, writeDateToUrl } from "./lib";

/**
 * Pump Track page. The selected date lives in the URL (?date=YYYY-MM-DD) so the
 * home page can deep-link and a refresh keeps the day. Phones get the date strip
 * and slot cards, desktop gets the week grid; both open the same booking sheet.
 */
export function PumpTrackPage() {
  const { t } = useI18n();
  const now = useNowHK();
  const avail = useAvailability(now);
  const events = usePublishedEvents();
  const urlDate = useSearchParams().get("date");

  const today = now?.date ?? null;
  const days = useMemo(() => (today ? dateRange(today, WINDOW_DAYS) : []), [today]);
  const slotsByDay = useMemo(() => new Map(days.map((d) => [d, avail.pumpSlots(d)])), [days, avail]);
  const firstOpen = useMemo(() => days.find((d) => slotsByDay.get(d)?.some(isBookable)) ?? today, [days, slotsByDay, today]);
  const selected = today ? (isISODate(urlDate) && days.includes(urlDate) ? urlDate : firstOpen) : null;

  // Keep the URL in step with what is shown (fills in the default day, fixes out-of-range dates).
  useEffect(() => {
    if (selected && urlDate !== selected) writeDateToUrl(selected);
  }, [selected, urlDate]);

  const [target, setTarget] = useState<SheetTarget | null>(null);
  const opens = useRef(0);
  // Radix only returns focus to a Dialog.Trigger; this sheet opens from many buttons, so do it here.
  const opener = useRef<HTMLElement | null>(null);
  const openSlot = useCallback((slot: SlotView, from: HTMLElement) => {
    opens.current += 1;
    opener.current = from;
    setTarget({ id: slot.id, openedAt: Date.now(), key: opens.current });
    writeDateToUrl(slot.date);
  }, []);
  const switchSlot = useCallback((slot: SlotView) => {
    setTarget((cur) => (cur ? { ...cur, id: slot.id } : cur));
    writeDateToUrl(slot.date);
  }, []);
  const closeSheet = useCallback(() => {
    setTarget(null);
    const el = opener.current;
    requestAnimationFrame(() => {
      if (el?.isConnected) el.focus({ preventScroll: true });
    });
  }, []);

  // For an empty day: the next day with open sessions, else the closest earlier one in the window.
  const openDays = days.filter((d) => slotsByDay.get(d)?.some(isBookable));
  const openDay = selected ? (openDays.find((d) => d > selected) ?? openDays.filter((d) => d < selected).pop() ?? null) : null;

  return (
    <>
      <PumpHero />
      <div className="container pb-4 pt-7 sm:pt-10 lg:pt-12">
        {!today || !selected ? (
          <div aria-busy="true" aria-label={t("state.loading")}>
            <div className="lg:hidden">
              <Skeleton className="h-8 w-40" />
              <div className="mt-6 flex gap-2 overflow-hidden">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-[88px] w-[64px] shrink-0" />
                ))}
              </div>
              <Skeleton className="mt-8 h-9 w-32" />
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-[100px]" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-12 w-72" />
              <Skeleton className="mt-6 h-[620px] w-full" />
            </div>
          </div>
        ) : (
          <>
            <DayView
              className="lg:hidden"
              days={days}
              today={today}
              selected={selected}
              slots={slotsByDay.get(selected) ?? []}
              dayState={avail.dayPump}
              events={events}
              openDay={openDay}
              onSelect={writeDateToUrl}
              onOpen={openSlot}
            />
            <WeekGrid
              className="hidden lg:block"
              first={days[0]}
              last={days[days.length - 1]}
              today={today}
              selected={selected}
              slotsByDay={slotsByDay}
              events={events}
              onSelect={writeDateToUrl}
              onOpen={openSlot}
            />
            <GroupLink date={selected} className="mt-6 border-t border-line pt-4" />
          </>
        )}
      </div>
      <BookingSheet target={target} now={now} onClose={closeSheet} onSwitch={switchSlot} />
    </>
  );
}
