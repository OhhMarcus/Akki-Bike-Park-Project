import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** club strings (prefix "club."). English and Traditional Chinese (HK) side by side. */
export const clubMessages = {
} satisfies Record<string, LocalizedText>;
