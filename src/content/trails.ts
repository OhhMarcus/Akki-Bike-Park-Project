import type { Difficulty, LocalizedText } from "@/types";

/**
 * Feature TYPES come from AKKI's public description (tabletops, pump features, berms, drops,
 * rock gardens, teaching areas, covered pump track). Difficulty grades, distances, ride times
 * and map positions are still PLACEHOLDERS: AKKI has not published a track list or map.
 * PLACEHOLDER trail & facility data. Names, distances and ride times are NOT
 * official. Replace with AKKI's real information (or a Supabase `trails` table).
 * `map` coordinates place each item on the stylised SVG map (viewBox 0 0 600 380).
 */
const L = (en: string, zh: string): LocalizedText => ({ en, zh });

export type Trail = {
  id: string;
  kind: "trail" | "facility";
  name: LocalizedText;
  difficulty: Difficulty;
  distance: LocalizedText;
  rideTime: LocalizedText;
  skills: LocalizedText[];
  features: ("rollers" | "berms" | "jumps" | "drops" | "pump")[];
  open: boolean;
  safety: LocalizedText;
  suitable: LocalizedText;
  /** SVG path in the 600x380 map */
  path: string;
  label: { x: number; y: number };
};

export const trails: Trail[] = [
  { id: "t1", kind: "facility", name: L("Balance-bike & Teaching Area", "平衡車及教學區"), difficulty: "beginner", distance: L("— (placeholder)", "—（預留）"), rideTime: L("15–30 min (placeholder)", "15–30 分鐘（預留）"),
    skills: [L("Balance", "平衡"), L("Braking", "煞車")], features: ["rollers"], open: true,
    safety: L("Ride in one direction. Keep clear of the entry.", "單向騎行，保持入口暢通。"), suitable: L("Perfect for your first ride and warm-ups.", "適合首次騎行及熱身。"),
    path: "M70 300 C110 260 170 330 220 290", label: { x: 70, y: 322 } },
  { id: "t2", kind: "facility", name: L("Covered Pump Track", "有蓋 Pump Track"), difficulty: "beginner", distance: L("— (placeholder)", "—（預留）"), rideTime: L("Laps, 20+ min (placeholder)", "循環騎行 20 分鐘以上（預留）"),
    skills: [L("Pumping", "Pumping"), L("Body position", "身體姿勢")], features: ["pump", "berms", "rollers"], open: true,
    safety: L("Let faster riders pass. Look ahead, not down.", "讓較快車手先行，向前看而非向下看。"), suitable: L("Great for all levels and a coaching favourite.", "適合各級別，也是教學常用場地。"),
    path: "M330 290 C310 250 380 240 400 275 C420 310 360 330 330 290", label: { x: 340, y: 340 } },
  { id: "t3", kind: "trail", name: L("Berm & Roller Section", "彎道及波浪段"), difficulty: "beginner", distance: L("— (placeholder)", "—（預留）"), rideTime: L("— (placeholder)", "—（預留）"),
    skills: [L("Cornering basics", "基本過彎"), L("Speed control", "速度控制")], features: ["rollers", "berms"], open: true,
    safety: L("Check the trail is clear before dropping in.", "出發前確認賽道暢通。"), suitable: L("If you can ride and brake comfortably, start here.", "若能舒適騎行及煞車，可由此開始。"),
    path: "M90 120 C150 60 220 150 290 100 C340 65 400 120 460 90", label: { x: 90, y: 100 } },
  { id: "t4", kind: "trail", name: L("Rock Garden", "石陣區"), difficulty: "intermediate", distance: L("— (placeholder)", "—（預留）"), rideTime: L("— (placeholder)", "—（預留）"),
    skills: [L("Line choice", "路線選擇"), L("Brake modulation", "煞車控制")], features: ["berms", "drops"], open: true,
    safety: L("Loose surfaces are possible. Protective gear strongly recommended.", "路面可能鬆散，強烈建議穿戴護具。"), suitable: L("You should be comfortable on the berm and roller section first.", "建議先熟習彎道及波浪段。"),
    path: "M470 90 C500 150 440 190 480 240 C505 270 540 250 550 300", label: { x: 490, y: 70 } },
  { id: "t5", kind: "trail", name: L("Tabletop Jump Line", "跳台路線"), difficulty: "intermediate", distance: L("— (placeholder)", "—（預留）"), rideTime: L("— (placeholder)", "—（預留）"),
    skills: [L("Pop and landing", "起跳與著陸"), L("Commitment", "決心與判斷")], features: ["jumps", "berms"], open: true,
    safety: L("Roll the jumps before you send them. One rider at a time.", "先滾過再跳，一次一人。"), suitable: L("Take the Jump Progression session before your first run.", "首次前建議先上跳台進階課。"),
    path: "M150 220 L230 200 L300 215 L370 190 L440 205", label: { x: 150, y: 245 } },
  { id: "t6", kind: "trail", name: L("Drop-off Section", "落差區"), difficulty: "advanced", distance: L("— (placeholder)", "—（預留）"), rideTime: L("— (placeholder)", "—（預留）"),
    skills: [L("Drop technique", "落差技巧"), L("Advanced braking", "進階煞車")], features: ["drops", "jumps"], open: false,
    safety: L("Inspect first. Full protective kit required.", "先觀察，須穿戴全套護具。"), suitable: L("For experienced riders who have coach clearance.", "適合經教練評估的資深車手。"),
    path: "M240 60 C260 100 230 130 270 170", label: { x: 200, y: 50 } },
];

export const difficultyColors: Record<Difficulty, string> = {
  beginner: "#5fb37c",
  intermediate: "#5b9bd5",
  advanced: "#e8e6e1",
};
