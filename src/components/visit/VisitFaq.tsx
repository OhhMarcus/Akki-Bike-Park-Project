"use client";

import { useI18n } from "@/i18n/provider";
import { FAQAccordion } from "@/components/ui/accordion";
import { generalFaq } from "@/content/faq";

export function VisitFaq() {
  const { t, l } = useI18n();
  const items = [
    ...([1, 2, 3] as const).map((n) => ({ q: t(`visit.faq.${n}.q`), a: t(`visit.faq.${n}.a`) })),
    ...generalFaq.map((f) => ({ q: l(f.q), a: l(f.a) })),
  ];
  return <FAQAccordion items={items} />;
}
