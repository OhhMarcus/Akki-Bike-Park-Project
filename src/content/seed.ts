import type { Announcement, Booking, Enquiry, GroupEnquiry, Membership, ParkStatus, PromotionCode, WaitlistEntry, ParticipantInput } from "@/types";
import { daysFromToday } from "@/lib/dates";

/** Everything here is DEMONSTRATION DATA (fictional names, fictional numbers). */

const now = new Date("2025-01-01T00:00:00Z").toISOString();

export const seedParkStatus: ParkStatus = {
  open: true,
  note: { en: "Open today. Conditions are checked each morning.", zh: "今日開放。每日早上會檢查場地狀況。" },
  updatedAt: now,
};

export const seedAnnouncement: Announcement = {
  id: "ann_1",
  active: true,
  tone: "info",
  text: {
    en: "Demo announcement: edit this banner from Admin → Announcement.",
    zh: "示範公告：可於後台「公告」編輯此橫額。",
  },
  linkHref: "/booking",
  updatedAt: now,
};

export const seedPromos: PromotionCode[] = [
  { id: "promo_1", code: "FIRSTRIDE", kind: "percent", value: 10, active: true, usageLimit: null, used: 3, description: "Demo first-visit offer (10% off)" },
  { id: "promo_2", code: "AKKI50", kind: "fixed", value: 50, active: true, usageLimit: 100, used: 12, description: "Demo fixed HK$50 off" },
  { id: "promo_3", code: "FRIEND-DEMO", kind: "percent", value: 5, active: true, usageLimit: null, used: 1, referral: true, description: "Demo referral code" },
  { id: "promo_4", code: "OLD2024", kind: "percent", value: 15, active: false, usageLimit: null, used: 40, description: "Expired demo campaign" },
];

function person(name: string, age: number, level: ParticipantInput["level"], bike: "own" | "rental" = "own"): ParticipantInput {
  return {
    id: `p_${name}`,
    name,
    age,
    level,
    emergencyName: "Demo Contact",
    emergencyPhone: "+85200000000",
    bike,
    equipment: { helmet: bike === "rental", gloves: false, pads: false },
    coachingAddOn: false,
    guardian: age < 18 ? { name: "Demo Guardian", relationship: "Parent", phone: "+85200000000", email: "guardian@example.com", consentGiven: true } : undefined,
  };
}

function b(i: number, o: Partial<Booking> & Pick<Booking, "contactName" | "experienceId" | "date" | "period" | "participants" | "total">): Booking {
  return {
    id: `bk_seed_${i}`,
    reference: `AKKI-DEMO${i.toString().padStart(2, "0")}`,
    contactEmail: `rider${i}@example.com`,
    contactPhone: "+85200000000",
    status: "confirmed",
    paymentStatus: "paid_demo",
    paymentMethod: "fps",
    subtotal: o.total,
    discount: 0,
    waiverAccepted: true,
    termsAccepted: true,
    marketingConsent: false,
    createdAt: now,
    isDemo: true,
    ...o,
  };
}

export const seedBookings: Booking[] = [
  b(1, { contactName: "Demo Rider A", experienceId: "entry", date: daysFromToday(0), period: "morning", participants: [person("Demo Rider A", 29, "intermediate")], total: 120, status: "checked_in" }),
  b(2, { contactName: "Demo Family B", experienceId: "kids", date: daysFromToday(0), period: "afternoon", participants: [person("Demo Kid B1", 9, "beginner", "rental"), person("Demo Kid B2", 11, "beginner", "rental")], total: 640 }),
  b(3, { contactName: "Demo Rider C", experienceId: "coaching", date: daysFromToday(1), period: "morning", participants: [person("Demo Rider C", 34, "beginner", "rental")], total: 570 }),
  b(4, { contactName: "Demo School D", experienceId: "school", date: daysFromToday(3), period: "fullday", participants: Array.from({ length: 12 }, (_, i) => person(`Demo Student ${i + 1}`, 13, "beginner", "rental")), total: 1800, status: "pending", paymentStatus: "unpaid" }),
  b(5, { contactName: "Demo Rider E", experienceId: "beginner", date: daysFromToday(2), period: "afternoon", participants: [person("Demo Rider E", 41, "beginner")], total: 280, changeRequest: { type: "change", note: "Can we move to Sunday?", requestedAt: now } }),
  b(6, { contactName: "Demo Corp F", experienceId: "corporate", date: daysFromToday(6), period: "afternoon", participants: Array.from({ length: 10 }, (_, i) => person(`Demo Staff ${i + 1}`, 32, "beginner", "rental")), total: 4900 }),
  b(7, { contactName: "Demo Rider G", experienceId: "entry", date: daysFromToday(-2), period: "morning", participants: [person("Demo Rider G", 25, "advanced")], total: 120, status: "completed" }),
  b(8, { contactName: "Demo Rider H", experienceId: "entry", date: daysFromToday(-1), period: "afternoon", participants: [person("Demo Rider H", 38, "intermediate")], total: 120, status: "cancelled", paymentStatus: "refund_requested" }),
  b(9, { contactName: "Demo Rider I", experienceId: "camp", date: daysFromToday(9), period: "fullday", participants: [person("Demo Kid I", 12, "intermediate", "rental")], total: 930 }),
  b(10, { contactName: "Demo Rider J", experienceId: "entry", date: daysFromToday(0), period: "afternoon", participants: [person("Demo Rider J", 27, "intermediate"), person("Demo Rider K", 28, "intermediate")], total: 240 }),
];

export const seedWaitlist: WaitlistEntry[] = [
  { id: "wl_1", name: "Demo Waitlist A", email: "wl1@example.com", phone: "+85200000000", experienceId: "entry", date: daysFromToday(5), period: "morning", partySize: 2, status: "waiting", createdAt: now, isDemo: true },
  { id: "wl_2", name: "Demo Waitlist B", email: "wl2@example.com", phone: "+85200000000", experienceId: "coaching", date: daysFromToday(4), period: "afternoon", partySize: 1, status: "notified", createdAt: now, isDemo: true },
];

export const seedEnquiries: Enquiry[] = [
  { id: "enq_1", topic: "general", name: "Demo Visitor", email: "visitor@example.com", message: "Demo enquiry: is the park suitable for a 7 year old on a balance bike?", status: "new", consent: true, createdAt: now, isDemo: true },
  { id: "enq_2", topic: "partnership", name: "Demo Brand", email: "brand@example.com", message: "Demo enquiry: we would like to host a product demo day.", status: "new", consent: true, createdAt: now, isDemo: true },
  { id: "enq_3", topic: "booking", name: "Demo Rider", email: "rider@example.com", message: "Demo enquiry: can I change my booking date?", status: "replied", consent: true, createdAt: now, isDemo: true },
];

export const seedGroupEnquiries: GroupEnquiry[] = [
  { id: "ge_1", segment: "school", organisation: "Demo Secondary School", contactName: "Demo Teacher", email: "teacher@example.com", phone: "+85200000000", groupSize: 30, addOns: ["coaching", "rental"], message: "Demo enquiry for an outdoor education day.", status: "new", createdAt: now, isDemo: true },
  { id: "ge_2", segment: "corporate", organisation: "Demo Company Ltd", contactName: "Demo HR", email: "hr@example.com", phone: "+85200000000", groupSize: 20, addOns: ["catering", "photography"], message: "Demo team-building enquiry.", status: "quoted", createdAt: now, isDemo: true },
];

export const seedMemberships: Membership[] = [
  { id: "m_1", riderName: "Demo Member One", email: "m1@example.com", phone: "+85200000000", tier: "annual", status: "active", startsOn: daysFromToday(-120), endsOn: daysFromToday(245), visits: 18, isDemo: true },
  { id: "m_2", riderName: "Demo Member Two", email: "m2@example.com", phone: "+85200000000", tier: "monthly", status: "active", startsOn: daysFromToday(-10), endsOn: daysFromToday(20), visits: 4, isDemo: true },
  { id: "m_3", riderName: "Demo Family Three", email: "m3@example.com", phone: "+85200000000", tier: "family", status: "expired", startsOn: daysFromToday(-400), endsOn: daysFromToday(-35), visits: 31, isDemo: true },
];
