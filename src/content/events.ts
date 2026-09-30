import type { EventType, LocalizedText, ParkEvent } from "@/types";
import { daysFromToday, addDays } from "@/lib/dates";

/**
 * DEMONSTRATION EVENTS. Fictional dates, capacity and organisers.
 * Real events: add them in Admin → Events (untick "Demo") or replace this file.
 * Only events with isDemo === false get structured data and countdowns.
 */
const L = (en: string, zh: string): LocalizedText => ({ en, zh });

const helmet = L("Certified cycling helmet (rental available)", "認可單車頭盔（可租借）");
const closedShoes = L("Closed-toe shoes", "包腳鞋");
const water = L("Water bottle and sun protection", "水樽及防曬用品");

type Def = {
  slug: string; type: EventType; offset: number; start: string; end: string; title: LocalizedText; summary: LocalizedText;
  level: ParkEvent["level"]; minAge: number; maxAge?: number; capacity: number; registered: number; price: number | null;
  featured?: boolean; equipment?: LocalizedText[];
};

const defs: Def[] = [
  { slug: "demo-community-race", type: "race", offset: 21, start: "09:00", end: "16:00", featured: true,
    title: L("Demo: Community Race Day", "示範：社區競賽日"), summary: L("A friendly timed race for every level.", "適合各級別車手的友好計時賽。"),
    level: "all", minAge: 12, capacity: 60, registered: 41, price: 220 },
  { slug: "demo-cornering-clinic", type: "clinic", offset: 6, start: "09:30", end: "12:00", title: L("Demo: Cornering Skills Clinic", "示範：過彎技術工作坊"), summary: L("Braking, body position and berms.", "煞車、身體姿勢與彎道。"),
    level: "intermediate", minAge: 12, capacity: 12, registered: 9, price: 380 },
  { slug: "demo-beginner-day", type: "beginner_day", offset: 9, start: "10:00", end: "13:00", title: L("Demo: Beginner Day", "示範：新手日"), summary: L("Your first ride, with coaches and gear on hand.", "有教練及裝備支援的首次騎行。"),
    level: "beginner", minAge: 8, capacity: 24, registered: 12, price: 200 },
  { slug: "demo-kids-camp", type: "kids_camp", offset: 14, start: "09:00", end: "16:00", title: L("Demo: Kids’ Bike Camp", "示範：兒童單車營"), summary: L("A full day of games, skills and confidence.", "全日遊戲、技巧與自信培養。"),
    level: "beginner", minAge: 7, maxAge: 12, capacity: 16, registered: 16, price: 680 },
  { slug: "demo-holiday-programme", type: "holiday", offset: 30, start: "09:00", end: "15:00", title: L("Demo: Holiday Progression Week", "示範：假期進階課程"), summary: L("Five mornings, one rider transformed.", "五個早上的技術躍進。"),
    level: "all", minAge: 10, capacity: 20, registered: 6, price: 1500 },
  { slug: "demo-sunday-community-ride", type: "community", offset: 3, start: "08:30", end: "11:30", title: L("Demo: Sunday Community Ride", "示範：週日社區騎行"), summary: L("Meet riders. Ride together. No pressure.", "認識車友，一起騎，無壓力。"),
    level: "all", minAge: 14, capacity: 30, registered: 14, price: 0 },
  { slug: "demo-brand-demo-day", type: "demo", offset: 17, start: "10:00", end: "17:00", title: L("Demo: Brand Demo Day", "示範：品牌試騎日"), summary: L("Try the latest bikes on the trails.", "在賽道試騎最新單車。"),
    level: "all", minAge: 16, capacity: 80, registered: 22, price: null },
  { slug: "demo-school-programme", type: "school", offset: 12, start: "09:00", end: "13:00", title: L("Demo: School Outdoor Programme", "示範：學校戶外活動"), summary: L("Structured sessions for school groups.", "為學校團體設計的結構化課堂。"),
    level: "beginner", minAge: 10, capacity: 40, registered: 18, price: null },
  { slug: "demo-corporate-team-ride", type: "corporate", offset: 24, start: "13:30", end: "17:00", title: L("Demo: Corporate Team Ride", "示範：企業團隊騎行"), summary: L("Team-building that gets everyone smiling.", "讓全隊笑起來的團隊建立活動。"),
    level: "beginner", minAge: 18, capacity: 30, registered: 0, price: null },
];

export function getSeedEvents(): ParkEvent[] {
  return defs.map((d) => ({
    id: `evt_${d.slug}`,
    slug: d.slug,
    type: d.type,
    title: d.title,
    summary: d.summary,
    description: L(
      `${d.summary.en} This is a demonstration event: dates, capacity and details are illustrative until AKKI confirms them.`,
      `${d.summary.zh}此為示範活動：日期、名額及詳情僅供參考，待 AKKI 確認。`,
    ),
    date: daysFromToday(d.offset),
    startTime: d.start,
    endTime: d.end,
    level: d.level,
    minAge: d.minAge,
    maxAge: d.maxAge,
    capacity: d.capacity,
    registered: d.registered,
    registrationDeadline: addDays(daysFromToday(d.offset), -2),
    priceHKD: d.price,
    schedule: [
      { time: d.start, item: L("Arrival, check-in and safety briefing", "抵達、報到及安全簡報") },
      { time: addMinutes(d.start, 45), item: L("Main activity", "主要活動") },
      { time: d.end, item: L("Wrap-up and group photo", "總結及大合照") },
    ],
    organizer: { name: L("Instructor / organiser: to be announced", "導師／主辦：待公布"), role: L("Placeholder — add real name and qualifications", "預留位置 — 請加入真實姓名及資歷") },
    requiredEquipment: d.equipment ?? [helmet, closedShoes, water],
    faq: [
      { q: L("What if it rains?", "下雨怎麼辦？"), a: L("Sessions may be adjusted or postponed for safety. Riders are notified by email and WhatsApp.", "為安全起見，課堂或會調整或延期，並以電郵及 WhatsApp 通知。") },
      { q: L("Can I bring my own bike?", "可以自備單車嗎？"), a: L("Yes. Rental bikes can be requested when you register.", "可以。報名時亦可申請租借單車。") },
    ],
    featured: d.featured,
    isDemo: true,
    published: true,
  }));
}

function addMinutes(t: string, m: number) {
  const [h, mm] = t.split(":").map(Number);
  const total = h * 60 + mm + m;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export const eventTypes: EventType[] = ["race", "clinic", "beginner_day", "kids_camp", "holiday", "community", "demo", "school", "corporate"];
