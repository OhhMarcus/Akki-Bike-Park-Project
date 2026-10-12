import { defaultSchedule } from "@/config/schedule";
import { site } from "@/config/site";
import { lessons, pack5 } from "@/content/catalogue";
import { seedEvents, seedRegistrations } from "@/content/events";
import type {
  BikeSize, Block, Booking, BookingSource, Experience, ISODate, ParkEvent, Rentals, Rider,
} from "@/types";
import { pick, rng, weighted } from "./prng";
import { buildIndex, pumpSlotsOn, sessionsOn } from "./schedule";
import { bikeSizeForHeight } from "./sizing";
import { addDays, fromMin, toMin, weekdayOf } from "./time";
import { clamp, makeRef } from "./utils";

/**
 * SAMPLE DATA. Fictional riders, phone numbers and bookings, generated
 * deterministically from today's date so server and browser agree and the
 * demo always shows the next 4 weeks (plus 3 weeks of history for stats).
 */

export const HISTORY_DAYS = 21;
export const FUTURE_DAYS = 28;

const NAMES = [
  "Chan Ka Ho", "Wong Hoi Yan", "Lee Tsz Kin", "Mandy Lau", "Jason Cheung", "Ho Wing Sze", "Kelvin Ng",
  "Tam Chi Fung", "Leung Pui Yee", "Brian Yip", "Cheng Tsz Yau", "Chloe Fung", "Matthew Kwok", "Yuen Ka Lok",
  "Sharon Tse", "Kenji Mak", "Tsang Ho Yin", "Natalie Chow", "Liam Walsh", "Sophie Martin", "Daniel Wu",
  "Ivy Kwan", "Ryan Siu", "Lam Wai Kit", "Emily Tang", "Hugo Lai", "Cathy Poon", "Alex Fok", "Wilson Choi",
  "Joyce Lo", "Martin Hui", "Tiffany Yeung", "Ethan Chu", "Hannah Ko", "Oscar Leung", "Bella Shum",
  "Felix Tong", "Grace Ma", "Isaac Pang", "Kayla Lui", "Noah Tsui", "Olivia Kong", "Patrick So",
  "Queenie Wan", "Sam Yeung", "Tom Barker", "Una Cheuk", "Vincent Lok", "Wendy Ip", "Zoe Mok",
  "陳嘉豪", "黃凱琳", "李浩然", "張詠詩", "何俊希", "梁樂天", "吳曉晴", "林子朗", "鄭家樂", "馮靜怡",
  "周梓軒", "許諾文", "郭芷晴", "蕭子健", "麥浩賢", "曾綺雯", "羅家俊", "葉倩婷", "潘志恒", "Ray Chiu",
];

function makeRiders(today: ISODate): Rider[] {
  const used = new Set<string>();
  return NAMES.map((name, i) => {
    const r = rng(`rider:${i}`);
    const kid = r() < 0.28;
    const age = kid ? 7 + Math.floor(r() * 9) : 16 + Math.floor(r() * 36);
    const heightCm = kid ? clamp(Math.round(118 + (age - 7) * 6.5 + (r() - 0.5) * 10), 112, 180) : Math.round(152 + r() * 36);
    let phone = "";
    do {
      phone = `+852 ${pick(r, ["5550", "5551", "5552", "6550", "6551", "9550"])} ${String(Math.floor(r() * 10000)).padStart(4, "0")}`;
    } while (used.has(phone));
    used.add(phone);
    const experience = weighted<Experience>(r, [["new", 3], ["some", 4], ["regular", 3], ["racer", 1]]);
    const packs: Rider["packs"] = [];
    if (i % 9 === 4) {
      const remaining = 1 + Math.floor(r() * 4);
      packs.push({ id: `pack_${i}`, lessonId: "foundation", total: pack5.classes, remaining, purchasedOn: addDays(today, -40 + i), expiresOn: addDays(today, 140 + i) });
    }
    if (i % 13 === 7) {
      const remaining = 1 + Math.floor(r() * 3);
      packs.push({ id: `packa_${i}`, lessonId: "advanced", total: pack5.classes, remaining, purchasedOn: addDays(today, -60 + i), expiresOn: addDays(today, 120 + i) });
    }
    return {
      id: `rdr_${String(i + 1).padStart(3, "0")}`,
      name,
      phone,
      age,
      heightCm,
      experience,
      packs,
      clubMember: i % 5 === 2,
      createdAt: `${addDays(today, -120 + i)}T03:00:00.000Z`,
    };
  });
}

/** Planned closures that ship with the demo: race days, night jams, maintenance, a private hire. */
function makeBlocks(today: ISODate, events: ParkEvent[]): Block[] {
  const blocks: Block[] = [];
  for (const e of events) {
    if (e.type === "race" || e.type === "kidscamp") {
      blocks.push({ id: `blk_${e.id}`, date: e.date, scope: "pump", reason: "event", note: e.title.en });
    } else if (e.type === "nightjam") {
      const start = fromMin(Math.floor(toMin(e.start) / 60) * 60);
      blocks.push({ id: `blk_${e.id}`, date: e.date, start, end: "21:00", scope: "pump", reason: "event", note: e.title.en });
    }
  }
  // Track maintenance on the Thursday of next week, private hire on a Saturday afternoon in week 3.
  let thu = addDays(today, 7);
  while (weekdayOf(thu) !== 4) thu = addDays(thu, 1);
  blocks.push({ id: "blk_maint_1", date: thu, start: "15:00", end: "17:00", scope: "pump", reason: "maintenance", note: "Berm resurfacing" });
  let sat = addDays(today, 15);
  while (weekdayOf(sat) !== 6) sat = addDays(sat, 1);
  blocks.push({ id: "blk_private_1", date: sat, start: "14:00", end: "16:00", scope: "pump", reason: "private", note: "Private hire: company team day" });
  return blocks;
}

function rentalsFor(r: () => number, riders: number, heights: number[], bikeChance: number, helmetChance: number): Rentals {
  const bikes: Partial<Record<BikeSize, number>> = {};
  if (r() < bikeChance) {
    const n = Math.max(1, Math.round(riders * (0.5 + r() * 0.5)));
    for (let i = 0; i < n; i++) {
      const size = bikeSizeForHeight(heights[i % heights.length]) ?? "M";
      bikes[size] = (bikes[size] ?? 0) + 1;
    }
  }
  const helmets = r() < helmetChance ? riders : 0;
  return { bikes, helmets };
}

const bikeCount = (x: Rentals) => Object.values(x.bikes).reduce((s, n) => s + (n ?? 0), 0);

function stamp(date: ISODate, daysBefore: number, r: () => number) {
  const m = 8 * 60 + Math.floor(r() * 13 * 60);
  return `${addDays(date, -daysBefore)}T${fromMin(m)}:00.000+08:00`;
}

export type SeedData = {
  seedDate: ISODate;
  riders: Rider[];
  bookings: Booking[];
  events: ParkEvent[];
  blocks: Block[];
};

export function generateSeed(today: ISODate): SeedData {
  const riders = makeRiders(today);
  const events = seedEvents(today);
  const blocks = makeBlocks(today, events);
  const bookings: Booking[] = [];
  const empty = buildIndex([]);
  const prices = site.prices;

  for (let d = -HISTORY_DAYS; d <= FUTURE_DAYS; d++) {
    const date = addDays(today, d);
    const wd = weekdayOf(date);
    const weekend = wd === 0 || wd === 6;
    const decay = d > 0 ? 1 - Math.min(0.55, d / 45) : 1.05;

    /* --- pump track --- */
    for (const slot of pumpSlotsOn(date, defaultSchedule, empty, blocks)) {
      if (slot.status === "closed") continue;
      const r = rng(`pt:${slot.id}`);
      const hour = toMin(slot.start) / 60;
      let base = weekend ? 0.7 : wd === 5 ? 0.55 : 0.3;
      if (!weekend && hour >= 18) base += 0.22;
      if (!weekend && hour < 16) base -= 0.1;
      if (weekend && hour >= 11 && hour <= 15) base += 0.1;
      const roll = r();
      const fullChance = weekend ? 0.3 : hour >= 18 ? 0.2 : 0.06;
      let target: number;
      if (roll < fullChance) target = d > 14 ? 0.72 : 1;
      else if (roll < fullChance + 0.2) target = d > 18 ? 0.55 : 0.8 + r() * 0.12;
      else target = clamp(base * decay + (r() - 0.5) * 0.35, 0.05, 0.78);
      let seats = Math.round(target * slot.capacity);
      let n = 0;
      while (seats > 0) {
        const group = Math.min(seats, weighted(r, [[1, 45], [2, 30], [3, 15], [4, 10]] as const));
        seats -= group;
        const rider = riders[Math.floor(r() * riders.length)];
        const source: BookingSource = d <= 0
          ? weighted<BookingSource>(r, [["website", 50], ["whatsapp", 24], ["walkin", 26]])
          : weighted<BookingSource>(r, [["website", 66], ["whatsapp", 34]]);
        const heights = [rider.heightCm ?? 170, ...Array.from({ length: group - 1 }, () => 120 + Math.round(r() * 65))];
        const rentals = rentalsFor(r, group, heights, 0.33, 0.45);
        const priceHKD = group * prices.pumpPerRider + bikeCount(rentals) * prices.bikeRental + rentals.helmets * prices.helmetRental;
        const payment = d < 0 || source === "website" || source === "walkin" ? "paid" : r() < 0.55 ? "unpaid" : "paid";
        bookings.push({
          id: `bk_${slot.id}_${n}`,
          ref: makeRef(r),
          kind: "pump",
          targetId: slot.id,
          date, start: slot.start, end: slot.end,
          riderId: rider.id, riderName: rider.name, phone: rider.phone,
          riders: group,
          rentals,
          source,
          status: "confirmed",
          payment,
          attendance: d < 0 ? (r() < 0.92 ? "attended" : "no_show") : "pending",
          priceHKD,
          waiverSigned: true,
          createdAt: stamp(date, source === "walkin" ? 0 : 1 + Math.floor(r() * 9), r),
        });
        n++;
      }
      if (r() < 0.05) {
        const rider = riders[Math.floor(r() * riders.length)];
        bookings.push({
          id: `bk_${slot.id}_x`, ref: makeRef(r), kind: "pump", targetId: slot.id, date, start: slot.start, end: slot.end,
          riderId: rider.id, riderName: rider.name, phone: rider.phone, riders: 1, rentals: { bikes: {}, helmets: 0 },
          source: "website", status: "cancelled", payment: "refunded", attendance: "pending", priceHKD: prices.pumpPerRider,
          waiverSigned: true, createdAt: stamp(date, 4, r),
        });
      }
    }

    /* --- lessons --- */
    for (const s of sessionsOn(date, defaultSchedule, empty, blocks)) {
      if (s.status === "closed") continue;
      const r = rng(`les:${s.id}`);
      const roll = r();
      let seats = weekend
        ? roll < 0.42 ? s.capacity : roll < 0.7 ? s.capacity - 1 - Math.floor(r() * 2) : 2 + Math.floor(r() * 4)
        : roll < 0.25 ? s.capacity - 1 : 2 + Math.floor(r() * 5);
      if (d > 14) seats = Math.min(seats, 1 + Math.floor(r() * 4));
      let n = 0;
      const lesson = lessons[s.lessonId];
      while (seats > 0) {
        const group = Math.min(seats, weighted(r, [[1, 70], [2, 25], [3, 5]] as const));
        seats -= group;
        const rider = riders[Math.floor(r() * riders.length)];
        const source = weighted<BookingSource>(r, [["website", 45], ["klook", 30], ["whatsapp", 25]]);
        const heights = [rider.heightCm ?? 165, ...Array.from({ length: group - 1 }, () => 125 + Math.round(r() * 60))];
        const rentals = rentalsFor(r, group, heights, s.lessonId === "foundation" ? 0.72 : 0.35, 0.8);
        const pack = rider.packs.find((p) => p.lessonId === s.lessonId);
        const usedPack = !!pack && group === 1 && source === "website" && r() < 0.6;
        const priceHKD = (usedPack ? 0 : group * lesson.priceHKD) + bikeCount(rentals) * prices.bikeRental + rentals.helmets * prices.helmetRental;
        bookings.push({
          id: `bk_${s.id}_${n}`,
          ref: makeRef(r),
          kind: "lesson",
          targetId: s.id,
          date, start: s.start, end: s.end,
          riderId: rider.id, riderName: rider.name, phone: rider.phone,
          riders: group,
          rentals,
          source,
          status: "confirmed",
          payment: d < 0 || source !== "whatsapp" ? "paid" : r() < 0.5 ? "unpaid" : "paid",
          attendance: d < 0 ? (r() < 0.94 ? "attended" : "no_show") : "pending",
          priceHKD,
          usedPack,
          externalRef: source === "klook" ? `KLK-${Math.floor(10000000 + r() * 89999999)}` : undefined,
          waiverSigned: true,
          createdAt: stamp(date, 2 + Math.floor(r() * 12), r),
        });
        n++;
      }
    }
  }

  /* --- event registrations --- */
  for (const e of events) {
    for (const c of e.categories) {
      const count = Math.min(c.capacity, seedRegistrations[c.id] ?? 0);
      const r = rng(`evt:${c.id}`);
      for (let i = 0; i < count; i++) {
        const rider = riders[Math.floor(r() * riders.length)];
        const source = weighted<BookingSource>(r, [["website", 78], ["whatsapp", 22]]);
        bookings.push({
          id: `bk_${e.id}_${c.id}_${i}`,
          ref: makeRef(r),
          kind: "event",
          targetId: e.id,
          eventCategoryId: c.id,
          date: e.date, start: e.start, end: e.end,
          riderId: rider.id, riderName: rider.name, phone: rider.phone,
          riders: 1,
          rentals: { bikes: {}, helmets: 0 },
          source,
          status: "confirmed",
          payment: c.priceHKD === 0 ? "paid" : source === "website" ? "paid" : r() < 0.6 ? "unpaid" : "paid",
          attendance: "pending",
          priceHKD: c.priceHKD,
          waiverSigned: true,
          createdAt: stamp(e.date, 3 + Math.floor(r() * 20), r),
        });
      }
    }
  }

  return { seedDate: today, riders, bookings, events, blocks };
}
