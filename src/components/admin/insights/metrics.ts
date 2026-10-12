import type { Availability } from "@/lib/hooks";
import type { Booking, BookingKind, BookingSource, ISODate, ScheduleSettings } from "@/types";
import { addDays, dateRange, diffDays, startOfWeek, toMin, weekdayOf } from "@/lib/time";

/**
 * Stats are derived from the live store (bookings, schedule, blocks), so a
 * new booking, a closure or a schedule edit changes the numbers straight away.
 * Days count by session date in Hong Kong time.
 */

export type RangeKey = "week" | "4w";
export type Period = { from: ISODate; to: ISODate; days: ISODate[] };

export const SOURCES: BookingSource[] = ["website", "klook", "whatsapp", "walkin"];
export const KINDS: BookingKind[] = ["lesson", "pump", "event"];
/** Monday-first row order for weekday charts (0 = Sunday). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const span = (from: ISODate, to: ISODate): Period => ({ from, to, days: dateRange(from, Math.max(0, diffDays(from, to) + 1)) });

/** Earliest session date in the data: periods never reach back past it (no data ≠ zero bookings). */
export function firstDataDate(bookings: Booking[]): ISODate | null {
  let min: ISODate | null = null;
  for (const b of bookings) if (!min || b.date < min) min = b.date;
  return min;
}

/**
 * "week": this Monday–Sunday vs last Monday–Sunday.
 * "4w": the 28 days up to today, trimmed to where the data starts; it gets a
 * comparison only when the 28 days before it are fully covered.
 */
export function periodsFor(range: RangeKey, today: ISODate, first: ISODate | null) {
  if (range === "week") {
    const mon = startOfWeek(today, 1);
    const prevFrom = addDays(mon, -7);
    return {
      cur: span(mon, addDays(mon, 6)),
      prev: first && first <= prevFrom ? span(prevFrom, addDays(mon, -1)) : null,
      trimmedFrom: null as ISODate | null,
    };
  }
  const from = addDays(today, -27);
  const start = first && first > from ? (first < today ? first : today) : from;
  const prevFrom = addDays(from, -28);
  return {
    cur: span(start, today),
    prev: first && first <= prevFrom ? span(prevFrom, addDays(from, -1)) : null,
    trimmedFrom: start > from ? start : null,
  };
}

/** Confirmed bookings grouped by session date. */
export function confirmedByDate(bookings: Booking[]) {
  const map = new Map<ISODate, Booking[]>();
  for (const b of bookings) {
    if (b.status !== "confirmed") continue;
    const list = map.get(b.date);
    if (list) list.push(b);
    else map.set(b.date, [b]);
  }
  return map;
}

export type DayStat = {
  date: ISODate;
  bookings: number;
  riders: number;
  revenue: number;
  riderIds: string[];
  pumpBooked: number;
  pumpCap: number;
  /** pump sessions that were blocked (maintenance, events, weather) */
  pumpClosed: number;
  lessonBooked: number;
  lessonCap: number;
  attended: number;
  noShow: number;
  bySource: Record<BookingSource, number>;
  revenueByKind: Record<BookingKind, number>;
};

const zeroSources = (): Record<BookingSource, number> => ({ website: 0, klook: 0, whatsapp: 0, walkin: 0 });
const zeroKinds = (): Record<BookingKind, number> => ({ lesson: 0, pump: 0, event: 0 });

export function dayStat(date: ISODate, byDate: Map<ISODate, Booking[]>, avail: Availability): DayStat {
  const list = byDate.get(date) ?? [];
  const s: DayStat = {
    date, bookings: list.length, riders: 0, revenue: 0, riderIds: [],
    pumpBooked: 0, pumpCap: 0, pumpClosed: 0, lessonBooked: 0, lessonCap: 0, attended: 0, noShow: 0,
    bySource: zeroSources(), revenueByKind: zeroKinds(),
  };
  for (const b of list) {
    s.riders += b.riders;
    s.revenue += b.priceHKD;
    s.riderIds.push(b.riderId);
    s.bySource[b.source] += 1;
    s.revenueByKind[b.kind] += b.priceHKD;
    if (b.attendance === "attended") s.attended += 1;
    if (b.attendance === "no_show") s.noShow += 1;
  }
  for (const slot of avail.pumpSlots(date)) {
    if (slot.status === "closed") s.pumpClosed += 1;
    else {
      s.pumpBooked += slot.booked;
      s.pumpCap += slot.capacity;
    }
  }
  for (const session of avail.sessions(date)) {
    if (session.status === "closed") continue;
    s.lessonBooked += session.booked;
    s.lessonCap += session.capacity;
  }
  return s;
}

export type Totals = Omit<DayStat, "date" | "riderIds"> & { customers: number; days: number };

export function totals(stats: DayStat[]): Totals {
  const t: Totals = {
    bookings: 0, riders: 0, revenue: 0, customers: 0, days: stats.length,
    pumpBooked: 0, pumpCap: 0, pumpClosed: 0, lessonBooked: 0, lessonCap: 0, attended: 0, noShow: 0,
    bySource: zeroSources(), revenueByKind: zeroKinds(),
  };
  const ids = new Set<string>();
  for (const s of stats) {
    t.bookings += s.bookings;
    t.riders += s.riders;
    t.revenue += s.revenue;
    t.pumpBooked += s.pumpBooked;
    t.pumpCap += s.pumpCap;
    t.pumpClosed += s.pumpClosed;
    t.lessonBooked += s.lessonBooked;
    t.lessonCap += s.lessonCap;
    t.attended += s.attended;
    t.noShow += s.noShow;
    for (const k of SOURCES) t.bySource[k] += s.bySource[k];
    for (const k of KINDS) t.revenueByKind[k] += s.revenueByKind[k];
    s.riderIds.forEach((id) => ids.add(id));
  }
  t.customers = ids.size;
  return t;
}

const ratio = (num: number, den: number) => (den > 0 ? num / den : null);
export const occupancy = (x: Pick<DayStat, "pumpBooked" | "pumpCap">) => ratio(x.pumpBooked, x.pumpCap);
export const lessonFill = (x: Pick<DayStat, "lessonBooked" | "lessonCap">) => ratio(x.lessonBooked, x.lessonCap);
export const noShowRate = (x: Pick<DayStat, "attended" | "noShow">) => ratio(x.noShow, x.attended + x.noShow);

/* ---------- busiest times ---------- */

export type HeatAgg = {
  weekday: number;
  hour: number;
  /** booked × minutes and capacity × minutes over open sessions in that hour */
  num: number;
  den: number;
  /** open session-hours counted, and the riders/capacity summed over them */
  open: number;
  booked: number;
  capacity: number;
  closed: number;
};

/** Hours of the day the pump track is scheduled open on any weekday. */
function openHours(settings: ScheduleSettings) {
  const open = settings.pumpHours.filter((h) => h.open && toMin(h.end) > toMin(h.start));
  if (!open.length) return [];
  const from = Math.min(...open.map((h) => Math.floor(toMin(h.start) / 60)));
  const to = Math.max(...open.map((h) => Math.ceil(toMin(h.end) / 60)));
  return Array.from({ length: to - from }, (_, i) => from + i);
}

/**
 * Pump track occupancy per weekday × hour over the given days. A session
 * counts towards every hour it overlaps, weighted by the minutes it covers,
 * so any session length works.
 */
export function busiestTimes(days: ISODate[], avail: Availability) {
  const hours = openHours(avail.settings);
  const grid = new Map<string, HeatAgg>();
  const cell = (weekday: number, hour: number) => {
    const k = `${weekday}:${hour}`;
    let c = grid.get(k);
    if (!c) {
      c = { weekday, hour, num: 0, den: 0, open: 0, booked: 0, capacity: 0, closed: 0 };
      grid.set(k, c);
    }
    return c;
  };
  for (const date of days) {
    const wd = weekdayOf(date);
    for (const slot of avail.pumpSlots(date)) {
      const s = toMin(slot.start);
      const e = toMin(slot.end);
      for (let h = Math.floor(s / 60); h * 60 < e; h++) {
        const overlap = Math.min(e, (h + 1) * 60) - Math.max(s, h * 60);
        if (overlap <= 0) continue;
        const c = cell(wd, h);
        if (slot.status === "closed") {
          c.closed += 1;
          continue;
        }
        c.num += slot.booked * overlap;
        c.den += slot.capacity * overlap;
        c.open += 1;
        c.booked += slot.booked;
        c.capacity += slot.capacity;
      }
    }
  }
  return { hours, get: (weekday: number, hour: number) => grid.get(`${weekday}:${hour}`) };
}
