import { emptyWaiver, type WaiverValue } from "@/components/booking/Waiver";
import type { BikeSize, Experience, ISODate, LessonId, Rentals, SlotStatus } from "@/types";

/** Lessons open for booking from today up to 4 weeks ahead (today + 27 days). */
export const BOOKING_WINDOW_DAYS = 28;

export const STEP_KEYS = ["class", "time", "rider", "waiver", "pay", "done"] as const;
type StepKey = (typeof STEP_KEYS)[number];
export const STEP = { class: 0, time: 1, rider: 2, waiver: 3, pay: 4, done: 5 } as const satisfies Record<StepKey, number>;

/** Basic age range accepted before the class minimum is checked. */
export const AGE_RANGE = { min: 4, max: 90 } as const;

export const EXPERIENCE: Experience[] = ["new", "some", "regular", "racer"];

export const isBookableDay = (state: SlotStatus | "none") => state === "available" || state === "almost";
export const isBookable = (s: { status: SlotStatus; past: boolean }) => !s.past && isBookableDay(s.status);

/** Everything the rider has entered. Lives for the whole flow so going back never loses anything. */
export type Draft = {
  lessonId: LessonId;
  /** buy a 5-class pack and use its first class on this booking */
  buyPack: boolean;
  date: ISODate | null;
  sessionId: string | null;
  name: string;
  phone: string;
  age: string;
  height: string;
  experience: Experience | null;
  rentBike: boolean;
  /** null = use the size suggested from the rider's height */
  bikeSize: BikeSize | null;
  rentHelmet: boolean;
  /** use a class from a pack already held on this phone number (when there is one) */
  usePack: boolean;
  waiver: WaiverValue;
};

export function initialDraft(lessonId: LessonId, buyPack: boolean, date: ISODate | null): Draft {
  return {
    lessonId,
    buyPack,
    date,
    sessionId: null,
    name: "",
    phone: "",
    age: "",
    height: "",
    experience: null,
    rentBike: false,
    bikeSize: null,
    rentHelmet: false,
    usePack: true,
    waiver: emptyWaiver,
  };
}

/** A fresh booking for the same rider: keeps who they are and what they hire, clears the slot and the waiver. */
export function anotherDraft(d: Draft): Draft {
  return { ...initialDraft(d.lessonId, false, d.date), name: d.name, phone: d.phone, age: d.age, height: d.height, experience: d.experience, rentBike: d.rentBike, bikeSize: d.bikeSize, rentHelmet: d.rentHelmet };
}

export function draftRentals(d: Pick<Draft, "rentBike" | "rentHelmet">, size: BikeSize | null): Rentals {
  return { bikes: d.rentBike && size ? { [size]: 1 } : {}, helmets: d.rentHelmet ? 1 : 0 };
}

/** "+852 9123 4567" → "9123 4567" for the +852 phone field. */
export function localPhone(display: string) {
  return display.replace(/^\+852\s*/, "");
}
