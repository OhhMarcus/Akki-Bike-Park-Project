import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** events strings (prefix "events."). English and Traditional Chinese (HK) side by side. */
export const eventsMessages = {
} satisfies Record<string, LocalizedText>;
