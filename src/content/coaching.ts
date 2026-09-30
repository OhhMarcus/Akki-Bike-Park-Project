import type { CoachingProgramme, LocalizedText } from "@/types";

/** Programme copy is illustrative. Prices are DEMO placeholders; instructors are placeholders. */
const L = (en: string, zh: string): LocalizedText => ({ en, zh });
const ph = L("Instructor to be announced", "導師待公布");
const helmet = L("Helmet (rental available)", "頭盔（可租借）");
const bike = L("Bike (rental available)", "單車（可租借）");
const gloves = L("Gloves recommended", "建議佩戴手套");

export const coachingProgrammes: CoachingProgramme[] = [
  { id: "first-ride", icon: "Sprout", name: L("First Ride", "首次騎行"), summary: L("Balance, braking and confidence on gentle terrain.", "在平緩地形學習平衡、煞車與自信。"),
    level: "beginner", ageRange: L("8+", "8 歲或以上"), duration: L("90 min", "90 分鐘"), groupSize: L("Up to 6", "最多 6 人"), equipment: [helmet, bike],
    outcomes: [L("Ready position and balance", "準備姿勢與平衡"), L("Safe braking", "安全煞車"), L("Ride your first flowing section", "完成首段流暢賽道")],
    instructor: ph, priceHKD: 280, nextSessionOffsetDays: 2, experienceId: "beginner" },
  { id: "kids-skills", icon: "Smile", name: L("Kids’ Skills", "兒童技巧班"), summary: L("Playful drills that build real bike-handling skills.", "以遊戲形式建立真正的操控技巧。"),
    level: "beginner", ageRange: L("6–12", "6–12 歲"), duration: L("2 hr", "2 小時"), groupSize: L("Up to 6", "最多 6 人"), equipment: [helmet, bike, gloves],
    outcomes: [L("Confident starts and stops", "自信起步與停車"), L("Steering control", "轉向控制"), L("Trail etiquette", "賽道禮儀")],
    instructor: ph, priceHKD: 320, nextSessionOffsetDays: 3, experienceId: "kids" },
  { id: "pump-track", icon: "Waves", name: L("Pump Track Fundamentals", "Pump Track 基礎"), summary: L("Learn to generate speed without pedalling.", "學習不踏板也能加速。"),
    level: "beginner", ageRange: L("10+", "10 歲或以上"), duration: L("90 min", "90 分鐘"), groupSize: L("Up to 8", "最多 8 人"), equipment: [helmet, bike, gloves],
    outcomes: [L("Pumping technique", "Pumping 技巧"), L("Rolling through rollers and berms", "通過波浪及彎道"), L("Body-bike separation", "人車分離")],
    instructor: ph, priceHKD: 380, nextSessionOffsetDays: 5, experienceId: "coaching" },
  { id: "cornering-braking", icon: "CornerUpRight", name: L("Cornering & Braking", "過彎與煞車"), summary: L("Carry more speed with more control.", "更有控制地保持速度。"),
    level: "intermediate", ageRange: L("12+", "12 歲或以上"), duration: L("2 hr", "2 小時"), groupSize: L("Up to 6", "最多 6 人"), equipment: [helmet, bike, gloves],
    outcomes: [L("Line choice", "路線選擇"), L("Braking before the corner", "入彎前煞車"), L("Berm technique", "彎道技巧")],
    instructor: ph, priceHKD: 420, nextSessionOffsetDays: 6, experienceId: "coaching" },
  { id: "jump-progression", icon: "MoveUpRight", name: L("Jump Progression", "跳台進階"), summary: L("Step-by-step from rollers to your first jump.", "由小波浪一步步到首次跳躍。"),
    level: "intermediate", ageRange: L("14+", "14 歲或以上"), duration: L("2 hr", "2 小時"), groupSize: L("Up to 5", "最多 5 人"), equipment: [helmet, bike, gloves, L("Knee/elbow pads recommended", "建議佩戴護膝及護肘")],
    outcomes: [L("Manual and pop basics", "Manual 與起跳基礎"), L("Small-jump technique", "小跳台技巧"), L("Landing control", "著陸控制")],
    instructor: ph, priceHKD: 450, nextSessionOffsetDays: 8, experienceId: "coaching" },
  { id: "race-prep", icon: "Flag", name: L("Race Preparation", "比賽準備"), summary: L("Gate starts, race lines and pacing.", "閘門起步、比賽路線與節奏。"),
    level: "advanced", ageRange: L("14+", "14 歲或以上"), duration: L("3 hr", "3 小時"), groupSize: L("Up to 5", "最多 5 人"), equipment: [helmet, bike, L("Full protective kit", "全套護具")],
    outcomes: [L("Race-start technique", "比賽起步技巧"), L("Line optimisation", "路線優化"), L("Race-day routine", "賽事日流程")],
    instructor: ph, priceHKD: 520, nextSessionOffsetDays: 10, experienceId: "coaching" },
  { id: "private-coaching", icon: "UserRound", name: L("Private Coaching", "私人教練"), summary: L("One rider, one coach, your goals.", "一位車手、一位教練，圍繞你的目標。"),
    level: "all", ageRange: L("All ages", "不限年齡"), duration: L("60 min", "60 分鐘"), groupSize: L("1 rider", "1 人"), equipment: [helmet, bike],
    outcomes: [L("Personalised skills plan", "個人化技術計劃"), L("Video feedback (if available)", "影片回饋（如提供）"), L("Clear next steps", "明確下一步")],
    instructor: ph, priceHKD: 680, nextSessionOffsetDays: 1, experienceId: "coaching" },
  { id: "group-coaching", icon: "Users", name: L("Group Coaching", "小組教學"), summary: L("Coaching for friends, families and teams.", "為朋友、家庭及團隊設計。"),
    level: "all", ageRange: L("8+", "8 歲或以上"), duration: L("2 hr", "2 小時"), groupSize: L("4–10", "4–10 人"), equipment: [helmet, bike],
    outcomes: [L("Shared progression", "共同進步"), L("Tailored to the group’s level", "配合小組水平"), L("Fun, low-pressure format", "輕鬆有趣")],
    instructor: ph, priceHKD: 350, nextSessionOffsetDays: 4, experienceId: "private" },
];
