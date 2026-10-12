import type { HHmm, ISODate, Locale } from "@/types";
import { diffDays, parts, toMin, weekdayOf } from "@/lib/time";
import type { MessageKey } from "./dictionary";

type T = (key: MessageKey, vars?: Record<string, string | number>) => string;

/**
 * Locale-aware formatting. Every word and pattern comes from the dictionary
 * (fmt.*, month.*, weekday.*), not from Intl, so AKKI can edit them.
 */
export function createFormatters(locale: Locale, t: T) {
  const two = (n: number) => String(n).padStart(2, "0");
  const monthName = (m: number) => t(`month.${m}` as MessageKey);
  const monthShort = (m: number) => t(`monthShort.${m}` as MessageKey);
  const weekday = (isoOrIndex: ISODate | number, style: "short" | "long" = "short") => {
    const i = typeof isoOrIndex === "number" ? isoOrIndex : weekdayOf(isoOrIndex);
    return t(`${style === "short" ? "weekday" : "weekdayLong"}.${i}` as MessageKey);
  };
  const dateVars = (iso: ISODate) => {
    const { y, m, d } = parts(iso);
    return { y, m, d, dd: two(d), mm: two(m), mon: monthShort(m), month: monthName(m), wd: weekday(iso), wdLong: weekday(iso, "long") };
  };

  const period = (min: number) => {
    const h = Math.floor(min / 60);
    if (h < 12) return "morning";
    if (h === 12) return "noon";
    return h < 18 ? "afternoon" : "evening";
  };
  const time = (hhmm: HHmm) => {
    const min = toMin(hhmm);
    const h24 = Math.floor(min / 60) % 24;
    const h = locale === "en" ? (h24 % 12 === 0 ? 12 : h24 % 12) : h24 > 12 ? h24 - 12 : h24;
    return t(`fmt.time.${period(min)}` as MessageKey, { h, mm: two(min % 60) });
  };

  return {
    /** 12/10/2026 · 2026年10月12日 */
    date: (iso: ISODate) => t("fmt.date", dateVars(iso)),
    /** 12 Oct · 10月12日 */
    dateShort: (iso: ISODate) => t("fmt.dateShort", dateVars(iso)),
    /** Mon 12 Oct · 10月12日（一） */
    dateWeekday: (iso: ISODate) => t("fmt.dateWeekday", dateVars(iso)),
    /** Monday 12 October 2026 · 2026年10月12日 星期一 */
    dateLong: (iso: ISODate) => t("fmt.dateLong", dateVars(iso)),
    /** October 2026 · 2026年10月 */
    monthYear: (y: number, m: number) => t("fmt.monthYear", { y, m, month: monthName(m) }),
    monthName,
    monthShort,
    weekday,
    /** 2:00pm · 下午2:00 */
    time,
    /** 2:00–3:00pm · 下午2:00–3:00 (shared am/pm or 上午/下午 shown once) */
    timeRange: (a: HHmm, b: HHmm) => {
      const bare = (x: HHmm) => t("fmt.time.bare", { h: locale === "en" ? ((Math.floor(toMin(x) / 60) % 12) || 12) : Math.floor(toMin(x) / 60) > 12 ? Math.floor(toMin(x) / 60) - 12 : Math.floor(toMin(x) / 60), mm: two(toMin(x) % 60) });
      if (locale === "en") {
        const sameHalf = toMin(a) < 720 === toMin(b) < 720;
        return t("fmt.timeRange", { a: sameHalf ? bare(a) : time(a), b: time(b) });
      }
      const samePeriod = period(toMin(a)) === period(toMin(b));
      return t("fmt.timeRange", { a: time(a), b: samePeriod ? bare(b) : time(b) });
    },
    /** Today / Tomorrow / Mon 12 Oct */
    relDay: (iso: ISODate, today: ISODate) => {
      const n = diffDays(today, iso);
      if (n === 0) return t("fmt.today");
      if (n === 1) return t("fmt.tomorrow");
      return t("fmt.dateWeekday", dateVars(iso));
    },
    /** HK$480 (0 → Free) */
    money: (n: number, opts?: { zeroAsFree?: boolean }) =>
      n === 0 && opts?.zeroAsFree !== false ? t("fmt.free") : t("fmt.money", { n: n.toLocaleString("en-HK") }),
    /** 2 hours · 2 小時 */
    duration: (min: number) => (min % 60 === 0 ? t("fmt.hours", { n: min / 60 }) : min > 60 ? t("fmt.hoursMinutes", { h: Math.floor(min / 60), m: min % 60 }) : t("fmt.minutes", { n: min })),
    temp: (c: number) => t("fmt.temp", { n: c }),
    number: (n: number) => n.toLocaleString("en-HK"),
    /** Split countdown parts; labels via t("fmt.cd.*") */
    countdown: (ms: number) => {
      const s = Math.max(0, Math.floor(ms / 1000));
      return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    },
  };
}

export type Formatters = ReturnType<typeof createFormatters>;
