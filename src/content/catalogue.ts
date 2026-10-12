import { site } from "@/config/site";
import type { ClassPack, Coach, Lesson, LessonId } from "@/types";

const L = (en: string, zh: string) => ({ en, zh });

/** Lessons: facts from AKKI (2 hours, small groups, English + Cantonese). Copy is ours. */
export const lessons: Record<LessonId, Lesson> = {
  foundation: {
    id: "foundation",
    level: "beginner",
    name: L("Foundation Class", "基礎班"),
    summary: L(
      "Never ridden off-road? Start here. Brakes, body position and your first laps of the pump track.",
      "未試過越野？由呢度開始。煞車、身體姿勢，再踩你人生第一圈 Pump Track。",
    ),
    learn: [
      L("Ready position and balance", "預備姿勢同平衡"),
      L("Braking that actually stops you", "真正停得穩嘅煞車"),
      L("Cornering on berms", "彎道入門"),
      L("Rolling small features", "輕鬆過細障礙"),
    ],
    durationMin: 120,
    capacity: 8,
    minAge: 8,
    priceHKD: site.prices.lesson.foundation,
  },
  advanced: {
    id: "advanced",
    level: "advanced",
    name: L("Advanced Class", "進階班"),
    summary: L(
      "Got the basics? Pump for speed, lift the front, and start sending the jumps.",
      "基本功有晒？學識 pump 加速、拉頭，開始玩跳台。",
    ),
    learn: [
      L("Pumping for free speed", "用 pump 加速唔使踩"),
      L("Manuals and bunny hops", "Manual 同 bunny hop"),
      L("Tabletop jump technique", "跳台技巧"),
      L("Drops and line choice", "落差同揀線"),
    ],
    durationMin: 120,
    capacity: 8,
    minAge: 10,
    priceHKD: site.prices.lesson.advanced,
  },
};

export const lessonList: Lesson[] = [lessons.foundation, lessons.advanced];

export const pack5: ClassPack = {
  id: "pack5",
  classes: 5,
  validityDays: 180,
  priceHKD: { foundation: site.prices.pack5.foundation, advanced: site.prices.pack5.advanced },
};

/** PLACEHOLDER coaches: names, roles and photos to be supplied by AKKI. */
export const coaches: Coach[] = [
  { id: "coach_a", name: L("Coach A", "教練 A"), role: L("Head coach · Foundation", "總教練 · 基礎班"), languages: ["yue", "en"], photoSlot: "coach-a" },
  { id: "coach_b", name: L("Coach B", "教練 B"), role: L("Advanced & jumps", "進階班 · 跳台"), languages: ["en", "yue"], photoSlot: "coach-b" },
  { id: "coach_c", name: L("Coach C", "教練 C"), role: L("Kids & pump track", "小朋友班 · Pump Track"), languages: ["yue"], photoSlot: "coach-c" },
];

export function coachById(id: string) {
  return coaches.find((c) => c.id === id);
}
