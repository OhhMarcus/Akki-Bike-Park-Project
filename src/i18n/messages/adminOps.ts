import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** adminOps strings (prefix "adminOps."). English and Traditional Chinese (HK) side by side. */
export const adminOpsMessages = {
} satisfies Record<string, LocalizedText>;
