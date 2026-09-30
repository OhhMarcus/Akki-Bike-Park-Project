import type { MessageKey } from "@/i18n/dictionary";
import type { CoachingProgramme, Level } from "@/types";

export type AgeGroup = "child" | "pre" | "teen" | "adult";
export type RiderLevel = "new" | "regular" | "expert";
export type Goal = "basics" | "flow" | "control" | "jumps" | "race";
export type Format = "group" | "solo";
export type Answers = { age: AgeGroup; level: RiderLevel; goal: Goal; format: Format };

/** Representative age used to test each programme's age range. */
export const ageValue: Record<AgeGroup, number> = { child: 8, pre: 12, teen: 16, adult: 30 };
const levelRank: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };
const riderRank: Record<RiderLevel, number> = { new: 0, regular: 1, expert: 2 };

/** Keywords matched against programme text (English copy) to detect what each programme teaches. */
const goalPattern: Record<Goal, RegExp> = {
  basics: /first ride|balance|braking|confiden|kids/i,
  flow: /pump|flow|roller|berm/i,
  control: /corner|brak|line|control/i,
  jumps: /jump|pop|landing|drop/i,
  race: /race|gate|pacing/i,
};

export function parseAgeRange(text: string): [number, number] {
  const range = text.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (range) return [Number(range[1]), Number(range[2])];
  const min = text.match(/(\d+)\s*\+/);
  if (min) return [Number(min[1]), Infinity];
  return [0, Infinity];
}

export function maxGroup(text: string): number {
  const nums = text.match(/\d+/g)?.map(Number);
  return nums ? Math.max(...nums) : 1;
}

export type Recommendation = { programme: CoachingProgramme; score: number; reasons: MessageKey[] };

export function recommend(programmes: CoachingProgramme[], a: Answers): Recommendation[] {
  const age = ageValue[a.age];
  const out: Recommendation[] = [];
  programmes.forEach((p) => {
    const [lo, hi] = parseAgeRange(p.ageRange.en);
    if (age < lo || age > hi) return;
    let score = 0;
    const reasons: MessageKey[] = [];

    if (p.level === "all") {
      score += 1;
      reasons.push("coaching.quiz.reason.allLevels");
    } else {
      const diff = levelRank[p.level] - riderRank[a.level];
      if (diff === 0) {
        score += 4;
        reasons.push("coaching.quiz.reason.level");
      } else if (diff < 0) {
        score += diff === -1 ? 1 : 0;
        if (diff === -1) reasons.push("coaching.quiz.reason.levelBelow");
      } else score -= 4 * diff;
    }

    reasons.push("coaching.quiz.reason.age");
    score += 1;

    const re = goalPattern[a.goal];
    const headline = `${p.id} ${p.name.en}`;
    const detail = `${p.summary.en} ${p.outcomes.map((o) => o.en).join(" ")}`;
    if (re.test(headline)) {
      score += 3;
      reasons.push("coaching.quiz.reason.goal");
    } else if (re.test(detail)) {
      score += 1.5;
      reasons.push("coaching.quiz.reason.goal");
    }

    const solo = maxGroup(p.groupSize.en) === 1;
    if (a.format === "solo" ? solo : !solo) {
      score += a.format === "solo" ? 4 : 1;
      reasons.push(a.format === "solo" ? "coaching.quiz.reason.solo" : "coaching.quiz.reason.group");
    } else if (a.format === "group" && solo) score -= 1;

    out.push({ programme: p, score, reasons });
  });
  return out.sort((x, y) => y.score - x.score);
}
