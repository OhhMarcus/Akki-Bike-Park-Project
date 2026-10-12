"use client";

import Link from "next/link";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { SectionTitle } from "@/components/brand/Headline";
import { Swap } from "@/components/brand/Swap";
import { HoursList } from "@/components/layout/HoursList";
import { buttonVariants } from "@/components/ui/button";
import { MapPanel } from "@/components/visit/MapPanel";
import { cn } from "@/lib/utils";

const row = "grid gap-1 py-4 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-6";

/** Area, hours and the getting-there one-liner, next to the map preview. */
export function VisitTeaser() {
  const { t, l } = useI18n();
  return (
    <section className="container pb-4 pt-16 sm:pt-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
        <div>
          <SectionTitle eyebrow={t("nav.visit")} title={t("home.visit.title")} brush={false} />
          <dl className="mt-8 divide-y divide-line border-y border-line">
            <div className={row}>
              <dt className="text-sm text-muted">{t("label.location")}</dt>
              <dd className="font-semibold">
                {l(site.location.area)}
                {site.location.placeholder && <Swap />}
              </dd>
            </div>
            <div className={row}>
              <dt className="text-sm text-muted">{t("visit.go.eyebrow")}</dt>
              <dd>
                {t("home.visit.getting", { station: l(site.location.station) })}
                {site.location.placeholder && <Swap />}
              </dd>
            </div>
            <div className={row}>
              <dt className="text-sm text-muted">
                {t("hours.title")}
                <Swap />
              </dt>
              <dd>
                <HoursList />
              </dd>
            </div>
          </dl>
          <Link href="/visit" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-8 w-full sm:w-auto")}>
            {t("home.visit.cta")}
          </Link>
        </div>
        <MapPanel className="min-h-[340px] lg:min-h-[460px]" />
      </div>
    </section>
  );
}
