import { cookies } from "next/headers";
import type { Locale, LocalizedText } from "@/types";
import { dictionary, type MessageKey } from "./dictionary";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "./shared";

export async function getServerLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export async function getServerT() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: MessageKey) => dictionary[key][locale],
    l: (x: LocalizedText) => x[locale],
  };
}
