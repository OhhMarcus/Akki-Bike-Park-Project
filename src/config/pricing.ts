import type { Experience } from "@/types";

/**
 * DEMO PRICES ONLY. These are NOT AKKI's real prices.
 * Edit `priceHKD` here (or replace with a Supabase `experiences` table) before launch.
 */
export const experiences: Experience[] = [
  { id: "entry", icon: "Bike", level: "all", priceHKD: 120, pricingUnit: "person", minParticipants: 1, maxParticipants: 8, periods: ["morning", "afternoon", "fullday"],
    name: { en: "Park Entry", zh: "單車樂園入場" },
    blurb: { en: "Ride the park at your own pace.", zh: "以自己的節奏暢騎樂園。" } },
  { id: "beginner", icon: "Sprout", level: "beginner", priceHKD: 280, pricingUnit: "person", minParticipants: 1, maxParticipants: 6, periods: ["morning", "afternoon"],
    name: { en: "Beginner Experience", zh: "新手體驗" },
    blurb: { en: "Guided first ride with helmet and bike included.", zh: "教練帶領首次騎行，包含頭盔及單車。" } },
  { id: "coaching", icon: "Target", level: "all", priceHKD: 420, pricingUnit: "person", minParticipants: 1, maxParticipants: 6, periods: ["morning", "afternoon"],
    name: { en: "Coaching Session", zh: "教練課堂" },
    blurb: { en: "Small-group skills coaching.", zh: "小班技術教學。" } },
  { id: "kids", icon: "Smile", level: "beginner", priceHKD: 320, pricingUnit: "person", minParticipants: 1, maxParticipants: 6, periods: ["morning", "afternoon"],
    name: { en: "Kids’ Programme", zh: "兒童課程" },
    blurb: { en: "Confidence and control for young riders.", zh: "培養小車手的自信與控制力。" } },
  { id: "camp", icon: "Tent", level: "all", priceHKD: 780, pricingUnit: "person", minParticipants: 1, maxParticipants: 12, periods: ["fullday"],
    name: { en: "Bike Camp", zh: "單車營" },
    blurb: { en: "Full-day progression camp.", zh: "全日進階訓練營。" } },
  { id: "private", icon: "Users", level: "all", priceHKD: 200, pricingUnit: "person", minParticipants: 6, maxParticipants: 30, periods: ["morning", "afternoon", "fullday"],
    name: { en: "Private Group", zh: "私人團體" },
    blurb: { en: "Reserve the park for your group.", zh: "為你的團體預留場地。" } },
  { id: "school", icon: "GraduationCap", level: "all", priceHKD: 150, pricingUnit: "person", minParticipants: 10, maxParticipants: 40, periods: ["morning", "afternoon", "fullday"],
    name: { en: "School Booking", zh: "學校預約" },
    blurb: { en: "Curriculum-friendly outdoor sessions.", zh: "配合課程的戶外活動。" } },
  { id: "corporate", icon: "Briefcase", level: "all", priceHKD: 350, pricingUnit: "person", minParticipants: 8, maxParticipants: 40, periods: ["afternoon", "fullday"],
    name: { en: "Corporate Event", zh: "企業活動" },
    blurb: { en: "Team-building on two wheels.", zh: "兩個輪子上的團隊建立。" } },
  { id: "event", icon: "CalendarDays", level: "all", priceHKD: 0, pricingUnit: "person", minParticipants: 1, maxParticipants: 4, periods: ["morning", "afternoon", "fullday"],
    name: { en: "Event Registration", zh: "活動報名" },
    blurb: { en: "Register for a race, clinic or community ride.", zh: "報名比賽、工作坊或社區騎行。" } },
];

export const addOnPrices = {
  rentalBike: 150,
  helmet: 30,
  gloves: 20,
  pads: 40,
  coaching: 180,
} as const;

export const membershipTiers = [
  { id: "monthly", name: { en: "Monthly Rider", zh: "月費騎手" }, priceHKD: 480 },
  { id: "annual", name: { en: "Annual Rider", zh: "年度騎手" }, priceHKD: 3800 },
  { id: "family", name: { en: "Family Pass", zh: "家庭通行證" }, priceHKD: 6800 },
] as const;

export function getExperience(id: string) {
  return experiences.find((e) => e.id === id);
}
