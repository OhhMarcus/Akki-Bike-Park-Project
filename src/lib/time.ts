import type { HHmm, ISODate } from "@/types";

/** Hong Kong is UTC+8 all year (no daylight saving). */
const HK_OFFSET_MS = 8 * 60 * 60 * 1000;

export type HKNow = { date: ISODate; minutes: number; ms: number };

export function hkNow(ms: number = Date.now()): HKNow {
  const d = new Date(ms + HK_OFFSET_MS);
  return { date: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes(), ms };
}

export function hkToday(): ISODate {
  return hkNow().date;
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** b - a, in whole days */
export function diffDays(a: ISODate, b: ISODate) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(iso: ISODate) {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

export function toMin(t: HHmm) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fromMin(m: number): HHmm {
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Epoch ms for a Hong Kong wall-clock date + time. */
export function hkInstant(date: ISODate, time: HHmm = "00:00") {
  return Date.parse(`${date}T${time}:00Z`) - HK_OFFSET_MS;
}

export function dateRange(start: ISODate, count: number): ISODate[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export function parts(iso: ISODate) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function isoFrom(y: number, m: number, d: number): ISODate {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Monday-based start of week */
export function startOfWeek(iso: ISODate, weekStart = 1): ISODate {
  const wd = weekdayOf(iso);
  return addDays(iso, -((wd - weekStart + 7) % 7));
}

/** Full weeks covering a month. weekStart 0 = Sunday. */
export function monthMatrix(year: number, month: number, weekStart = 0): { date: ISODate; inMonth: boolean }[] {
  const first = isoFrom(year, month, 1);
  const start = addDays(first, -((weekdayOf(first) - weekStart + 7) % 7));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = isoFrom(year, month, daysInMonth);
  const end = addDays(last, (weekStart + 6 - weekdayOf(last) + 7) % 7);
  const count = diffDays(start, end) + 1;
  return dateRange(start, count).map((date) => ({ date, inMonth: parts(date).m === month }));
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}
