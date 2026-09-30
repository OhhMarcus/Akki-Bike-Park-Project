import { addOnPrices, getExperience } from "@/config/pricing";
import type { ParticipantInput, PromotionCode } from "@/types";
import { addDays, hkToday } from "./dates";

export type PriceLine = { key: string; label: { en: string; zh: string }; amount: number; qty: number };

export function calcPrice(opts: {
  experienceId: string;
  participants: ParticipantInput[];
  eventPrice?: number | null;
  promo?: PromotionCode | null;
}) {
  const exp = getExperience(opts.experienceId);
  const lines: PriceLine[] = [];
  const n = opts.participants.length;
  if (exp) {
    const unit = opts.experienceId === "event" ? (opts.eventPrice ?? 0) : exp.priceHKD;
    lines.push({ key: "base", label: exp.name, amount: unit, qty: n });
  }
  const rentals = opts.participants.filter((p) => p.bike === "rental").length;
  if (rentals) lines.push({ key: "rental", label: { en: "Bike rental", zh: "單車租借" }, amount: addOnPrices.rentalBike, qty: rentals });
  const helmets = opts.participants.filter((p) => p.equipment.helmet).length;
  if (helmets) lines.push({ key: "helmet", label: { en: "Helmet hire", zh: "頭盔租借" }, amount: addOnPrices.helmet, qty: helmets });
  const gloves = opts.participants.filter((p) => p.equipment.gloves).length;
  if (gloves) lines.push({ key: "gloves", label: { en: "Gloves hire", zh: "手套租借" }, amount: addOnPrices.gloves, qty: gloves });
  const pads = opts.participants.filter((p) => p.equipment.pads).length;
  if (pads) lines.push({ key: "pads", label: { en: "Protective pads hire", zh: "護具租借" }, amount: addOnPrices.pads, qty: pads });
  const coach = opts.participants.filter((p) => p.coachingAddOn).length;
  if (coach) lines.push({ key: "coach", label: { en: "Coaching add-on", zh: "教練加購" }, amount: addOnPrices.coaching, qty: coach });

  const subtotal = lines.reduce((s, l) => s + l.amount * l.qty, 0);
  const discount = opts.promo ? promoDiscount(opts.promo, subtotal) : 0;
  return { lines, subtotal, discount, total: Math.max(0, subtotal - discount) };
}

export function promoDiscount(p: PromotionCode, subtotal: number) {
  return Math.min(subtotal, p.kind === "percent" ? Math.round((subtotal * p.value) / 100) : p.value);
}

export function validatePromo(code: string, promos: PromotionCode[]): { ok: true; promo: PromotionCode } | { ok: false; reason: "invalid" | "expired" | "used" } {
  const c = code.trim().toUpperCase();
  const promo = promos.find((p) => p.code.toUpperCase() === c && p.active);
  if (!promo) return { ok: false, reason: "invalid" };
  if (promo.expiresOn && promo.expiresOn < hkToday()) return { ok: false, reason: "expired" };
  if (promo.usageLimit != null && promo.used >= promo.usageLimit) return { ok: false, reason: "used" };
  return { ok: true, promo };
}

export function isFreeCancellation(date: string, hours: number) {
  // Free cancellation if the booked date is at least `hours` away (date granularity)
  return date >= addDays(hkToday(), Math.ceil(hours / 24));
}
