import manifest from "./imageManifest.json";
import type { ParkEvent } from "@/types";

/**
 * Photo lookup. Drop files into /public/images named after a slot below
 * (any of jpg, jpeg, png, webp, avif) and restart `npm run dev`
 * (or run `npm run images`). Missing slots keep the placeholder frame.
 */
const files = manifest as Record<string, string>;

export function img(slot: string): string | undefined {
  const f = files[slot.toLowerCase()];
  return f ? `/images/${f}` : undefined;
}

/** First existing photo among the candidates. */
export function firstImg(...slots: string[]): string | undefined {
  for (const s of slots) {
    const v = img(s);
    if (v) return v;
  }
  return undefined;
}

/** event-<slug> -> event-<type> (e.g. event-race) -> event-default */
export function eventImg(e: Pick<ParkEvent, "slug" | "type">): string | undefined {
  return firstImg(`event-${e.slug}`, `event-${e.type}`, "event-default");
}
