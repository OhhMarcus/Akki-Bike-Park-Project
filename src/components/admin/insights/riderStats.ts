import type { Booking, BookingSource, ISODate, LessonId, PackHolding, Rider } from "@/types";
import { addDays, hkNow, toMin, type HKNow } from "@/lib/time";
import { SOURCES } from "./metrics";

export type RiderRow = {
  rider: Rider;
  /** attended bookings */
  visits: number;
  lastVisit: ISODate | null;
  /** confirmed bookings not finished yet, soonest first */
  upcoming: Booking[];
  /** bookings that have finished (any status), newest first */
  past: Booking[];
  sources: BookingSource[];
  /** classes left on valid packs, per class type */
  packsLeft: Record<LessonId, number>;
  joined: ISODate | null;
  isNew: boolean;
};

export const packUsable = (p: PackHolding, today: ISODate) => p.remaining > 0 && p.expiresOn >= today;

function packsLeft(rider: Rider, today: ISODate): Record<LessonId, number> {
  const left: Record<LessonId, number> = { foundation: 0, advanced: 0 };
  for (const p of rider.packs) if (packUsable(p, today)) left[p.lessonId] += p.remaining;
  return left;
}

const finished = (b: Booking, now: HKNow) => b.date < now.date || (b.date === now.date && toMin(b.end) <= now.minutes);

function joinedOn(createdAt: string): ISODate | null {
  const ms = Date.parse(createdAt);
  return Number.isFinite(ms) ? hkNow(ms).date : null;
}

/** One row per rider with everything the list and the profile sheet show. */
export function riderRows(riders: Rider[], bookings: Booking[], now: HKNow): RiderRow[] {
  const byRider = new Map<string, Booking[]>();
  for (const b of bookings) {
    const list = byRider.get(b.riderId);
    if (list) list.push(b);
    else byRider.set(b.riderId, [b]);
  }
  const newSince = addDays(now.date, -30);
  return riders.map((rider) => {
    const list = byRider.get(rider.id) ?? [];
    let visits = 0;
    let lastVisit: ISODate | null = null;
    const used = new Set<BookingSource>();
    const upcoming: Booking[] = [];
    const past: Booking[] = [];
    for (const b of list) {
      used.add(b.source);
      if (b.status === "confirmed" && b.attendance === "attended") {
        visits += 1;
        if (!lastVisit || b.date > lastVisit) lastVisit = b.date;
      }
      if (finished(b, now)) past.push(b);
      else if (b.status === "confirmed") upcoming.push(b);
    }
    past.sort((a, z) => (z.date + z.start).localeCompare(a.date + a.start));
    upcoming.sort((a, z) => (a.date + a.start).localeCompare(z.date + z.start));
    const joined = joinedOn(rider.createdAt);
    return {
      rider,
      visits,
      lastVisit,
      upcoming,
      past,
      sources: SOURCES.filter((s) => used.has(s)),
      packsLeft: packsLeft(rider, now.date),
      joined,
      isNew: !!joined && joined >= newSince,
    };
  });
}
