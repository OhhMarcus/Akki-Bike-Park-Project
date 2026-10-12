import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** visit strings (prefix "visit."). English and Traditional Chinese (HK) side by side. */
export const visitMessages = {
} satisfies Record<string, LocalizedText>;
