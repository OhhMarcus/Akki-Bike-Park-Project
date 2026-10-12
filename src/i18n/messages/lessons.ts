import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** lessons strings (prefix "lessons."). English and Traditional Chinese (HK) side by side. */
export const lessonsMessages = {
} satisfies Record<string, LocalizedText>;
