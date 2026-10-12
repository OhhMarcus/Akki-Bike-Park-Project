import { cookies, headers } from "next/headers";
import type { Locale, LocalizedText } from "@/types";
import { dictionary, type MessageKey } from "./dictionary";
import { createFormatters } from "./format";
import { LOCALE_COOKIE, interpolate, pickLocale } from "./shared";

export async function getServerLocale(): Promise<Locale> {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return pickLocale(c.get(LOCALE_COOKIE)?.value, h.get("accept-language"));
}

export async function getServerT() {
  const locale = await getServerLocale();
  const t = (key: MessageKey, vars?: Record<string, string | number>) => interpolate((dictionary[key] as LocalizedText)[locale], vars);
  return { locale, t, l: (x: LocalizedText) => x[locale], fmt: createFormatters(locale, t) };
}
