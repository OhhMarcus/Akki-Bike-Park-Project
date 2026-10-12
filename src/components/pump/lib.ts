import type { ISODate, ParkEvent, Rentals } from "@/types";
import type { SlotView } from "@/lib/schedule";
import { BIKE_SIZES, rentalBikeCount } from "@/lib/sizing";
import { overlaps, toMin } from "@/lib/time";

/** How far ahead riders can book online (today … today+13). */
export const WINDOW_DAYS = 14;
/** Biggest group the website takes in one booking; 7+ goes to WhatsApp. */
export const MAX_ONLINE = 6;

export const isBookable = (s: SlotView) => !s.past && (s.status === "available" || s.status === "almost");

export const isISODate = (s: string | null | undefined): s is ISODate => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

/** The published event behind an "event" closure: same date, overlapping time first. */
export function eventForSlot(slot: Pick<SlotView, "date" | "start" | "end">, events: ParkEvent[]): ParkEvent | undefined {
  const sameDay = events.filter((e) => e.date === slot.date);
  return (
    sameDay.find((e) => overlaps(toMin(slot.start), toMin(slot.end), toMin(e.start), toMin(e.end))) ??
    sameDay.find((e) => e.type === "race" || e.type === "kidscamp" || e.type === "nightjam") ??
    sameDay[0]
  );
}

/** Trim rentals so bikes and helmets never exceed the number of riders (largest sizes go first). */
export function fitRentals(r: Rentals, riders: number): Rentals {
  let over = rentalBikeCount(r) - riders;
  if (over <= 0 && r.helmets <= riders) return r;
  const bikes = { ...r.bikes };
  for (const size of [...BIKE_SIZES].reverse()) {
    if (over <= 0) break;
    const n = bikes[size] ?? 0;
    const cut = Math.min(n, over);
    if (!cut) continue;
    if (n - cut > 0) bikes[size] = n - cut;
    else delete bikes[size];
    over -= cut;
  }
  return { bikes, helmets: Math.min(r.helmets, riders) };
}

/** Put the selected date in the URL without a server round trip or scroll jump. */
export function writeDateToUrl(date: ISODate) {
  const url = new URL(window.location.href);
  if (url.searchParams.get("date") === date) return;
  url.searchParams.set("date", date);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}
