"use client";

import { useCallback, useSyncExternalStore } from "react";
import type {
  Announcement, Booking, BookingDraft, CapacityOverride, Enquiry, EventRegistration, GroupEnquiry,
  Membership, ParkEvent, ParkStatus, PromotionCode, WaitlistEntry, CoachingProgramme,
} from "@/types";
import {
  seedAnnouncement, seedBookings, seedEnquiries, seedGroupEnquiries, seedMemberships,
  seedParkStatus, seedPromos, seedWaitlist,
} from "@/content/seed";
import { getSeedEvents } from "@/content/events";
import { coachingProgrammes } from "@/content/coaching";

/**
 * Local persistence layer. Uses localStorage so the prototype runs with zero
 * backend. Each collection stays `undefined` in storage until first edited, so
 * seed content (with dates relative to today) never goes stale.
 *
 * Production: replace the read/write in `readRaw`/`writeRaw` with Supabase
 * queries (same collection names as tables in supabase/schema.sql).
 */
const PREFIX = "akki:";
const EVENT = "akki-store-change";
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: unknown) {
  try {
    if (value === undefined) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage blocked (private mode): state simply will not persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

function snapshot<T>(key: string, seed: T): T {
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = seed;
  if (raw != null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = seed;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useStored<T>(key: string, seed: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => snapshot(key, seed),
    () => seed,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = snapshot(key, seed);
      writeRaw(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, seed],
  );
  const reset = useCallback(() => writeRaw(key, undefined), [key]);
  return [value, set, reset] as const;
}

/** True after hydration. Use to avoid flashing seed data before stored data loads. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// Stable seed references (identity matters for useSyncExternalStore)
const SEED_EVENTS = getSeedEvents();
const EMPTY_OVERRIDES: CapacityOverride[] = [];
const EMPTY_REGS: EventRegistration[] = [];
const EMPTY_STR: string[] = [];

export const useBookings = () => useStored<Booking[]>("bookings", seedBookings);
export const useEvents = () => useStored<ParkEvent[]>("events", SEED_EVENTS);
export const useProgrammes = () => useStored<CoachingProgramme[]>("programmes", coachingProgrammes);
export const usePromos = () => useStored<PromotionCode[]>("promos", seedPromos);
export const useAnnouncement = () => useStored<Announcement>("announcement", seedAnnouncement);
export const useParkStatus = () => useStored<ParkStatus>("parkStatus", seedParkStatus);
export const useMemberships = () => useStored<Membership[]>("memberships", seedMemberships);
export const useEnquiries = () => useStored<Enquiry[]>("enquiries", seedEnquiries);
export const useGroupEnquiries = () => useStored<GroupEnquiry[]>("groupEnquiries", seedGroupEnquiries);
export const useWaitlist = () => useStored<WaitlistEntry[]>("waitlist", seedWaitlist);
export const useOverrides = () => useStored<CapacityOverride[]>("overrides", EMPTY_OVERRIDES);
export const useRegistrations = () => useStored<EventRegistration[]>("registrations", EMPTY_REGS);
export const useNewsletter = () => useStored<string[]>("newsletter", EMPTY_STR);

const EMPTY_DRAFT: BookingDraft | null = null;
export const useDraft = () => useStored<BookingDraft | null>("draft", EMPTY_DRAFT);

const NO_SESSION: { email: string; at: string } | null = null;
export const useAdminSession = () => useStored<{ email: string; at: string } | null>("adminSession", NO_SESSION);

/** Ids of bookings created in THIS browser: powers "My Bookings" without accounts. */
export const useMyBookingRefs = () => useStored<string[]>("myBookingRefs", EMPTY_STR);

/** Non-hook helpers (usable in event handlers). */
export function appendToCollection<T>(key: string, seed: T[], item: T) {
  const current = snapshot<T[]>(key, seed);
  writeRaw(key, [item, ...current]);
}

export function resetAllDemoData() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {}
  cache.clear();
  window.dispatchEvent(new Event(EVENT));
}

export const storeKeys = {
  bookings: ["bookings", seedBookings],
  waitlist: ["waitlist", seedWaitlist],
  enquiries: ["enquiries", seedEnquiries],
  groupEnquiries: ["groupEnquiries", seedGroupEnquiries],
  registrations: ["registrations", EMPTY_REGS],
  myBookingRefs: ["myBookingRefs", EMPTY_STR],
} as const;

/** Convenience: add a booking to the store plus the "my bookings" list. */
export function saveBooking(b: Booking) {
  appendToCollection("bookings", seedBookings, b);
  appendToCollection("myBookingRefs", EMPTY_STR, b.reference);
}
