import { siteConfig } from "@/config/site";
import type { Availability, Booking, CapacityOverride, DayPeriod, TimeSlot } from "@/types";
import { hkToday, weekday } from "./dates";

export const periods: DayPeriod[] = ["morning", "afternoon", "fullday"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function slotId(date: string, period: DayPeriod) {
  return `${date}_${period}`;
}

export function statusFor(remaining: number, capacity: number, blocked?: boolean, past?: boolean): Availability {
  if (past || blocked) return "closed";
  if (remaining <= 0) return "full";
  if (remaining <= Math.max(3, Math.round(capacity * 0.2))) return "limited";
  return "available";
}

/**
 * Deterministic MOCK availability. In production replace with a query against
 * the `time_slots` table (see supabase/schema.sql). Local demo bookings and
 * admin capacity overrides are layered on top so the demo behaves realistically.
 */
export function getSlot(date: string, period: DayPeriod, bookings: Booking[] = [], overrides: CapacityOverride[] = []): TimeSlot {
  const id = slotId(date, period);
  const ov = overrides.find((o) => o.slotId === id);
  const capacity = ov?.capacity ?? siteConfig.capacityPerSession;
  const dow = weekday(date);
  const weekendBoost = dow === 0 || dow === 6 ? 0.35 : 0;
  const base = Math.round(capacity * Math.min(1.05, hash(id) * 0.7 + weekendBoost));
  const local = bookings
    .filter((b) => b.date === date && b.period === period && b.status !== "cancelled")
    .reduce((s, b) => s + b.participants.length, 0);
  const booked = Math.min(capacity, base + local);
  const remaining = Math.max(0, capacity - booked);
  const t = siteConfig.sessions[period];
  return {
    id,
    date,
    period,
    startTime: t.start,
    endTime: t.end,
    capacity,
    booked,
    remaining,
    status: statusFor(remaining, capacity, ov?.blocked, date < hkToday()),
  };
}

export function getDaySlots(date: string, bookings?: Booking[], overrides?: CapacityOverride[]) {
  return periods.map((p) => getSlot(date, p, bookings, overrides));
}

export function dayStatus(date: string, bookings?: Booking[], overrides?: CapacityOverride[]): Availability {
  const slots = getDaySlots(date, bookings, overrides);
  if (slots.every((s) => s.status === "closed")) return "closed";
  const open = slots.filter((s) => s.status !== "closed");
  if (open.every((s) => s.status === "full")) return "full";
  if (open.some((s) => s.status === "available")) return "available";
  return "limited";
}
