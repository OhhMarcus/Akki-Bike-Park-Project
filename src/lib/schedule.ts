import { lessons } from "@/content/catalogue";
import type {
  Block, Booking, HHmm, ISODate, LessonId, ParkEvent, PumpTrackSlot, ScheduleSettings, Session, SlotStatus,
} from "@/types";
import { addDays, fromMin, overlaps, toMin, weekdayOf, type HKNow } from "./time";

/**
 * Pure scheduling engine. Slots and sessions are DERIVED from the weekly
 * settings, blocks/closures and bookings, so there is exactly one source of
 * truth for capacity. A real backend would run the same logic in SQL.
 */

/* ---------- ids ---------- */

const compact = (t: HHmm) => t.replace(":", "");
const expand = (t: string): HHmm => `${t.slice(0, 2)}:${t.slice(2, 4)}`;

export const pumpSlotId = (date: ISODate, start: HHmm) => `pt_${date}_${compact(start)}`;
export const sessionId = (lessonId: LessonId, date: ISODate, start: HHmm) => `les_${lessonId}_${date}_${compact(start)}`;

export type TargetRef =
  | { kind: "pump"; date: ISODate; start: HHmm }
  | { kind: "lesson"; lessonId: LessonId; date: ISODate; start: HHmm };

export function parseTargetId(id: string): TargetRef | null {
  let m = /^pt_(\d{4}-\d{2}-\d{2})_(\d{4})$/.exec(id);
  if (m) return { kind: "pump", date: m[1], start: expand(m[2]) };
  m = /^les_(foundation|advanced)_(\d{4}-\d{2}-\d{2})_(\d{4})$/.exec(id);
  if (m) return { kind: "lesson", lessonId: m[1] as LessonId, date: m[2], start: expand(m[3]) };
  return null;
}

/* ---------- booking index ---------- */

export type BookingIndex = {
  /** confirmed riders per Session.id / PumpTrackSlot.id */
  byTarget: Map<string, number>;
  /** confirmed riders per `${eventId}:${categoryId}` */
  byEventCategory: Map<string, number>;
};

const indexCache = new WeakMap<Booking[], BookingIndex>();

export function buildIndex(bookings: Booking[]): BookingIndex {
  const hit = indexCache.get(bookings);
  if (hit) return hit;
  const byTarget = new Map<string, number>();
  const byEventCategory = new Map<string, number>();
  for (const b of bookings) {
    if (b.status !== "confirmed") continue;
    if (b.kind === "event") {
      const k = `${b.targetId}:${b.eventCategoryId ?? ""}`;
      byEventCategory.set(k, (byEventCategory.get(k) ?? 0) + b.riders);
    } else {
      byTarget.set(b.targetId, (byTarget.get(b.targetId) ?? 0) + b.riders);
    }
  }
  const idx = { byTarget, byEventCategory };
  indexCache.set(bookings, idx);
  return idx;
}

/* ---------- status ---------- */

/** "Almost full" = 2 or fewer spots, or the last quarter of the session. */
export function statusFor(remaining: number, capacity: number, closed: boolean): SlotStatus {
  if (closed) return "closed";
  if (remaining <= 0) return "full";
  if (remaining <= Math.max(2, Math.ceil(capacity * 0.25))) return "almost";
  return "available";
}

export function blockFor(date: ISODate, start: HHmm, end: HHmm, scope: "pump" | "lessons", blocks: Block[]): Block | undefined {
  const s = toMin(start);
  const e = toMin(end);
  return blocks.find(
    (b) =>
      b.date === date &&
      (b.scope === "all" || b.scope === scope) &&
      (!b.start || !b.end || overlaps(s, e, toMin(b.start), toMin(b.end))),
  );
}

function isPast(date: ISODate, start: HHmm, now?: HKNow | null) {
  if (!now) return false;
  return date < now.date || (date === now.date && toMin(start) <= now.minutes);
}

/* ---------- pump track ---------- */

export function hoursOn(date: ISODate, settings: ScheduleSettings) {
  return settings.pumpHours.find((h) => h.weekday === weekdayOf(date)) ?? { weekday: weekdayOf(date), open: false, start: "10:00", end: "20:00" };
}

export type SlotView = PumpTrackSlot & { past: boolean };
export type SessionView = Session & { past: boolean };

export function pumpSlotsOn(
  date: ISODate,
  settings: ScheduleSettings,
  index: BookingIndex,
  blocks: Block[],
  now?: HKNow | null,
): SlotView[] {
  const h = hoursOn(date, settings);
  if (!h.open) return [];
  const out: SlotView[] = [];
  const step = settings.slotMinutes;
  for (let m = toMin(h.start); m + step <= toMin(h.end); m += step) {
    const start = fromMin(m);
    const end = fromMin(m + step);
    const id = pumpSlotId(date, start);
    const capacity = settings.slotCapacity;
    const booked = index.byTarget.get(id) ?? 0;
    const remaining = Math.max(0, capacity - booked);
    const block = blockFor(date, start, end, "pump", blocks);
    out.push({
      id, date, start, end, capacity, booked, remaining,
      status: statusFor(remaining, capacity, !!block),
      closedReason: block?.reason,
      past: isPast(date, start, now),
    });
  }
  return out;
}

/* ---------- lessons ---------- */

export function sessionsOn(
  date: ISODate,
  settings: ScheduleSettings,
  index: BookingIndex,
  blocks: Block[],
  now?: HKNow | null,
  lessonId?: LessonId,
): SessionView[] {
  const wd = weekdayOf(date);
  return settings.lessonTemplates
    .filter((t) => t.active && t.weekday === wd && (!lessonId || t.lessonId === lessonId))
    .sort((a, b) => toMin(a.start) - toMin(b.start))
    .map((t) => {
      const lesson = lessons[t.lessonId];
      const end = fromMin(toMin(t.start) + lesson.durationMin);
      const id = sessionId(t.lessonId, date, t.start);
      const booked = index.byTarget.get(id) ?? 0;
      const remaining = Math.max(0, t.capacity - booked);
      const block = blockFor(date, t.start, end, "lessons", blocks);
      return {
        id, lessonId: t.lessonId, templateId: t.id, date, start: t.start, end,
        language: t.language, coachId: t.coachId, capacity: t.capacity, booked, remaining,
        status: statusFor(remaining, t.capacity, !!block),
        closedReason: block?.reason,
        past: isPast(date, t.start, now),
      };
    });
}

/* ---------- lookups ---------- */

export function findPumpSlot(id: string, settings: ScheduleSettings, index: BookingIndex, blocks: Block[], now?: HKNow | null) {
  const ref = parseTargetId(id);
  if (!ref || ref.kind !== "pump") return undefined;
  return pumpSlotsOn(ref.date, settings, index, blocks, now).find((s) => s.id === id);
}

export function findSession(id: string, settings: ScheduleSettings, index: BookingIndex, blocks: Block[], now?: HKNow | null) {
  const ref = parseTargetId(id);
  if (!ref || ref.kind !== "lesson") return undefined;
  return sessionsOn(ref.date, settings, index, blocks, now, ref.lessonId).find((s) => s.id === id);
}

/** Aggregate status for a day (date strip dots, calendar highlights). */
export function dayStatus(items: { status: SlotStatus; past: boolean }[]): SlotStatus | "none" {
  const live = items.filter((i) => !i.past);
  if (!live.length) return items.length ? "closed" : "none";
  if (live.every((i) => i.status === "closed")) return "closed";
  if (live.some((i) => i.status === "available")) return "available";
  if (live.some((i) => i.status === "almost")) return "almost";
  if (live.some((i) => i.status === "full")) return "full";
  return "closed";
}

/* ---------- park status (hero card, admin today) ---------- */

export type ParkState =
  | { open: true; closesAt: HHmm }
  | { open: false; reason: "hours" | "restday" | Block["reason"]; opensAt?: { date: ISODate; time: HHmm } };

export function parkStateAt(now: HKNow, settings: ScheduleSettings, blocks: Block[]): ParkState {
  const h = hoursOn(now.date, settings);
  const block = blocks.find(
    (b) => b.date === now.date && b.scope !== "lessons" && (!b.start || !b.end || overlaps(now.minutes, now.minutes + 1, toMin(b.start), toMin(b.end))),
  );
  const within = h.open && now.minutes >= toMin(h.start) && now.minutes < toMin(h.end);
  if (within && !block) return { open: true, closesAt: h.end };
  // find the next opening in the coming fortnight
  for (let i = 0; i < 15; i++) {
    const date = addDays(now.date, i);
    const hh = hoursOn(date, settings);
    if (!hh.open) continue;
    const dayBlocks = blocks.filter((b) => b.date === date && b.scope !== "lessons");
    const wholeDay = dayBlocks.some((b) => !b.start || !b.end);
    if (wholeDay) continue;
    let t = toMin(hh.start);
    if (i === 0) t = Math.max(t, now.minutes + 1);
    // skip past any timed blocks
    for (const b of dayBlocks.sort((a, z) => toMin(a.start!) - toMin(z.start!))) {
      if (t >= toMin(b.start!) && t < toMin(b.end!)) t = toMin(b.end!);
    }
    if (t < toMin(hh.end)) {
      const reason = block ? block.reason : h.open ? "hours" : "restday";
      return { open: false, reason, opensAt: { date, time: fromMin(Math.ceil(t / 5) * 5) } };
    }
  }
  return { open: false, reason: block ? block.reason : h.open ? "hours" : "restday" };
}

export function nextFreePumpSlot(now: HKNow, settings: ScheduleSettings, index: BookingIndex, blocks: Block[], minRiders = 1, horizon = 14) {
  for (let i = 0; i < horizon; i++) {
    const date = addDays(now.date, i);
    const slot = pumpSlotsOn(date, settings, index, blocks, now).find((s) => !s.past && s.status !== "closed" && s.remaining >= minRiders);
    if (slot) return slot;
  }
  return null;
}

export function nextFreeSession(now: HKNow, settings: ScheduleSettings, index: BookingIndex, blocks: Block[], lessonId?: LessonId, horizon = 28) {
  for (let i = 0; i < horizon; i++) {
    const date = addDays(now.date, i);
    const s = sessionsOn(date, settings, index, blocks, now, lessonId).find((x) => !x.past && x.status !== "closed" && x.remaining > 0);
    if (s) return s;
  }
  return null;
}

/* ---------- events ---------- */

export type CategorySpots = { categoryId: string; capacity: number; taken: number; remaining: number; status: SlotStatus };

export function eventSpots(event: ParkEvent, index: BookingIndex, now?: HKNow | null) {
  const ended = !!now && (event.date < now.date || (event.date === now.date && toMin(event.end) <= now.minutes));
  const categories: CategorySpots[] = event.categories.map((c) => {
    const taken = index.byEventCategory.get(`${event.id}:${c.id}`) ?? 0;
    const remaining = Math.max(0, c.capacity - taken);
    return { categoryId: c.id, capacity: c.capacity, taken, remaining, status: statusFor(remaining, c.capacity, ended) };
  });
  const capacity = categories.reduce((s, c) => s + c.capacity, 0);
  const taken = categories.reduce((s, c) => s + c.taken, 0);
  const remaining = Math.max(0, capacity - taken);
  return { categories, capacity, taken, remaining, ended, status: statusFor(remaining, capacity, ended) };
}

export function nextRace(events: ParkEvent[], now: HKNow) {
  return events
    .filter((e) => e.published && e.type === "race" && (e.date > now.date || (e.date === now.date && toMin(e.start) > now.minutes)))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
}
