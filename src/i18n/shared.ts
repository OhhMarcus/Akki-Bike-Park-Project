import type { Locale } from "@/types";

export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_COOKIE = "akki-locale";
export const isLocale = (v: unknown): v is Locale => v === "en" || v === "zh";

export function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function formatMoney(n: number) {
  return `HK$${n.toLocaleString("en-HK")}`;
}

export function formatDate(iso: string, locale: Locale, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(`${iso}T00:00:00+08:00`);
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-HK" : "en-HK", {
    timeZone: "Asia/Hong_Kong",
    weekday: "short",
    month: "short",
    day: "numeric",
    ...opts,
  }).format(d);
}
