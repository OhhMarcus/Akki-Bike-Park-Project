"use client";

import { site } from "@/config/site";
import { lessons } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import { waLink } from "@/lib/phone";
import { Swap } from "@/components/brand/Swap";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { FAQ } from "@/components/ui/accordion";

const link = "inline-flex min-h-11 items-center gap-2 font-semibold text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-fg";

/** Practical questions. Answers that depend on AKKI's rules carry a Swap marker. */
export function VisitFaq({ className }: { className?: string }) {
  const { t, fmt } = useI18n();
  const items = [
    { q: t("visit.faq.wear.q"), a: t("visit.faq.wear.a") },
    {
      q: t("visit.faq.age.q"),
      a: (
        <>
          {t("visit.faq.age.a", { f: lessons.foundation.minAge, a: lessons.advanced.minAge })}
          <Swap />
        </>
      ),
    },
    {
      q: t("visit.faq.rent.q"),
      a: (
        <>
          {t("visit.faq.rent.a", { bike: fmt.money(site.prices.bikeRental), helmet: fmt.money(site.prices.helmetRental) })}
          {site.prices.placeholder && <Swap />}
        </>
      ),
    },
    {
      q: t("visit.faq.change.q"),
      a: (
        <>
          <span className="block">
            {t("visit.faq.change.a")}
            <Swap />
          </span>
          <a href={waLink(site.whatsapp.display, t("wa.prefill"))} target="_blank" rel="noopener noreferrer" className={link}>
            <WhatsAppIcon className="h-4 w-4" />
            {t("wa.label")}
            <span className="sr-only">{t("visit.newTab")}</span>
          </a>
        </>
      ),
    },
    { q: t("visit.faq.klook.q"), a: t("visit.faq.klook.a") },
    {
      q: t("visit.faq.night.q"),
      a: (
        <>
          {t("visit.faq.night.a")}
          <Swap />
        </>
      ),
    },
    {
      q: t("visit.faq.rain.q"),
      a: (
        <>
          <span className="block">{t("visit.faq.rain.a")}</span>
          <a href="#weather" className={link}>
            {t("visit.weather.eyebrow")}
          </a>
        </>
      ),
    },
  ];
  return <FAQ items={items} className={className} />;
}
