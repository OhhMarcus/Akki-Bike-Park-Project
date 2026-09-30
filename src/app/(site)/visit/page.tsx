import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getServerT } from "@/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Directions } from "@/components/visit/Directions";
import { ParkStatusCard, VisitInfo } from "@/components/visit/VisitInfo";
import { VisitChecklist } from "@/components/visit/VisitChecklist";
import { VisitFaq } from "@/components/visit/VisitFaq";
import { VisitMap } from "@/components/visit/VisitMap";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "Visit the Park", zh: "到訪樂園" },
    description: { en: "Getting to AKKI Bike Park, opening hours, park rules, closures and a checklist to plan your visit.", zh: "前往丫髻山地單車樂園的交通、開放時間、場地守則、關閉安排及到訪清單。" },
    path: "/visit",
  });
}

export default async function VisitPage() {
  const { t } = await getServerT();
  return (
    <>
      <section className="topo border-b border-graphite-800">
        <div className="container py-16 md:py-24">
          <p className="eyebrow">{t("visit.eyebrow")}</p>
          <h1 className="h-display mt-3">{t("visit.title")}</h1>
          <p className="mt-4 max-w-xl text-lg text-silver">{t("visit.lead")}</p>
        </div>
      </section>

      <div className="container space-y-16 py-12 md:space-y-20 md:py-20">
        <section aria-labelledby="find-h" className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 id="find-h" className="h-section mb-6">{t("visit.map.title")}</h2>
            <VisitMap />
          </div>
          <div className="lg:pt-[4.5rem]"><Directions /></div>
        </section>

        <section aria-label={t("visit.hours")}>
          <VisitInfo />
        </section>

        <section aria-label={t("visit.status.title")}>
          <ParkStatusCard />
        </section>

        <section aria-labelledby="visit-faq-h" className="mx-auto max-w-3xl">
          <h2 id="visit-faq-h" className="h-section mb-6">{t("visit.faq.title")}</h2>
          <VisitFaq />
        </section>

        <section aria-label={t("visit.check.title")}>
          <VisitChecklist />
        </section>

        <section aria-labelledby="visit-cta-h" className="surface flex flex-col items-start gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-10">
          <h2 id="visit-cta-h" className="h-section">{t("visit.cta.title")}</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/booking" className={buttonVariants({ size: "lg" })}>{t("cta.bookNow")}</Link>
            <WhatsAppButton size="lg" />
          </div>
        </section>
      </div>
    </>
  );
}
