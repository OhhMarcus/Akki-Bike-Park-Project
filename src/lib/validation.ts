import type { MessageKey } from "@/i18n/dictionary";
import { normalizeHKPhone } from "./phone";

/** Tiny validators returning a dictionary key (or undefined when fine). */
export const validate = {
  name: (s: string): MessageKey | undefined => (s.trim().length >= 2 ? undefined : "val.name"),
  phone: (s: string): MessageKey | undefined => (normalizeHKPhone(s) ? undefined : "val.phone"),
  email: (s: string, optional = false): MessageKey | undefined => {
    if (!s.trim()) return optional ? undefined : "val.required";
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim()) ? undefined : "val.email";
  },
  age: (v: string | number, min = 4, max = 90): MessageKey | undefined => {
    const n = Number(v);
    return Number.isInteger(n) && n >= min && n <= max ? undefined : "val.age";
  },
  height: (v: string | number): MessageKey | undefined => {
    const n = Number(v);
    return n >= 100 && n <= 220 ? undefined : "val.height";
  },
};

export function hasErrors(e: Record<string, unknown>) {
  return Object.values(e).some(Boolean);
}
