import { lessons } from "@/content/catalogue";
import { dictionary } from "@/i18n/dictionary";
import type { Booking, LocalizedText, ParkEvent } from "@/types";
import { parseTargetId } from "./schedule";

/** Human title for any booking: lesson name, "Pump Track session" or the event title. */
export function bookingTitle(b: Pick<Booking, "kind" | "targetId">, events: ParkEvent[]): LocalizedText {
  if (b.kind === "lesson") {
    const ref = parseTargetId(b.targetId);
    if (ref?.kind === "lesson") return lessons[ref.lessonId].name;
  }
  if (b.kind === "event") {
    const e = events.find((x) => x.id === b.targetId);
    if (e) return e.title;
  }
  return dictionary["book.line.pump"];
}
