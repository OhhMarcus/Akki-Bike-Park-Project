import type { MessageKey } from "@/i18n/dictionary";
import type { Formatters } from "@/i18n/format";
import type { EventType, ISODate, ParkEvent } from "@/types";
import type { eventSpots } from "@/lib/schedule";
import { parts } from "@/lib/time";

export type EventSpots = ReturnType<typeof eventSpots>;
export type EventFilter = EventType | "all";

export const EVENT_TYPES: EventType[] = ["race", "nightjam", "groupride", "kidscamp"];

/** Year + month (1–12), as MonthNav/MonthGrid expect. */
export type YM = { y: number; m: number };
export const ymOf = (iso: ISODate): YM => {
  const p = parts(iso);
  return { y: p.y, m: p.m };
};
/** Months since year 0, so months can be compared and stepped. */
export const ymIndex = ({ y, m }: YM) => y * 12 + (m - 1);
export const ymAt = (index: number): YM => ({ y: Math.floor(index / 12), m: (index % 12) + 1 });

/**
 * Event titles mix Chinese and Latin ("AKKI Pump Track 系列賽 · 第三站"): break at spaces and
 * punctuation rather than inside a Chinese word, and only split a long unspaced title as a last resort.
 */
export const titleWrap = "text-balance break-keep [overflow-wrap:anywhere]";

export const eventPath = (e: Pick<ParkEvent, "slug">) => `/events/${e.slug}`;
export const photoSlotFor = (e: Pick<ParkEvent, "photoSlot" | "type">) => e.photoSlot ?? `events-${e.type}`;

/** "Sat 24 Oct, 9:30am–5:00pm" · "10月24日（六）上午9:30–下午5:00" for sentences and labels. */
export const whenText = (
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
  fmt: Formatters,
  e: Pick<ParkEvent, "date" | "start" | "end">,
) => t("events.when", { date: fmt.dateWeekday(e.date), time: fmt.timeRange(e.start, e.end) });

/** Lowest and highest category price, or null when an event has no categories yet. */
export function priceSpan(e: Pick<ParkEvent, "categories">) {
  if (!e.categories.length) return null;
  const prices = e.categories.map((c) => c.priceHKD);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** A category's age range, unless its name already says it ("Ages 6–9" / "6–9"). */
export const agesNote = (name: string, ages: string) => (name.includes(ages) ? null : ages);

/** Body copy is stored as plain text; blank lines separate paragraphs. */
export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Split a translated template around one placeholder so each part can be styled. */
export function splitTemplate(template: (marker: string) => string) {
  const marker = "\u0000";
  const [before = "", after = ""] = template(marker).split(marker);
  return { before: before.trim(), after: after.trim() };
}
