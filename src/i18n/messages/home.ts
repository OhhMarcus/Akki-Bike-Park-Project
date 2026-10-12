import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** home strings (prefix "home."). English and Traditional Chinese (HK) side by side. */
export const homeMessages = {
} satisfies Record<string, LocalizedText>;
