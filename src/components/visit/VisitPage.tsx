"use client";

import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { waLink } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/brand/Headline";
import { PageHero } from "@/components/brand/PageHero";
import { PatternDivider } from "@/components/brand/Pattern";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";
import { HoursList } from "@/components/layout/HoursList";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { GettingThere } from "./GettingThere";
import { LiveStatus } from "./LiveStatus";
import { MapPanel } from "./MapPanel";
import { VisitFaq } from "./VisitFaq";
import { WeatherPolicy } from "./WeatherPolicy";

/** Title left, content right on desktop; stacked on phones. */
const split = "container grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14";
const side = "lg:sticky lg:top-24 lg:self-start";

export function VisitPage() {
  const { t, l } = useI18n();
  return (
    <>
      <PageHero
        eyebrow={t("nav.visit")}
        title={t("visit.hero.title")}
        lead={t("visit.hero.lead")}
        actions={
          <div className="space-y-2.5">
            <p className="eyebrow">{t("visit.live.label")}</p>
            <LiveStatus />
          </div>
        }
        aside={
          <Photo
            slot="visit"
            alt={t("visit.hero.alt")}
            what={t("visit.hero.what")}
            fade="edges"
            priority
            sizes="(min-width: 1024px) 420px, 100vw"
            className="hidden aspect-[4/3] w-full border border-line sm:block"
          />
        }
      />

      {/* map, address, hours */}
      <section className="container pb-14 pt-14 sm:pb-16 sm:pt-20">
        <SectionTitle eyebrow={t("label.location")} title={t("visit.map.title")} brush={false} />
        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <MapPanel className="min-h-[340px] sm:min-h-[420px]" />
          <div className="surface flex flex-col divide-y divide-line">
            <div className="p-5">
              <p className="eyebrow">{t("visit.address")}</p>
              <p className="mt-2 text-lg font-semibold">
                {l(site.location.address)}
                {site.location.placeholder && <Swap />}
              </p>
              <p className="mt-0.5 text-sm text-muted">{l(site.location.area)}</p>
            </div>
            <div className="p-5">
              <p className="eyebrow">
                {t("hours.title")}
                <Swap />
              </p>
              <HoursList className="mt-3" />
            </div>
            <div className="mt-auto p-5">
              <p className="text-sm text-muted">{t("visit.questions")}</p>
              <a
                href={waLink(site.whatsapp.display, t("wa.prefill"))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex min-h-11 items-center gap-2 font-semibold hover:underline hover:decoration-fg/40 hover:underline-offset-4"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t("wa.label")}
                <span className="tabular text-muted">{site.whatsapp.display}</span>
                <span className="sr-only">{t("visit.newTab")}</span>
              </a>
              {site.whatsapp.placeholder && <Swap />}
            </div>
          </div>
        </div>
      </section>

      {/* getting here */}
      <section id="getting-here" className={cn(split, "scroll-mt-20 py-14 sm:py-16")}>
        <div className={side}>
          <SectionTitle eyebrow={t("visit.go.eyebrow")} title={t("visit.go.title")} lead={t("visit.go.lead")} />
        </div>
        <GettingThere />
      </section>

      {/* FAQ */}
      <section id="faq" className={cn(split, "scroll-mt-20 py-14 sm:py-16")}>
        <div className={side}>
          <SectionTitle eyebrow={t("visit.faq.eyebrow")} title={t("visit.faq.title")} brush={false} />
        </div>
        <VisitFaq className="-mt-4" />
      </section>

      <PatternDivider className="mt-4" />

      {/* weather policy */}
      <section id="weather" className="container scroll-mt-20 pb-4 pt-14 sm:pt-20">
        <WeatherPolicy />
      </section>
    </>
  );
}
