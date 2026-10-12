/**
 * AKKI domain model. Shaped so each interface maps to one database table later
 * (see supabase/schema.sql). Dates are "YYYY-MM-DD" and times "HH:mm", both in
 * Hong Kong time. Money is whole Hong Kong dollars.
 */

export type Locale = "en" | "zh";
export type LocalizedText = { en: string; zh: string };

export type ISODate = string; // YYYY-MM-DD (HK)
export type HHmm = string; // 24h "14:00"

/* ---------- Catalogue ---------- */

export type LessonId = "foundation" | "advanced";
export type TeachingLanguage = "en" | "yue"; // English, Cantonese

export interface Lesson {
  id: LessonId;
  level: "beginner" | "advanced";
  name: LocalizedText;
  summary: LocalizedText;
  learn: LocalizedText[];
  durationMin: number;
  capacity: number; // small group cap per session
  minAge: number;
  priceHKD: number; // PLACEHOLDER price
}

export interface ClassPack {
  id: "pack5";
  classes: number;
  validityDays: number;
  /** PLACEHOLDER price per lesson type */
  priceHKD: Record<LessonId, number>;
}

export interface Coach {
  id: string;
  name: LocalizedText; // PLACEHOLDER
  role: LocalizedText;
  languages: TeachingLanguage[];
  photoSlot: string; // image slot name in /public/images
}

/* ---------- Schedule ---------- */

/** Recurring weekly lesson time, edited in Admin → Schedule. weekday: 0 = Sunday. */
export interface LessonTemplate {
  id: string;
  lessonId: LessonId;
  weekday: number;
  start: HHmm;
  language: TeachingLanguage;
  coachId: string;
  capacity: number;
  active: boolean;
}

export interface PumpTrackDayHours {
  weekday: number; // 0 = Sunday
  open: boolean;
  start: HHmm;
  end: HHmm;
}

export interface ScheduleSettings {
  lessonTemplates: LessonTemplate[];
  pumpHours: PumpTrackDayHours[];
  slotMinutes: number; // PLACEHOLDER session length
  slotCapacity: number; // PLACEHOLDER riders per session
  updatedAt: string;
}

export type BlockReason = "maintenance" | "private" | "weather" | "event" | "other";

/** A closed period. No start/end = whole day. */
export interface Block {
  id: string;
  date: ISODate;
  start?: HHmm;
  end?: HHmm;
  scope: "all" | "pump" | "lessons";
  reason: BlockReason;
  note?: string;
  closureId?: string;
  /** true for blocks added during the demo (kept when sample data refreshes) */
  userCreated?: boolean;
}

/* ---------- Bookable units (generated from schedule) ---------- */

export type SlotStatus = "available" | "almost" | "full" | "closed";

/** A lesson running on a date ("Session" in the brief). */
export interface Session {
  id: string; // les_<lessonId>_<date>_<HHmm>
  lessonId: LessonId;
  templateId: string;
  date: ISODate;
  start: HHmm;
  end: HHmm;
  language: TeachingLanguage;
  coachId: string;
  capacity: number;
  booked: number;
  remaining: number;
  status: SlotStatus;
  closedReason?: BlockReason;
}

export interface PumpTrackSlot {
  id: string; // pt_<date>_<HHmm>
  date: ISODate;
  start: HHmm;
  end: HHmm;
  capacity: number;
  booked: number;
  remaining: number;
  status: SlotStatus;
  closedReason?: BlockReason;
}

/* ---------- People & bookings ---------- */

export type BookingSource = "website" | "klook" | "whatsapp" | "walkin";
export type BookingKind = "lesson" | "pump" | "event";
export type BikeSize = "k20" | "k24" | "S" | "M" | "L" | "XL";
export type Experience = "new" | "some" | "regular" | "racer";

export interface Rentals {
  bikes: Partial<Record<BikeSize, number>>;
  helmets: number;
}

export interface Booking {
  id: string;
  ref: string; // shown to riders, e.g. AK-7F3K2
  kind: BookingKind;
  /** Session.id, PumpTrackSlot.id or ParkEvent.id */
  targetId: string;
  date: ISODate;
  start: HHmm;
  end: HHmm;
  riderId: string;
  riderName: string;
  phone: string;
  riders: number; // headcount on this booking
  rentals: Rentals;
  source: BookingSource;
  status: "confirmed" | "cancelled";
  payment: "paid" | "unpaid" | "refunded";
  attendance: "pending" | "attended" | "no_show";
  priceHKD: number;
  usedPack?: boolean;
  eventCategoryId?: string;
  externalRef?: string; // e.g. Klook order number
  notes?: string;
  /** Set by a weather closure until staff resolve it */
  flag?: { closureId: string; reason: WarningCode; notified: boolean };
  waiverSigned?: boolean;
  createdAt: string;
  /** true for records created during the demo (kept when sample data refreshes) */
  userCreated?: boolean;
}

export interface PackHolding {
  id: string;
  lessonId: LessonId;
  total: number;
  remaining: number;
  purchasedOn: ISODate;
  expiresOn: ISODate;
}

export interface Rider {
  id: string;
  name: string;
  phone: string; // +852 format
  email?: string;
  age?: number;
  heightCm?: number;
  experience?: Experience;
  packs: PackHolding[];
  clubMember?: boolean;
  notes?: string;
  createdAt: string;
  userCreated?: boolean;
}

/* ---------- Events ---------- */

export type EventType = "race" | "nightjam" | "groupride" | "kidscamp";

export interface EventCategory {
  id: string;
  name: LocalizedText;
  ages: LocalizedText;
  capacity: number;
  priceHKD: number; // PLACEHOLDER
}

export interface ParkEvent {
  id: string;
  slug: string;
  type: EventType;
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedText;
  date: ISODate;
  start: HHmm;
  end: HHmm;
  categories: EventCategory[];
  published: boolean;
  photoSlot?: string;
  createdAt: string;
  userCreated?: boolean;
}

/* ---------- Weather & operations ---------- */

export type WarningCode = "black_rain" | "red_rain" | "amber_rain" | "t8" | "t3" | "very_hot" | "thunderstorm";

export interface Closure {
  id: string;
  date: ISODate;
  start?: HHmm;
  end?: HHmm;
  warning: WarningCode;
  createdAt: string;
  affectedBookingIds: string[];
  messageSent: boolean;
  reopenedAt?: string;
  messageEn: string;
  messageZh: string;
}

/** Sample conditions shown on the site. Real version: HK Observatory open data API. */
export interface Conditions {
  /** Manually set warning (Admin → Weather). null = no warning in force. */
  warning: WarningCode | null;
  updatedAt: string;
}

export interface ClubApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  level: Experience;
  createdAt: string;
}
