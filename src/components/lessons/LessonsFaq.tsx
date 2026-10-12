"use client";

import { site } from "@/config/site";
import { lessons } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import { waLink } from "@/lib/phone";
import { SectionTitle } from "@/components/brand/Headline";
import { Swap } from "@/components/brand/Swap";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { FAQ } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Short FAQ plus the "Klook or WhatsApp works too" note. */
export function LessonsFaq() {
  const { t, fmt } = useI18n();
  const items = [
    { q: t("lessons.faq.bring.q"), a: t("lessons.faq.bring.a") },
    { q: t("lessons.faq.age.q"), a: t("lessons.faq.age.a", { f: lessons.foundation.minAge, a: lessons.advanced.minAge }) },
    {
      q: t("lessons.faq.rent.q"),
      a: t("lessons.faq.rent.a", { bike: fmt.money(site.prices.bikeRental), helmet: fmt.money(site.prices.helmetRental) }),
    },
    { q: t("lessons.faq.rain.q"), a: t("lessons.faq.rain.a") },
    { q: t("lessons.faq.klook.q"), a: t("lessons.faq.klook.a") },
  ];

  return (
    <section className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <SectionTitle eyebrow={t("lessons.faq.eyebrow")} title={t("lessons.faq.title")} />
        <FAQ items={items} className="mt-6 border-t border-line" />
      </div>

      <div className="surface self-start p-5 sm:p-6 lg:mt-24">
        <p className="h3">{t("lessons.other.title")}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("lessons.other.body")}</p>
        <p className="mt-4 text-sm font-semibold">{t("lessons.other.klook")}</p>
        <a
          href={waLink(site.whatsapp.display, t("lessons.wa.prefill"))}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-6 w-full border-[#25D366]/50 text-[#5EDC8C] hover:border-[#25D366]")}
        >
          <WhatsAppIcon className="h-5 w-5" />
          {t("lessons.other.wa")}
        </a>
        <p className="mt-2 text-center text-xs text-muted tabular">
          {site.whatsapp.display}
          {site.whatsapp.placeholder && <Swap />}
        </p>
      </div>
    </section>
  );
}
