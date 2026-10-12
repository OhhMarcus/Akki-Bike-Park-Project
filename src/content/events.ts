import type { EventCategory, ISODate, LocalizedText, ParkEvent } from "@/types";
import { addDays, weekdayOf } from "@/lib/time";

/**
 * SAMPLE events, dated relative to today so the demo always looks current.
 * Names, categories, capacities and prices are illustrative placeholders.
 */
const L = (en: string, zh: string): LocalizedText => ({ en, zh });

function nextWeekday(from: ISODate, weekday: number, minOffset: number) {
  let d = addDays(from, minOffset);
  while (weekdayOf(d) !== weekday) d = addDays(d, 1);
  return d;
}

const raceCategories = (prefix: string): EventCategory[] => [
  { id: `${prefix}-u10`, name: L("Kids U10", "兒童 U10"), ages: L("Ages 6–9", "6–9 歲"), capacity: 16, priceHKD: 150 },
  { id: `${prefix}-u16`, name: L("Youth U16", "青少年 U16"), ages: L("Ages 10–15", "10–15 歲"), capacity: 24, priceHKD: 200 },
  { id: `${prefix}-open`, name: L("Open", "公開組"), ages: L("16+", "16 歲或以上"), capacity: 32, priceHKD: 280 },
  { id: `${prefix}-women`, name: L("Women Open", "女子公開組"), ages: L("16+", "16 歲或以上"), capacity: 16, priceHKD: 280 },
  { id: `${prefix}-masters`, name: L("Masters 40+", "元老組 40+"), ages: L("40+", "40 歲或以上"), capacity: 16, priceHKD: 280 },
];

const raceBody = L(
  "Two timed laps on the pump track, best lap counts. Practice in the morning, finals after lunch, podiums at the end. Points go toward the AKKI series table.\n\nHelmet and gloves are a must. Full-finger gloves, closed shoes. Rental bikes are limited on race day, so book early.",
  "Pump Track 計時賽，每人兩圈，取最快一圈。朝早練習，午飯後決賽，最後頒獎。積分計入 AKKI 系列賽排名。\n\n一定要戴頭盔同手套（全指手套），着包頭鞋。比賽日租車數量有限，請早啲預約。",
);

export function seedEvents(today: ISODate): ParkEvent[] {
  const created = `${addDays(today, -30)}T02:00:00.000Z`;
  return [
    {
      id: "evt_nightjam_1",
      slug: "friday-night-jam",
      type: "nightjam",
      title: L("Friday Night Jam", "星期五夜 Jam"),
      summary: L("Lights on, music up. Session the pump track with the crew till late.", "開燈、開音樂，同班 crew 踩到夜。"),
      body: L(
        "The pump track and jump line stay open after dark. All levels welcome: ride your own line and look out for each other.\n\nRental bikes available, book ahead. Bring a front light if you have one.",
        "Pump Track 同跳台夜晚照開，乜嘢程度都歡迎，踩自己條線，互相照應。\n\n有單車租，記得預先預約。有前燈就帶埋嚟。",
      ),
      date: nextWeekday(today, 5, 2),
      start: "19:30",
      end: "22:00",
      categories: [{ id: "nj1-all", name: L("All riders", "所有車手"), ages: L("12+", "12 歲或以上"), capacity: 40, priceHKD: 80 }],
      published: true,
      photoSlot: "events-nightjam",
      createdAt: created,
    },
    {
      id: "evt_groupride_1",
      slug: "sunday-trail-ride",
      type: "groupride",
      title: L("Sunday Trail Ride", "星期日山徑團"),
      summary: L("Meet at the park, roll out to the trails next door. Two groups, no one gets dropped.", "喺樂園集合，一齊出發去隔籬山徑。分兩組，冇人會被甩低。"),
      body: L(
        "Chill loop for newer riders, fast loop for those who want to push. Ride leaders on both. We regroup at every junction.\n\nBring water, a snack and a working bike. Trail shoes recommended.",
        "輕鬆組適合新手，快組畀想踩快啲嘅朋友。兩組都有領隊，每個路口都會等齊人。\n\n帶水、小食同狀態良好嘅單車。建議着越野鞋。",
      ),
      date: nextWeekday(today, 0, 5),
      start: "08:00",
      end: "11:00",
      categories: [
        { id: "gr1-chill", name: L("Chill loop", "輕鬆組"), ages: L("12+", "12 歲或以上"), capacity: 20, priceHKD: 0 },
        { id: "gr1-fast", name: L("Fast loop", "快組"), ages: L("16+", "16 歲或以上"), capacity: 15, priceHKD: 0 },
      ],
      published: true,
      photoSlot: "events-groupride",
      createdAt: created,
    },
    {
      id: "evt_race_r3",
      slug: "pump-track-series-round-3",
      type: "race",
      title: L("AKKI Pump Track Series · Round 3", "AKKI Pump Track 系列賽 · 第三站"),
      summary: L("Timed laps, big crowd, bigger cheers. Points count toward the series.", "計時賽，觀眾多，打氣聲更大。積分計入全年系列賽。"),
      body: raceBody,
      date: nextWeekday(today, 6, 11),
      start: "09:30",
      end: "17:00",
      categories: raceCategories("r3"),
      published: true,
      photoSlot: "events-race",
      createdAt: created,
    },
    {
      id: "evt_kidscamp_1",
      slug: "kids-skills-camp",
      type: "kidscamp",
      title: L("Kids Skills Camp", "小朋友技術營"),
      summary: L("A full day of games, drills and pump track laps. Small groups, patient coaches.", "成日玩遊戲、練技術、踩 Pump Track。小組教學，教練好有耐性。"),
      body: L(
        "Balance games in the morning, skills stations and pump track laps after lunch. Grouped by age and level.\n\nBikes and helmets available to rent. Pack lunch, water and sunscreen. Parents are welcome to stay and watch.",
        "朝早玩平衡遊戲，午飯後分站練技術同踩 Pump Track。按年齡同程度分組。\n\n可以租單車同頭盔。請帶午餐、水同防曬。家長可以留低睇。",
      ),
      date: nextWeekday(today, 0, 13),
      start: "09:30",
      end: "15:30",
      categories: [
        { id: "kc1-6", name: L("Ages 6–9", "6–9 歲"), ages: L("6–9", "6–9 歲"), capacity: 12, priceHKD: 680 },
        { id: "kc1-10", name: L("Ages 10–13", "10–13 歲"), ages: L("10–13", "10–13 歲"), capacity: 12, priceHKD: 680 },
      ],
      published: true,
      photoSlot: "events-kidscamp",
      createdAt: created,
    },
    {
      id: "evt_race_r4",
      slug: "pump-track-series-round-4",
      type: "race",
      title: L("AKKI Pump Track Series · Round 4", "AKKI Pump Track 系列賽 · 第四站"),
      summary: L("Series decider. Last chance for points before the finals.", "決勝站，總決賽前最後一次儲分機會。"),
      body: raceBody,
      date: nextWeekday(today, 6, 25),
      start: "09:30",
      end: "17:00",
      categories: raceCategories("r4"),
      published: true,
      photoSlot: "events-race",
      createdAt: created,
    },
  ];
}

/** How many places each sample category already has (keeps the demo believable). */
export const seedRegistrations: Record<string, number> = {
  "nj1-all": 23,
  "gr1-chill": 11,
  "gr1-fast": 15,
  "r3-u10": 13,
  "r3-u16": 21,
  "r3-open": 32,
  "r3-women": 9,
  "r3-masters": 6,
  "kc1-6": 12,
  "kc1-10": 8,
  "r4-u10": 3,
  "r4-u16": 6,
  "r4-open": 11,
  "r4-women": 2,
  "r4-masters": 4,
};
