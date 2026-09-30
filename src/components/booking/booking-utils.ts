import { getExperience } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { emailSchema, fieldErrors, participantSchema, phoneSchema } from "@/lib/validation";
import { uid } from "@/lib/utils";
import type {
  Booking, BookingDraft, DayPeriod, ExperienceId, EventRegistration, Guardian, ParkEvent, ParticipantInput, PaymentMethodId,
} from "@/types";

export const STEP_COUNT = 6;
/** Guests arrive this many minutes before the session starts. */
export const ARRIVAL_MINUTES = 15;

export type FlowState = {
  /** 1..6 (6 = confirmation, never persisted) */
  step: number;
  experienceId?: ExperienceId;
  eventId?: string;
  date?: string;
  period?: DayPeriod;
  participants: ParticipantInput[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  marketingConsent: boolean;
  /** Applied (validated) promo code, or "" */
  promoCode: string;
  terms: boolean;
  waiver: boolean;
  paymentMethod: PaymentMethodId;
};

export type FlowInit = { exp?: string; event?: string; date?: string; promo?: string };

export function emptyGuardian(): Guardian {
  return { name: "", relationship: "", phone: "", email: "", consentGiven: false };
}

export function blankParticipant(): ParticipantInput {
  return {
    id: uid("p"),
    name: "",
    age: "",
    level: "beginner",
    emergencyName: "",
    emergencyPhone: "",
    bike: "own",
    equipment: { helmet: false, gloves: false, pads: false },
    coachingAddOn: false,
  };
}

export function fitParticipants(list: ParticipantInput[], expId: ExperienceId | undefined): ParticipantInput[] {
  const exp = expId ? getExperience(expId) : undefined;
  const min = exp?.minParticipants ?? 1;
  const max = exp?.maxParticipants ?? 40;
  const out = list.slice(0, max);
  while (out.length < Math.max(1, min)) out.push(blankParticipant());
  return out;
}

export function initialState(init: FlowInit): FlowState {
  const wantsEvent = !!init.event;
  const expId = (wantsEvent ? "event" : getExperience(init.exp ?? "")?.id) as ExperienceId | undefined;
  const eventReady = expId !== "event" || !!init.event;
  return {
    step: expId && eventReady ? 2 : 1,
    experienceId: expId,
    eventId: wantsEvent ? init.event : undefined,
    date: init.date && /^\d{4}-\d{2}-\d{2}$/.test(init.date) && expId !== "event" ? init.date : undefined,
    period: undefined,
    participants: fitParticipants([], expId),
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    marketingConsent: false,
    promoCode: "",
    terms: false,
    waiver: false,
    paymentMethod: "card",
  };
}

export function toDraft(s: FlowState): BookingDraft {
  return {
    step: Math.min(5, Math.max(1, s.step)),
    experienceId: s.experienceId,
    eventId: s.eventId,
    date: s.date,
    period: s.period,
    participants: s.participants,
    contactName: s.contactName,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    promoCode: s.promoCode || undefined,
    updatedAt: new Date().toISOString(),
  };
}

export function fromDraft(d: BookingDraft, base: FlowState): FlowState {
  return {
    ...base,
    step: Math.min(5, Math.max(1, d.step)),
    experienceId: d.experienceId,
    eventId: d.eventId,
    date: d.date,
    period: d.period,
    participants: fitParticipants(d.participants ?? [], d.experienceId),
    contactName: d.contactName ?? "",
    contactEmail: d.contactEmail ?? "",
    contactPhone: d.contactPhone ?? "",
    promoCode: d.promoCode ?? "",
  };
}

/** Morning/afternoon/full-day period that best describes an event's own times. */
export function eventPeriod(ev: Pick<ParkEvent, "startTime" | "endTime">): DayPeriod {
  const s = toMinutes(ev.startTime);
  const e = toMinutes(ev.endTime);
  if (e - s >= 360) return "fullday";
  return s < 12 * 60 ? "morning" : "afternoon";
}

export function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minusMinutes(t: string, mins: number) {
  const total = Math.max(0, toMinutes(t) - mins);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function eventRemaining(ev: ParkEvent, regs: EventRegistration[]) {
  const local = regs.filter((r) => r.eventId === ev.id).length;
  return Math.max(0, ev.capacity - ev.registered - local);
}

export function eventOpen(ev: ParkEvent, today: string) {
  return ev.published && ev.registrationDeadline >= today && ev.date >= today;
}

export function sessionTimes(b: Pick<Booking, "period" | "eventId">, events: ParkEvent[]) {
  const ev = b.eventId ? events.find((e) => e.id === b.eventId) : undefined;
  if (ev) return { start: ev.startTime, end: ev.endTime };
  const t = siteConfig.sessions[b.period];
  return { start: t.start, end: t.end };
}

export function cleanParticipant(p: ParticipantInput): ParticipantInput {
  const minor = typeof p.age === "number" && p.age < 18;
  return {
    ...p,
    age: p.age === "" ? "" : Number(p.age),
    guardian: minor ? (p.guardian ?? emptyGuardian()) : undefined,
    coachingAddOn: !!p.coachingAddOn,
  };
}

/** Keys look like `0.name`, `1.guardian.phone`. Values are message keys. */
export function validateParticipants(list: ParticipantInput[]): Record<string, string> {
  const out: Record<string, string> = {};
  list.forEach((p, i) => {
    const r = participantSchema.safeParse(cleanParticipant(p));
    if (!r.success) {
      const fe = fieldErrors(r.error);
      for (const k of Object.keys(fe)) out[`${i}.${k}`] = fe[k];
    }
    if (p.age === "") out[`${i}.age`] = "val.required";
  });
  return out;
}

export function validateContact(c: { contactName: string; contactEmail: string; contactPhone: string }): Record<string, string> {
  const out: Record<string, string> = {};
  const name = c.contactName.trim();
  if (!name) out.contactName = "val.required";
  else if (name.length > 80) out.contactName = "val.tooLong";
  const e = emailSchema.safeParse(c.contactEmail);
  if (!e.success) out.contactEmail = c.contactEmail.trim() ? "val.email" : "val.required";
  const p = phoneSchema.safeParse(c.contactPhone);
  if (!p.success) out.contactPhone = c.contactPhone.trim() ? "val.phone" : "val.required";
  return out;
}

/** Focus and scroll to the first invalid field (by DOM order of ids). */
export function focusFirstError(ids: string[]) {
  if (typeof document === "undefined") return;
  const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
  els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const first = els[0];
  if (!first) return;
  first.scrollIntoView({ block: "center", behavior: "smooth" });
  first.focus({ preventScroll: true });
}

export function bookingLocation(locale: "en" | "zh") {
  return `${siteConfig.name[locale]}, ${siteConfig.address[locale]}`;
}
