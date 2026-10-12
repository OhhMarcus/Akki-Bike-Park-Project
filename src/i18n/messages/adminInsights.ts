import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** adminInsights strings (prefix "adminInsights."). English and Traditional Chinese (HK) side by side. */
export const adminInsightsMessages = {
} satisfies Record<string, LocalizedText>;
