"use client";

import { useCallback, useSyncExternalStore } from "react";
import { defaultSchedule } from "@/config/schedule";
import type {
  Block, Booking, ClubApplication, Closure, Conditions, ParkEvent, Rider, ScheduleSettings,
} from "@/types";
import { generateSeed, type SeedData } from "./seed";
import { hkToday } from "./time";

/**
 * Demo persistence: browser localStorage, shared by the public site and the
 * admin so a booking made on one shows up on the other (also across tabs).
 *
 * Every collection reads its sample seed until first written. Swap this file
 * for API calls (same shapes) to connect a real database.
 */

export type Prefs = { swapMarkers: boolean };
export type SavedRider = { name: string; phone: string };

export type StoreShape = {
  bookings: Booking[];
  riders: Rider[];
  events: ParkEvent[];
  blocks: Block[];
  settings: ScheduleSettings;
  closures: Closure[];
  conditions: Conditions;
  club: ClubApplication[];
  prefs: Prefs;
  savedRider: SavedRider | null;
};
export type StoreKey = keyof StoreShape;

const PREFIX = "akki2:";
const EVENT = "akki2-store";

/* ---------- seed (computed once per day, identical on server and client) ---------- */

let seedCache: SeedData | null = null;
export function getSeed(): SeedData {
  const today = hkToday();
  if (!seedCache || seedCache.seedDate !== today) seedCache = generateSeed(today);
  return seedCache;
}

const STATIC_SEEDS = {
  settings: defaultSchedule,
  closures: [] as Closure[],
  conditions: { warning: null, updatedAt: "2026-01-01T00:00:00.000Z" } as Conditions,
  club: [] as ClubApplication[],
  prefs: { swapMarkers: true } as Prefs,
  savedRider: null as SavedRider | null,
};

function seedFor<K extends StoreKey>(key: K): StoreShape[K] {
  const s = getSeed();
  switch (key) {
    case "bookings": return s.bookings as StoreShape[K];
    case "riders": return s.riders as StoreShape[K];
    case "events": return s.events as StoreShape[K];
    case "blocks": return s.blocks as StoreShape[K];
    default: return STATIC_SEEDS[key as keyof typeof STATIC_SEEDS] as StoreShape[K];
  }
}

/* ---------- raw storage ---------- */

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
    /* storage full or blocked: the change lives for this page view only */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Current value (browser). On the server this returns the seed. */
export function getState<K extends StoreKey>(key: K): StoreShape[K] {
  if (typeof window === "undefined") return seedFor(key);
  const raw = readRaw(key);
  const hit = cache.get(key);
  const seed = seedFor(key);
  if (hit && hit.raw === raw && (raw !== null || hit.value === seed)) return hit.value as StoreShape[K];
  let value: StoreShape[K] = seed;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as StoreShape[K];
    } catch {
      value = seed;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function setState<K extends StoreKey>(key: K, next: StoreShape[K] | ((prev: StoreShape[K]) => StoreShape[K])) {
  const prev = getState(key);
  const value = typeof next === "function" ? (next as (p: StoreShape[K]) => StoreShape[K])(prev) : next;
  writeRaw(key, value);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useStore<K extends StoreKey>(key: K) {
  const value = useSyncExternalStore(
    subscribe,
    () => getState(key),
    () => seedFor(key),
  );
  const set = useCallback((next: StoreShape[K] | ((prev: StoreShape[K]) => StoreShape[K])) => setState(key, next), [key]);
  return [value, set] as const;
}

/* ---------- daily refresh & reset ---------- */

const DATA_KEYS: StoreKey[] = ["bookings", "riders", "events", "blocks"];
/** Bump when the sample data generator changes so stored sample records are rebuilt. */
const SEED_VERSION = 2;

/**
 * Sample data is relative to today. When the date changes, rebuild the sample
 * records and keep anything created during the demo (userCreated) so nothing
 * the owner tried disappears.
 */
export function refreshSampleData() {
  if (typeof window === "undefined") return;
  const marker = `${hkToday()}#${SEED_VERSION}`;
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(PREFIX + "seedDate");
  } catch {
    return;
  }
  if (stored === marker) return;
  if (stored) {
    for (const key of DATA_KEYS) {
      const raw = readRaw(key);
      if (raw === null) continue;
      try {
        const old = JSON.parse(raw) as { id: string; userCreated?: boolean }[];
        const keep = old.filter((x) => x.userCreated);
        const fresh = seedFor(key) as unknown as { id: string }[];
        const ids = new Set(keep.map((x) => x.id));
        writeRaw(key, [...keep, ...fresh.filter((x) => !ids.has(x.id))]);
      } catch {
        writeRaw(key, undefined);
      }
    }
  }
  try {
    window.localStorage.setItem(PREFIX + "seedDate", marker);
  } catch {
    /* ignore */
  }
}

export function resetDemoData() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX) && k !== `${PREFIX}prefs`)
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  cache.clear();
  window.dispatchEvent(new Event(EVENT));
}

/* ---------- hydration ---------- */

const noop = () => () => {};
/** false during SSR and the hydration render, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
