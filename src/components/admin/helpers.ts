import { hkToday } from "@/lib/dates";
import type { BookingStatus } from "@/types";

export const bookingStatuses: BookingStatus[] = ["pending", "confirmed", "checked_in", "completed", "cancelled", "no_show"];

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
export const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export const digitsOnly = (v: string) => v.replace(/\D/g, "");

/** WhatsApp reply link for a rider's phone; falls back to mailto when no usable number. */
export function replyUrl(phone: string | undefined, email: string, text: string) {
  const d = digitsOnly(phone ?? "");
  if (d.length >= 8) return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
  return `mailto:${email}?body=${encodeURIComponent(text)}`;
}

export const csvName = (base: string) => `akki-${base}-${hkToday()}.csv`;

/** Parses a non-negative integer string; returns null when invalid. */
export function toInt(v: string): number | null {
  if (!/^\d+$/.test(v.trim())) return null;
  return Number.parseInt(v.trim(), 10);
}
