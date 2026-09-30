"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, LocalizedText } from "@/types";
import { dictionary, type MessageKey } from "./dictionary";
import { LOCALE_COOKIE, formatDate, formatMoney, interpolate } from "./shared";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  /** Resolve a { en, zh } object from content files */
  l: (x: LocalizedText) => string;
  date: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
  money: (n: number) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l === "zh" ? "zh-Hant-HK" : "en";
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant-HK" : "en";
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => interpolate(dictionary[key]?.[locale] ?? String(key), vars),
      l: (x) => x[locale],
      date: (iso, opts) => formatDate(iso, locale, opts),
      money: formatMoney,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
