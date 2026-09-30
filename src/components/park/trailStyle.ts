import type { Difficulty } from "@/types";

/** Dash pattern per difficulty so colour is never the only cue. */
export const difficultyDash: Record<Difficulty, string | undefined> = {
  beginner: undefined,
  intermediate: "12 7",
  advanced: "1 8",
};

export const CLOSED_DASH = "4 6";
export const CLOSED_COLOR = "#6b6f78";
