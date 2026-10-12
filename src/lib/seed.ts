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

/** Name parts for the casual riders (people who come once or twice). */
const SURNAMES = [
  "Chan", "Wong", "Lee", "Cheung", "Lau", "Ho", "Ng", "Leung", "Tam", "Lam", "Yip", "Cheng", "Fung", "Kwok", "Tsang",
  "Chow", "Mak", "Siu", "Lai", "Poon", "Fok", "Choi", "Lo", "Hui", "Yeung", "Chu", "Ko", "Shum", "Tong", "Ma", "Pang",
  "Lui", "Tsui", "Kong", "So", "Wan", "Cheuk", "Ip", "Mok", "Chiu", "Kwan", "Tang", "Wu", "Yuen", "Tse", "Chung",
  "Law", "Sin", "Hung", "Kan", "Au", "Yu", "Chong", "Luk", "To", "Yau",
];
const GIVEN_EN = [
  "Aaron", "Agnes", "Alvin", "Amy", "Andy", "Angus", "Ashley", "Ben", "Bonnie", "Boris", "Calvin", "Carmen", "Chris",
  "Cyrus", "Derek", "Dicky", "Eddie", "Elaine", "Eric", "Fiona", "Gary", "Gloria", "Gordon", "Heidi", "Henry", "Ian",
  "Jacky", "Janice", "Jeffrey", "Jenny", "Joey", "Karen", "Katie", "Ken", "Kenny", "Kitty", "Leo", "Leon", "Louis",
  "Lucas", "Marco", "Max", "Michelle", "Nicole", "Owen", "Peter", "Phoebe", "Rachel", "Raymond", "Ricky", "Ruby",
  "Simon", "Stanley", "Terence", "Toby", "Venus", "Victor", "Vivian", "Winnie", "Yoyo", "Justin", "Edison", "Ada",
  "Annie", "Cherry", "Erica", "Hayden", "Jayden", "Ivan", "Gigi", "Sunny", "Samson",
];
const GIVEN_YUE = [
  "Ka Ming", "Hoi Lam", "Tsz Ching", "Chun Hei", "Yat Long", "Hiu Tung", "Lok Yi", "Cheuk Hin", "Man Ho", "Wing Yan",
  "Sze Wing", "Ka Yan", "Pak Hei", "Tsz Long", "Ho Lam", "Hoi Ching", "Wai Lun", "Kin Wai", "Ka Wai", "Chi Hang",
  "Hok Yin", "Yan Ting", "Wing Hei", "Sum Yi", "Tsz Hin", "Long Yin", "Ching Yan", "Yik Hei", "Hei Tung", "Pui Shan",
  "King Lun", "Chun Yin", "Ming Hei", "Sin Yi", "Tin Yau", "Ka Kit",
];
const SURNAMES_ZH = ["陳", "黃", "李", "張", "何", "梁", "吳", "林", "鄭", "馮", "周", "許", "郭", "蕭", "麥", "曾", "羅", "葉", "潘", "劉", "楊", "朱", "胡", "鄧", "譚", "盧", "蔡", "余", "杜", "石"];
const GIVEN_ZH = [
  "嘉欣", "卓希", "穎欣", "汶希", "朗晴", "家朗", "映彤", "皓軒", "天佑", "心悅", "樂晴", "芷澄", "洛謙", "卓楠", "梓晴",
  "俊熙", "子謙", "凱晴", "浩霖", "曉彤", "家晴", "頌恩", "澤霖", "柏希", "思穎", "晉軒", "詩琪", "偉傑", "雅琪", "健朗",
];
const WESTERN = [
  "James Smith", "Jack Taylor", "Emma Wilson", "Lucas Moreau", "Mia Thompson", "Ben Clarke", "Ella Wright", "Oliver Brown",
  "Chris Dunn", "Hana Sato", "Yuki Tanaka", "Arjun Mehta", "Priya Nair", "Jonas Weber", "Lena Fischer", "Tom O'Brien",
];

/** About a third of bookings come from the regulars (the first NAMES); the rest from casual riders. */
const REGULARS = NAMES.length;
const CASUALS = 700;
const REGULAR_SHARE = 0.32;

function casualNames(): string[] {
  const r = rng("casual-names");
  const seen = new Set(NAMES);
  const out: string[] = [];
  while (out.length < CASUALS) {
    const k = r();
    const name =
      k < 0.42 ? `${pick(r, GIVEN_EN)} ${pick(r, SURNAMES)}`
      : k < 0.72 ? `${pick(r, SURNAMES)} ${pick(r, GIVEN_YUE)}`
      : k < 0.97 ? `${pick(r, SURNAMES_ZH)}${pick(r, GIVEN_ZH)}`
      : pick(r, WESTERN);
    if (seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

function makeRiders(today: ISODate): Rider[] {
  const used = new Set<string>();
  return [...NAMES, ...casualNames()].map((name, i) => {
    const regular = i < REGULARS;
    const r = rng(`rider:${i}`);
    const kid = r() < 0.28;
    const age = kid ? 7 + Math.floor(r() * 9) : 16 + Math.floor(r() * 36);
    const heightCm = kid ? clamp(Math.round(118 + (age - 7) * 6.5 + (r() - 0.5) * 10), 112, 180) : Math.round(152 + r() * 36);
    let phone = "";
    do {
      phone = `+852 ${pick(r, ["5550", "5551", "5552", "6550", "6551", "9550"])} ${String(Math.floor(r() * 10000)).padStart(4, "0")}`;
    } while (used.has(phone));
    used.add(phone);
    const experience = regular
      ? weighted<Experience>(r, [["new", 1], ["some", 4], ["regular", 5], ["racer", 2]])
      : weighted<Experience>(r, [["new", 5], ["some", 4], ["regular", 1], ["racer", 0.3]]);
    const packs: Rider["packs"] = [];
    if (!regular) {
      // joined some time in the last ~14 months; trimmed to their first booking once bookings exist
      return {
        id: `rdr_${String(i + 1).padStart(3, "0")}`,
        name, phone, age, heightCm, experience, packs,
        clubMember: false,
        createdAt: `${addDays(today, -1 - Math.floor(r() * 420))}T04:00:00.000Z`,
      };
    }
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
      blocks.push({ id: `blk_${e.id}`, date: e.date, scope: "pump", reason: "event", note: e.title });
    } else if (e.type === "nightjam") {
      const start = fromMin(Math.floor(toMin(e.start) / 60) * 60);
      blocks.push({ id: `blk_${e.id}`, date: e.date, start, end: "21:00", scope: "pump", reason: "event", note: e.title });
    }
  }
  // Track maintenance on the Thursday of next week, private hire on a Saturday afternoon in week 3.
  let thu = addDays(today, 7);
  while (weekdayOf(thu) !== 4) thu = addDays(thu, 1);
  blocks.push({ id: "blk_maint_1", date: thu, start: "15:00", end: "17:00", scope: "pump", reason: "maintenance", note: { en: "Berm resurfacing", zh: "重鋪彎道" } });
  let sat = addDays(today, 15);
  while (weekdayOf(sat) !== 6) sat = addDays(sat, 1);
  blocks.push({ id: "blk_private_1", date: sat, start: "14:00", end: "16:00", scope: "pump", reason: "private", note: { en: "Private hire: company team day", zh: "包場：公司團隊日" } });
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

/** When a booking was made: `daysBefore` the date it's for, but never later than today. */
function stamp(date: ISODate, daysBefore: number, r: () => number, today: ISODate) {
  const m = 8 * 60 + Math.floor(r() * 13 * 60);
  let day = addDays(date, -daysBefore);
  if (day > today) day = addDays(today, -(daysBefore % 6));
  return `${day}T${fromMin(m)}:00.000+08:00`;
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
  const pickRider = (r: () => number) =>
    r() < REGULAR_SHARE ? riders[Math.floor(r() * REGULARS)] : riders[REGULARS + Math.floor(r() * (riders.length - REGULARS))];
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
        const rider = pickRider(r);
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
          createdAt: stamp(date, source === "walkin" ? 0 : 1 + Math.floor(r() * 9), r, today),
        });
        n++;
      }
      if (r() < 0.05) {
        const rider = pickRider(r);
        bookings.push({
          id: `bk_${slot.id}_x`, ref: makeRef(r), kind: "pump", targetId: slot.id, date, start: slot.start, end: slot.end,
          riderId: rider.id, riderName: rider.name, phone: rider.phone, riders: 1, rentals: { bikes: {}, helmets: 0 },
          source: "website", status: "cancelled", payment: "refunded", attendance: "pending", priceHKD: prices.pumpPerRider,
          waiverSigned: true, createdAt: stamp(date, 4, r, today),
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
        const rider = pickRider(r);
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
          createdAt: stamp(date, 2 + Math.floor(r() * 12), r, today),
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
        const rider = pickRider(r);
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
          createdAt: stamp(e.date, 3 + Math.floor(r() * 20), r, today),
        });
      }
    }
  }

  // a casual rider can't have joined after their first booking
  const first = new Map<string, string>();
  for (const b of bookings) {
    const at = new Date(b.createdAt).toISOString();
    const seen = first.get(b.riderId);
    if (!seen || at < seen) first.set(b.riderId, at);
  }
  for (const rider of riders.slice(REGULARS)) {
    const at = first.get(rider.id);
    if (at && at < rider.createdAt) rider.createdAt = at;
  }

  return { seedDate: today, riders, bookings, events, blocks };
}
