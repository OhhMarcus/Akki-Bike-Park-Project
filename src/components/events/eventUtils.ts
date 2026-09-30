"use client";

import { useMemo } from "react";
import { hkToday } from "@/lib/dates";
import { useEvents, useHydrated, useRegistrations } from "@/lib/store";
import type { EventRegistration, ParkEvent } from "@/types";

export type EventState = "open" | "full" | "closed" | "ended";

/** Hong Kong "today", or null before hydration so server and first client render match. */
export function useToday(): string | null {
  const hydrated = useHydrated();
  return hydrated ? hkToday() : null;
}

/** Adds locally-made demo registrations to the stored registered count. */
export function withRegistrations(e: ParkEvent, regs: EventRegistration[]): ParkEvent {
  const extra = regs.filter((r) => r.eventId === e.id).length;
  return extra ? { ...e, registered: e.registered + extra } : e;
}

export function remainingSpots(e: ParkEvent) {
  return Math.max(0, e.capacity - e.registered);
}

/** Only call spots "low" when genuinely scarce. */
export function isLow(e: ParkEvent) {
  const left = remainingSpots(e);
  return left > 0 && left <= Math.max(3, Math.ceil(e.capacity * 0.2));
}

export function eventState(e: ParkEvent, today: string | null): EventState {
  if (today && e.date < today) return "ended";
  if (remainingSpots(e) === 0) return "full";
  if (today && e.registrationDeadline < today) return "closed";
  return "open";
}

export function registerHref(e: ParkEvent, state: EventState) {
  const base = `/booking?exp=event&event=${encodeURIComponent(e.id)}`;
  return state === "full" ? `${base}&waitlist=1` : base;
}

export function sortByDate(list: ParkEvent[]) {
  return [...list].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
}

/** Published events with local registrations applied, sorted by date. */
export function useLiveEvents() {
  const [events] = useEvents();
  const [regs] = useRegistrations();
  return useMemo(() => sortByDate(events.filter((e) => e.published).map((e) => withRegistrations(e, regs))), [events, regs]);
}

export function fits(e: ParkEvent, age: number) {
  return age >= e.minAge && (e.maxAge == null || age <= e.maxAge);
}
