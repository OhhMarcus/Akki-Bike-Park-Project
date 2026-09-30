"use client";

import { img } from "@/content/images";
import Link from "next/link";
import { MapPin, TrainFront } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { PhotoPlaceholder } from "@/components/common/PhotoPlaceholder";
import { SectionHeading } from "@/components/common/SectionHeading";
import { buttonVariants } from "@/components/ui/button";

export function LocationTransport() {
  const { t, l } = useI18n();
  return (
    <section className="border-y border-graphite-800 bg-graphite-950" aria-label={t("home.loc.title")}>
      <div className="container section-pad grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <SectionHeading eyebrow={t("home.loc.eyebrow")} title={t("home.loc.title")} />
          <div className="space-y-6">
            <div className="flex gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-silver" aria-hidden />
              <div className="space-y-1">
                <p className="eyebrow">{t("home.loc.address")}</p>
                <p>
                  {l(siteConfig.address)} {!siteConfig.address.verified && <DemoTag className="ml-1 align-middle" />}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <TrainFront className="mt-1 h-5 w-5 shrink-0 text-silver" aria-hidden />
              <div className="space-y-1">
                <p className="eyebrow">{t("home.loc.transit")}</p>
                <p>{t("home.loc.transitBody")}</p>
              </div>
            </div>
          </div>
          <Link href="/visit" className={buttonVariants()}>
            {t("home.loc.cta")}
          </Link>
        </div>
        <PhotoPlaceholder src={img("location-map")} alt={t("home.loc.mapAlt")} caption={t("home.loc.mapCaption")} className="aspect-[4/3] rounded-lg" />
      </div>
    </section>
  );
}
