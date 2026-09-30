/**
 * Domain types. Every type maps 1:1 to a table in supabase/schema.sql
 * (snake_case columns there, camelCase here).
 */

export type Locale = "en" | "zh";
export type LocalizedText = { en: string; zh: string };

export type Level = "beginner" | "intermediate" | "advanced";
export type Difficulty = Level;
export type DayPeriod = "morning" | "afternoon" | "fullday";
export type Availability = "available" | "limited" | "full" | "closed";

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "rider" | "staff" | "admin";
  language: Locale;
  marketingConsent: boolean;
  createdAt: string;
};

export type Guardian = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  consentGiven: boolean;
};

export type RiderProfile = {
  id: string;
  userId?: string;
  name: string;
  age: number;
  level: Level;
  emergencyContactName: string;
  emergencyContactPhone: string;
  guardian?: Guardian;
};

export type ExperienceId =
  | "entry"
  | "beginner"
  | "coaching"
  | "kids"
  | "camp"
  | "private"
  | "school"
  | "corporate"
  | "event";

export type Experience = {
  id: ExperienceId;
  name: LocalizedText;
  blurb: LocalizedText;
  /** DEMO price in HKD. Replace via src/config/pricing.ts */
  priceHKD: number;
  pricingUnit: "person" | "group";
  /** Minimum participants for the booking */
  minParticipants: number;
  maxParticipants: number;
  periods: DayPeriod[];
  level: Level | "all";
  icon: string;
  /** Needs an approved enquiry rather than instant payment */
  quoteOnly?: boolean;
};

export type TimeSlot = {
  id: string; // `${date}_${period}`
  date: string; // YYYY-MM-DD (Hong Kong time)
  period: DayPeriod;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  remaining: number;
  status: Availability;
};

export type ParticipantInput = {
  id: string;
  name: string;
  age: number | "";
  level: Level;
  emergencyName: string;
  emergencyPhone: string;
  bike: "own" | "rental";
  equipment: { helmet: boolean; gloves: boolean; pads: boolean };
  guardian?: Guardian;
  coachingAddOn: boolean;
};

export type BookingParticipant = ParticipantInput & { bookingId: string };

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";
export type PaymentStatus = "unpaid" | "paid_demo" | "refund_requested" | "refunded_demo";

export type Booking = {
  id: string;
  reference: string;
  experienceId: ExperienceId;
  /** Event id when experienceId === "event" */
  eventId?: string;
  date: string;
  period: DayPeriod;
  participants: ParticipantInput[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethodId;
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  waiverAccepted: boolean;
  waiverId?: string;
  termsAccepted: boolean;
  marketingConsent: boolean;
  changeRequest?: { type: "cancel" | "change"; note: string; requestedAt: string };
  notes?: string;
  createdAt: string;
  isDemo?: boolean;
};

export type PaymentMethodId = "card" | "fps" | "alipayhk" | "wechat";

export type EventType =
  | "race"
  | "clinic"
  | "beginner_day"
  | "kids_camp"
  | "holiday"
  | "community"
  | "demo"
  | "school"
  | "corporate";

export type ParkEvent = {
  id: string;
  slug: string;
  type: EventType;
  title: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  /** YYYY-MM-DD (HK) */
  date: string;
  startTime: string;
  endTime: string;
  level: Level | "all";
  minAge: number;
  maxAge?: number;
  capacity: number;
  registered: number;
  registrationDeadline: string;
  priceHKD: number | null;
  schedule: { time: string; item: LocalizedText }[];
  organizer: { name: LocalizedText; role: LocalizedText };
  requiredEquipment: LocalizedText[];
  faq: { q: LocalizedText; a: LocalizedText }[];
  featured?: boolean;
  /** True = illustrative content. Only isDemo === false events get JSON-LD and countdowns. */
  isDemo: boolean;
  published: boolean;
};

export type EventRegistration = {
  id: string;
  eventId: string;
  bookingId?: string;
  riderName: string;
  email: string;
  createdAt: string;
};

export type CoachingProgramme = {
  id: string;
  name: LocalizedText;
  summary: LocalizedText;
  level: Level | "all";
  ageRange: LocalizedText;
  duration: LocalizedText;
  groupSize: LocalizedText;
  equipment: LocalizedText[];
  outcomes: LocalizedText[];
  instructor: LocalizedText;
  priceHKD: number | null;
  /** days from today until the next demo session */
  nextSessionOffsetDays: number;
  experienceId: ExperienceId;
  icon: string;
};

export type Membership = {
  id: string;
  riderName: string;
  email: string;
  phone: string;
  tier: "none" | "monthly" | "annual" | "family";
  status: "active" | "expired" | "pending";
  startsOn: string;
  endsOn: string;
  visits: number;
  isDemo?: boolean;
};

export type Waiver = {
  id: string;
  version: string;
  bookingId: string;
  signerName: string;
  signerType: "adult" | "guardian";
  minorNames: string[];
  acceptedAt: string;
  consentToDataUse: boolean;
};

export type PromotionCode = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: number;
  active: boolean;
  usageLimit: number | null;
  used: number;
  expiresOn?: string;
  description: string;
  /** Referral codes credit a rider rather than discount staff-issued campaigns */
  referral?: boolean;
};

export type GroupEnquiry = {
  id: string;
  segment: "school" | "youth" | "corporate" | "birthday" | "private" | "brand";
  organisation: string;
  contactName: string;
  email: string;
  phone: string;
  groupSize: number;
  preferredDate?: string;
  addOns: ("coaching" | "rental" | "catering" | "photography")[];
  message: string;
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  createdAt: string;
  isDemo?: boolean;
};

export type Enquiry = {
  id: string;
  topic: "general" | "booking" | "group" | "partnership";
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "new" | "replied" | "closed";
  consent: boolean;
  createdAt: string;
  isDemo?: boolean;
};

export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  experienceId: ExperienceId;
  date: string;
  period: DayPeriod;
  partySize: number;
  status: "waiting" | "notified" | "booked" | "removed";
  createdAt: string;
  isDemo?: boolean;
};

export type ParkStatus = {
  open: boolean;
  /** Free-text reason shown when closed (weather etc.) */
  note: LocalizedText;
  updatedAt: string;
};

export type Announcement = {
  id: string;
  active: boolean;
  tone: "info" | "warning";
  text: LocalizedText;
  linkHref?: string;
  updatedAt: string;
};

export type CapacityOverride = {
  /** `${date}_${period}` */
  slotId: string;
  capacity?: number;
  blocked?: boolean;
};

export type BookingDraft = {
  step: number;
  experienceId?: ExperienceId;
  eventId?: string;
  date?: string;
  period?: DayPeriod;
  participants: ParticipantInput[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  promoCode?: string;
  updatedAt: string;
};
