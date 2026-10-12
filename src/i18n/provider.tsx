"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, LocalizedText } from "@/types";
import { dictionary, type MessageKey, type PluralKey } from "./dictionary";
import { createFormatters, type Formatters } from "./format";
import { LOCALE_COOKIE, interpolate } from "./shared";

type Vars = Record<string, string | number>;
type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  /** plural: picks `${key}.one` for 1 in English, otherwise `${key}.other`; {n} is filled in */
  tn: (key: PluralKey, n: number, vars?: Vars) => string;
  /** resolve a { en, zh } content object */
  l: (x: LocalizedText) => string;
  fmt: Formatters;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      localStorage.setItem(LOCALE_COOKIE, l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant-HK" : "en-HK";
  }, [locale]);

  const value = useMemo<Ctx>(() => {
    const t = (key: MessageKey, vars?: Vars) => {
      const entry = dictionary[key] as LocalizedText | undefined;
      return interpolate(entry ? entry[locale] : String(key), vars);
    };
    const tn = (key: PluralKey, n: number, vars?: Vars) => {
      const one = `${key}.one` as MessageKey;
      const k = n === 1 && locale === "en" && one in dictionary ? one : (`${key}.other` as MessageKey);
      return t(k, { n, ...vars });
    };
    return { locale, setLocale, t, tn, l: (x) => x[locale], fmt: createFormatters(locale, t) };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
