"use client";

import { site } from "@/config/site";
import { lessons, pack5 } from "@/content/catalogue";
import type {
  Block, Booking, BookingKind, BookingSource, ClubApplication, Closure, Experience, HHmm, ISODate, LessonId,
  ParkEvent, Rentals, Rider, ScheduleSettings, WarningCode,
} from "@/types";
import { normalizeHKPhone } from "./phone";
import { blockFor, buildIndex, eventSpots, findPumpSlot, findSession, parseTargetId } from "./schedule";
import { rentalBikeCount } from "./sizing";
import { getState, setState } from "./store";
import { addDays, hkNow, overlaps, toMin } from "./time";
import { makeRef, uid } from "./utils";

/**
 * Write operations for the demo. Each one re-reads the latest state before
 * writing, and every capacity change is re-checked here, so neither the public
 * site nor staff can double-book a slot. Server version: same checks inside a
 * database transaction.
 */

/* ---------- pricing ---------- */

export type QuoteLine = { key: "lesson" | "pack" | "pump" | "event" | "bike" | "helmet" | "packCredit"; qty: number; unit: number; amount: number };
export type Quote = { lines: QuoteLine[]; total: number };

export function quote(o: {
  kind: BookingKind;
  riders: number;
  rentals: Rentals;
  lessonId?: LessonId;
  usePack?: boolean;
  buyPack?: boolean;
  eventPrice?: number;
}): Quote {
  const lines: QuoteLine[] = [];
  if (o.kind === "lesson" && o.lessonId) {
    if (o.buyPack) lines.push({ key: "pack", qty: 1, unit: pack5.priceHKD[o.lessonId], amount: pack5.priceHKD[o.lessonId] });
    else if (o.usePack) lines.push({ key: "packCredit", qty: 1, unit: 0, amount: 0 });
    else lines.push({ key: "lesson", qty: o.riders, unit: lessons[o.lessonId].priceHKD, amount: o.riders * lessons[o.lessonId].priceHKD });
  }
  if (o.kind === "pump") lines.push({ key: "pump", qty: o.riders, unit: site.prices.pumpPerRider, amount: o.riders * site.prices.pumpPerRider });
  if (o.kind === "event") {
    const unit = o.eventPrice ?? 0;
    lines.push({ key: "event", qty: o.riders, unit, amount: unit * o.riders });
  }
  const bikes = rentalBikeCount(o.rentals);
  if (bikes) lines.push({ key: "bike", qty: bikes, unit: site.prices.bikeRental, amount: bikes * site.prices.bikeRental });
  if (o.rentals.helmets) lines.push({ key: "helmet", qty: o.rentals.helmets, unit: site.prices.helmetRental, amount: o.rentals.helmets * site.prices.helmetRental });
  return { lines, total: lines.reduce((s, l) => s + l.amount, 0) };
}

/* ---------- riders ---------- */

export function findRiderByPhone(phone: string) {
  const p = normalizeHKPhone(phone);
  return p ? getState("riders").find((r) => r.phone === p) : undefined;
}

export function upsertRider(o: { name: string; phone: string; email?: string; age?: number; heightCm?: number; experience?: Experience }): Rider {
  const phone = normalizeHKPhone(o.phone) ?? o.phone;
  const riders = getState("riders");
  const existing = riders.find((r) => r.phone === phone);
  if (existing) {
    const updated: Rider = {
      ...existing,
      name: o.name || existing.name,
      email: o.email ?? existing.email,
      age: o.age ?? existing.age,
      heightCm: o.heightCm ?? existing.heightCm,
      experience: o.experience ?? existing.experience,
    };
    setState("riders", riders.map((r) => (r.id === existing.id ? updated : r)));
    return updated;
  }
  const rider: Rider = {
    id: uid("rdr"),
    name: o.name,
    phone,
    email: o.email,
    age: o.age,
    heightCm: o.heightCm,
    experience: o.experience,
    packs: [],
    createdAt: new Date().toISOString(),
    userCreated: true,
  };
  setState("riders", [rider, ...riders]);
  return rider;
}

export function updateRider(id: string, patch: Partial<Rider>) {
  setState("riders", (rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

/** Sell a 5-class pack. `useOne` = the booking that bought it uses a class straight away. */
export function addPack(riderId: string, lessonId: LessonId, useOne = false) {
  const today = hkNow().date;
  const holding = {
    id: uid("pack"),
    lessonId,
    total: pack5.classes,
    remaining: pack5.classes - (useOne ? 1 : 0),
    purchasedOn: today,
    expiresOn: addDays(today, pack5.validityDays),
  };
  setState("riders", (rs) => rs.map((r) => (r.id === riderId ? { ...r, packs: [holding, ...r.packs] } : r)));
  return holding;
}

export function usablePack(rider: Rider | undefined, lessonId: LessonId) {
  const today = hkNow().date;
  return rider?.packs.find((p) => p.lessonId === lessonId && p.remaining > 0 && p.expiresOn >= today);
}

/* ---------- capacity ---------- */

export type BookingError = "not_found" | "closed" | "past" | "full" | "not_enough_spots" | "invalid_phone" | "invalid" | "no_pack";
export type BookingResult = { ok: true; booking: Booking } | { ok: false; error: BookingError; remaining?: number };

type Target = { kind: BookingKind; date: ISODate; start: HHmm; end: HHmm; remaining: number; closed: boolean; past: boolean; lessonId?: LessonId; eventPrice?: number };

/** Resolve a bookable target with live capacity, optionally ignoring one booking (for edits/moves). */
export function resolveTarget(targetId: string, eventCategoryId?: string, ignoreBookingId?: string): Target | null {
  const bookings = getState("bookings").filter((b) => b.id !== ignoreBookingId);
  const settings = getState("settings");
  const blocks = getState("blocks");
  const index = buildIndex(bookings);
  const now = hkNow();
  const ref = parseTargetId(targetId);
  if (ref?.kind === "pump") {
    const s = findPumpSlot(targetId, settings, index, blocks, now);
    return s ? { kind: "pump", date: s.date, start: s.start, end: s.end, remaining: s.remaining, closed: s.status === "closed", past: s.past } : null;
  }
  if (ref?.kind === "lesson") {
    const s = findSession(targetId, settings, index, blocks, now);
    return s
      ? { kind: "lesson", date: s.date, start: s.start, end: s.end, remaining: s.remaining, closed: s.status === "closed", past: s.past, lessonId: s.lessonId }
      : null;
  }
  const event = getState("events").find((e) => e.id === targetId);
  if (!event) return null;
  const cat = event.categories.find((c) => c.id === eventCategoryId);
  if (!cat) return null;
  const spots = eventSpots(event, index, now);
  const c = spots.categories.find((x) => x.categoryId === cat.id)!;
  return { kind: "event", date: event.date, start: event.start, end: event.end, remaining: c.remaining, closed: spots.ended || !event.published, past: spots.ended, eventPrice: cat.priceHKD };
}

/* ---------- bookings ---------- */

export interface NewBookingInput {
  targetId: string;
  eventCategoryId?: string;
  riders: number;
  rentals: Rentals;
  name: string;
  phone: string;
  source: BookingSource;
  payment: "paid" | "unpaid";
  usePack?: boolean;
  buyPack?: boolean;
  rider?: { email?: string; age?: number; heightCm?: number; experience?: Experience };
  externalRef?: string;
  notes?: string;
  waiverSigned?: boolean;
  /** staff only: allow adding a walk-in to a session that has already started */
  allowPast?: boolean;
}

export function createBooking(input: NewBookingInput): BookingResult {
  const phone = normalizeHKPhone(input.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };
  if (!input.name.trim() || input.riders < 1) return { ok: false, error: "invalid" };
  const t = resolveTarget(input.targetId, input.eventCategoryId);
  if (!t) return { ok: false, error: "not_found" };
  if (t.closed) return { ok: false, error: "closed" };
  if (t.past && !input.allowPast) return { ok: false, error: "past" };
  if (t.remaining <= 0) return { ok: false, error: "full", remaining: 0 };
  if (t.remaining < input.riders) return { ok: false, error: "not_enough_spots", remaining: t.remaining };

  const rider = upsertRider({ name: input.name.trim(), phone, ...input.rider });
  if (t.kind === "lesson" && t.lessonId) {
    if (input.usePack) {
      const pack = usablePack(rider, t.lessonId);
      if (!pack) return { ok: false, error: "no_pack" };
      setState("riders", (rs) =>
        rs.map((r) => (r.id === rider.id ? { ...r, packs: r.packs.map((p) => (p.id === pack.id ? { ...p, remaining: p.remaining - 1 } : p)) } : r)),
      );
    } else if (input.buyPack) {
      addPack(rider.id, t.lessonId, true);
    }
  }
  const q = quote({ kind: t.kind, riders: input.riders, rentals: input.rentals, lessonId: t.lessonId, usePack: input.usePack, buyPack: input.buyPack, eventPrice: t.eventPrice });
  const booking: Booking = {
    id: uid("bk"),
    ref: makeRef(),
    kind: t.kind,
    targetId: input.targetId,
    eventCategoryId: input.eventCategoryId,
    date: t.date,
    start: t.start,
    end: t.end,
    riderId: rider.id,
    riderName: rider.name,
    phone,
    riders: input.riders,
    rentals: input.rentals,
    source: input.source,
    status: "confirmed",
    payment: q.total === 0 ? "paid" : input.payment,
    attendance: "pending",
    priceHKD: q.total,
    usedPack: !!input.usePack,
    externalRef: input.externalRef?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    waiverSigned: input.waiverSigned,
    createdAt: new Date().toISOString(),
    userCreated: true,
  };
  setState("bookings", (bs) => [booking, ...bs]);
  return { ok: true, booking };
}

export function updateBooking(id: string, patch: Partial<Booking>) {
  setState("bookings", (bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
}

export const setPayment = (id: string, payment: Booking["payment"]) => updateBooking(id, { payment });
export const setAttendance = (id: string, attendance: Booking["attendance"]) => updateBooking(id, { attendance });

export function cancelBooking(id: string) {
  const b = getState("bookings").find((x) => x.id === id);
  if (!b) return;
  updateBooking(id, { status: "cancelled", payment: b.payment === "paid" ? "refunded" : b.payment, flag: undefined });
}

/** Change headcount/rentals/contact on an existing booking, re-checking capacity. */
export function editBooking(id: string, patch: { riders?: number; rentals?: Rentals; riderName?: string; phone?: string; notes?: string; externalRef?: string }): BookingResult {
  const b = getState("bookings").find((x) => x.id === id);
  if (!b) return { ok: false, error: "not_found" };
  const riders = patch.riders ?? b.riders;
  if (riders > b.riders && b.status === "confirmed") {
    const t = resolveTarget(b.targetId, b.eventCategoryId, b.id);
    if (!t) return { ok: false, error: "not_found" };
    if (t.remaining < riders) return { ok: false, error: "not_enough_spots", remaining: t.remaining };
  }
  let phone = b.phone;
  if (patch.phone !== undefined) {
    const p = normalizeHKPhone(patch.phone);
    if (!p) return { ok: false, error: "invalid_phone" };
    phone = p;
  }
  const rentals = patch.rentals ?? b.rentals;
  const lessonId = b.kind === "lesson" ? parseLessonId(b.targetId) : undefined;
  const event = b.kind === "event" ? getState("events").find((e) => e.id === b.targetId) : undefined;
  const eventPrice = event?.categories.find((c) => c.id === b.eventCategoryId)?.priceHKD;
  const priceHKD = b.usedPack && riders === 1
    ? quote({ kind: b.kind, riders, rentals, lessonId, usePack: true }).total
    : quote({ kind: b.kind, riders, rentals, lessonId, eventPrice }).total;
  const updated: Booking = {
    ...b,
    riders,
    rentals,
    riderName: patch.riderName?.trim() || b.riderName,
    phone,
    notes: patch.notes !== undefined ? patch.notes.trim() || undefined : b.notes,
    externalRef: patch.externalRef !== undefined ? patch.externalRef.trim() || undefined : b.externalRef,
    priceHKD,
  };
  setState("bookings", (bs) => bs.map((x) => (x.id === id ? updated : x)));
  return { ok: true, booking: updated };
}

function parseLessonId(targetId: string): LessonId | undefined {
  const ref = parseTargetId(targetId);
  return ref?.kind === "lesson" ? ref.lessonId : undefined;
}

/** Move a booking to another session/slot of the same kind. Never overbooks. */
export function moveBooking(id: string, newTargetId: string): BookingResult {
  const b = getState("bookings").find((x) => x.id === id);
  if (!b) return { ok: false, error: "not_found" };
  const t = resolveTarget(newTargetId, b.eventCategoryId, b.id);
  if (!t || t.kind !== b.kind) return { ok: false, error: "not_found" };
  if (t.closed) return { ok: false, error: "closed" };
  if (t.past) return { ok: false, error: "past" };
  if (t.remaining < b.riders) return { ok: false, error: t.remaining <= 0 ? "full" : "not_enough_spots", remaining: t.remaining };
  const updated: Booking = { ...b, targetId: newTargetId, date: t.date, start: t.start, end: t.end, flag: undefined, status: "confirmed" };
  setState("bookings", (bs) => bs.map((x) => (x.id === id ? updated : x)));
  return { ok: true, booking: updated };
}

/* ---------- schedule ---------- */

export function updateSettings(next: ScheduleSettings | ((s: ScheduleSettings) => ScheduleSettings)) {
  setState("settings", (s) => ({ ...(typeof next === "function" ? next(s) : next), updatedAt: new Date().toISOString() }));
}

/** Confirmed bookings that overlap a period (for closure previews and block warnings). */
export function bookingsAffectedBy(date: ISODate, start?: HHmm, end?: HHmm, scope: Block["scope"] = "all") {
  const s = start ? toMin(start) : 0;
  const e = end ? toMin(end) : 24 * 60;
  return getState("bookings").filter(
    (b) =>
      b.status === "confirmed" &&
      b.date === date &&
      (scope === "all" || (scope === "pump" ? b.kind === "pump" : b.kind === "lesson")) &&
      overlaps(s, e, toMin(b.start), toMin(b.end)),
  );
}

export function addBlock(block: Omit<Block, "id">) {
  const b: Block = { ...block, id: uid("blk"), userCreated: true };
  setState("blocks", (bs) => [...bs, b]);
  return b;
}

export function removeBlock(id: string) {
  setState("blocks", (bs) => bs.filter((b) => b.id !== id));
}

/* ---------- weather closures ---------- */

export function setWarning(warning: WarningCode | null) {
  setState("conditions", { warning, updatedAt: new Date().toISOString() });
}

export function closePark(o: { date: ISODate; start?: HHmm; end?: HHmm; warning: WarningCode; messageEn: string; messageZh: string }): Closure {
  const affected = bookingsAffectedBy(o.date, o.start, o.end, "all");
  const closure: Closure = {
    id: uid("cls"),
    date: o.date,
    start: o.start,
    end: o.end,
    warning: o.warning,
    createdAt: new Date().toISOString(),
    affectedBookingIds: affected.map((b) => b.id),
    messageSent: false,
    messageEn: o.messageEn,
    messageZh: o.messageZh,
  };
  setState("closures", (cs) => [closure, ...cs]);
  setState("blocks", (bs) => [...bs, { id: `blk_${closure.id}`, date: o.date, start: o.start, end: o.end, scope: "all", reason: "weather", closureId: closure.id, userCreated: true }]);
  const ids = new Set(closure.affectedBookingIds);
  setState("bookings", (bs) => bs.map((b) => (ids.has(b.id) ? { ...b, flag: { closureId: closure.id, reason: o.warning, notified: false } } : b)));
  if (o.date === hkNow().date) setWarning(o.warning);
  return closure;
}

export function markClosureMessageSent(closureId: string) {
  setState("closures", (cs) => cs.map((c) => (c.id === closureId ? { ...c, messageSent: true } : c)));
  setState("bookings", (bs) => bs.map((b) => (b.flag?.closureId === closureId ? { ...b, flag: { ...b.flag, notified: true } } : b)));
}

export function reopenClosure(closureId: string) {
  const closure = getState("closures").find((c) => c.id === closureId);
  setState("closures", (cs) => cs.map((c) => (c.id === closureId ? { ...c, reopenedAt: new Date().toISOString() } : c)));
  setState("blocks", (bs) => bs.filter((b) => b.closureId !== closureId));
  setState("bookings", (bs) => bs.map((b) => (b.flag?.closureId === closureId ? { ...b, flag: undefined } : b)));
  if (closure && getState("conditions").warning === closure.warning) setWarning(null);
}

/* ---------- events ---------- */

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "event";
}

export function saveEvent(event: ParkEvent) {
  setState("events", (es) => {
    const exists = es.some((e) => e.id === event.id);
    return exists ? es.map((e) => (e.id === event.id ? event : e)) : [{ ...event, userCreated: true }, ...es];
  });
}

export function deleteEvent(id: string) {
  setState("events", (es) => es.filter((e) => e.id !== id));
}

export function setEventPublished(id: string, published: boolean) {
  setState("events", (es) => es.map((e) => (e.id === id ? { ...e, published } : e)));
}

/* ---------- club ---------- */

export function submitClubApplication(o: Omit<ClubApplication, "id" | "createdAt">) {
  const phone = normalizeHKPhone(o.phone) ?? o.phone;
  const app: ClubApplication = { ...o, phone, id: uid("club"), createdAt: new Date().toISOString() };
  setState("club", (cs) => [app, ...cs]);
  const rider = upsertRider({ name: o.name, phone, email: o.email, age: o.age, experience: o.level });
  updateRider(rider.id, { clubMember: true });
  return app;
}

/** True when a block would sit on top of existing bookings (admin warning). */
export function blockConflicts(date: ISODate, start: HHmm | undefined, end: HHmm | undefined, scope: Block["scope"]) {
  return bookingsAffectedBy(date, start, end, scope);
}

export { blockFor };
