import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getServerT } from "@/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ParkExplorer } from "@/components/park/ParkExplorer";
import { ParkFacts } from "@/components/park/ParkFacts";
import { ParkInfo } from "@/components/park/ParkInfo";
import { ParkMapDownload } from "@/components/park/ParkMapDownload";
import { ParkFaq } from "@/components/park/ParkFaq";
import { DemoTag } from "@/components/common/DemoTag";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: { en: "The Park", zh: "樂園" },
    description: {
      en: "Explore AKKI Bike Park trails and facilities, check what suits your level, and book your ride.",
      zh: "探索 AKKI 單車樂園的賽道及設施，了解適合你的級別，然後預約騎行。",
    },
    path: "/park",
  });
}

export default async function ParkPage() {
  const { t } = await getServerT();
  return (
    <>
      <section className="topo border-b border-graphite-700">
        <div className="container space-y-5 py-14 md:py-20">
          <p className="eyebrow">{t("park.hero.eyebrow")}</p>
          <h1 className="h-display text-5xl md:text-7xl">{t("park.hero.title")}</h1>
          <p className="max-w-xl text-base text-silver md:text-lg">{t("park.hero.body")}</p>
          <p className="flex max-w-2xl items-start gap-3 rounded-lg border border-signal/40 bg-signal/5 p-3 text-sm text-silver">
            <DemoTag label={t("demo.placeholder")} className="mt-0.5 shrink-0" />
            {t("park.placeholder.banner")}
          </p>
        </div>
      </section>

      <section className="container pt-12 md:pt-16">
        <SectionHeading eyebrow={t("park.facts.eyebrow")} title={t("park.facts.title")} className="mb-6" />
        <ParkFacts />
      </section>

      <section className="container py-12 md:py-16">
        <ParkExplorer />
      </section>

      <section className="container pb-12 md:pb-16">
        <SectionHeading eyebrow={t("park.info.eyebrow")} title={t("park.info.title")} className="mb-8" />
        <ParkInfo />
      </section>

      <section className="container pb-12 md:pb-16">
        <ParkMapDownload />
      </section>

      <section className="container max-w-3xl pb-12 md:pb-16">
        <SectionHeading title={t("park.faq.title")} className="mb-6" />
        <ParkFaq />
      </section>

      <section className="border-t border-graphite-700">
        <div className="container flex flex-col items-start gap-5 py-14 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="h-section">{t("park.cta.title")}</h2>
            <p className="text-silver">{t("park.cta.body")}</p>
          </div>
          <Link href="/booking" className={buttonVariants({ size: "lg" })}>
            {t("park.cta.book")}
          </Link>
        </div>
      </section>
    </>
  );
}
