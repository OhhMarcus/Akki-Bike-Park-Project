"use client";

import { useI18n } from "@/i18n/provider";
import { generalFaq } from "@/content/faq";
import { FAQAccordion } from "@/components/ui/accordion";
import type { LocalizedText } from "@/types";

const L = (en: string, zh: string): LocalizedText => ({ en, zh });

const parkFaq: { q: LocalizedText; a: LocalizedText }[] = [
  { q: L("How do I know which trail suits me?", "如何知道哪條賽道適合我？"), a: L("Use the “Suitable for me?” helper above, or open a trail card for guidance. If unsure, start on beginner trails or book a coaching session.", "使用上方「適合我嗎？」，或展開賽道卡片查看建議。如未能確定，請由初級賽道開始或預約教練課堂。") },
  { q: L("Are trail details official?", "賽道資料是官方資料嗎？"), a: L("Not yet. Trail names, distances and the map are placeholders until AKKI supplies official information.", "尚未。賽道名稱、距離及地圖均為預留內容，待 AKKI 提供官方資料。") },
  { q: L("What are the age and supervision rules?", "年齡及看管規定是什麼？"), a: L("Riders under 18 need guardian consent and a signed waiver. Minimum age and supervision ratios are to be confirmed by AKKI.", "18 歲以下車手須有監護人同意及簽署免責聲明。最低年齡及看管比例待 AKKI 確認。") },
];

export function ParkFaq() {
  const { l } = useI18n();
  const items = [...parkFaq, ...generalFaq].map((f) => ({ q: l(f.q), a: l(f.a) }));
  return <FAQAccordion items={items} />;
}
