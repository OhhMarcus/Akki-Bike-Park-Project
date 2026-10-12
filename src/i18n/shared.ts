import type { Locale } from "@/types";

export const LOCALE_COOKIE = "akki-locale";
export const LOCALES: Locale[] = ["en", "zh"];
export const isLocale = (v: unknown): v is Locale => v === "en" || v === "zh";

/** Saved choice first, then the browser's language, then English. */
export function pickLocale(saved: string | undefined | null, acceptLanguage: string | undefined | null): Locale {
  if (isLocale(saved)) return saved;
  if (acceptLanguage && /^\s*zh/i.test(acceptLanguage)) return "zh";
  return "en";
}

export function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}
