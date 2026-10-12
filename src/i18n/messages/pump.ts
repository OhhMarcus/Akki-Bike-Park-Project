import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** pump strings (prefix "pump."). English and Traditional Chinese (HK) side by side. */
export const pumpMessages = {
} satisfies Record<string, LocalizedText>;
