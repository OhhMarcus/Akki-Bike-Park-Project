import type { ScheduleSettings } from "@/types";

/**
 * Default weekly schedule. PLACEHOLDER hours, session length and capacity.
 * Admin → Schedule edits a copy of this at runtime.
 * weekday: 0 = Sunday … 6 = Saturday.
 */
export const defaultSchedule: ScheduleSettings = {
  slotMinutes: 60,
  slotCapacity: 12,
  pumpHours: [
    { weekday: 0, open: true, start: "10:00", end: "20:00" },
    { weekday: 1, open: true, start: "16:00", end: "21:00" },
    { weekday: 2, open: true, start: "15:00", end: "21:00" },
    { weekday: 3, open: true, start: "15:00", end: "21:00" },
    { weekday: 4, open: true, start: "15:00", end: "21:00" },
    { weekday: 5, open: true, start: "15:00", end: "21:00" },
    { weekday: 6, open: true, start: "10:00", end: "20:00" },
  ],
  lessonTemplates: [
    { id: "tpl_sat_found", lessonId: "foundation", weekday: 6, start: "10:00", language: "yue", coachId: "coach_a", capacity: 8, active: true },
    { id: "tpl_sat_adv", lessonId: "advanced", weekday: 6, start: "14:00", language: "yue", coachId: "coach_b", capacity: 8, active: true },
    { id: "tpl_sun_found", lessonId: "foundation", weekday: 0, start: "10:00", language: "en", coachId: "coach_a", capacity: 8, active: true },
    { id: "tpl_sun_adv", lessonId: "advanced", weekday: 0, start: "14:00", language: "en", coachId: "coach_b", capacity: 8, active: true },
    { id: "tpl_wed_found", lessonId: "foundation", weekday: 3, start: "19:00", language: "yue", coachId: "coach_c", capacity: 8, active: true },
  ],
  updatedAt: "2026-01-01T00:00:00.000Z",
};
