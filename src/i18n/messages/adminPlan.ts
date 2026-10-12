import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });
void m;

/** adminPlan strings (prefix "adminPlan."). English and Traditional Chinese (HK) side by side. */
export const adminPlanMessages = {
} satisfies Record<string, LocalizedText>;
