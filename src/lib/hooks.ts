"use client";

import { useEffect, useMemo, useState } from "react";
import type { ISODate, LessonId, ParkEvent } from "@/types";
import {
  buildIndex, dayStatus, eventSpots, nextFreePumpSlot, nextFreeSession, nextRace, parkStateAt, pumpSlotsOn, sessionsOn,
} from "./schedule";
import { useHydrated, useStore } from "./store";
import { hkNow, type HKNow } from "./time";

export const useBookings = () => useStore("bookings");
export const useRiders = () => useStore("riders");
export const useEvents = () => useStore("events");
export const useBlocks = () => useStore("blocks");
export const useSettings = () => useStore("settings");
export const useClosures = () => useStore("closures");
export const useConditions = () => useStore("conditions");
export const useClub = () => useStore("club");
export const usePrefs = () => useStore("prefs");
export const useSavedRider = () => useStore("savedRider");

/** Hong Kong "now". null during SSR/hydration so markup always matches; then ticks. */
export function useNowHK(tickMs = 30_000): HKNow | null {
  const hydrated = useHydrated();
  const [now, setNow] = useState<HKNow | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    setNow(hkNow());
    const t = setInterval(() => setNow(hkNow()), tickMs);
    return () => clearInterval(t);
  }, [hydrated, tickMs]);
  return now;
}

/** Published events, soonest first. */
export function usePublishedEvents() {
  const [events] = useEvents();
  return useMemo(
    () => events.filter((e) => e.published).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)),
    [events],
  );
}

/**
 * Live availability built from the store. All capacity numbers on the site
 * come from here, so admin edits, closures and new bookings show everywhere.
 */
export function useAvailability(now?: HKNow | null) {
  const [bookings] = useBookings();
  const [settings] = useSettings();
  const [blocks] = useBlocks();
  const [events] = useEvents();
  return useMemo(() => {
    const index = buildIndex(bookings);
    return {
      index,
      settings,
      blocks,
      pumpSlots: (date: ISODate) => pumpSlotsOn(date, settings, index, blocks, now),
      sessions: (date: ISODate, lessonId?: LessonId) => sessionsOn(date, settings, index, blocks, now, lessonId),
      dayPump: (date: ISODate) => dayStatus(pumpSlotsOn(date, settings, index, blocks, now)),
      dayLessons: (date: ISODate, lessonId?: LessonId) => dayStatus(sessionsOn(date, settings, index, blocks, now, lessonId)),
      eventSpots: (event: ParkEvent) => eventSpots(event, index, now),
      parkState: (n: HKNow) => parkStateAt(n, settings, blocks),
      nextFreePump: (n: HKNow, minRiders = 1) => nextFreePumpSlot(n, settings, index, blocks, minRiders),
      nextFreeSession: (n: HKNow, lessonId?: LessonId) => nextFreeSession(n, settings, index, blocks, lessonId),
      nextRace: (n: HKNow) => nextRace(events, n),
    };
  }, [bookings, settings, blocks, events, now]);
}

export type Availability = ReturnType<typeof useAvailability>;
