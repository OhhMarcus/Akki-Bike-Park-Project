"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { Headline } from "@/components/brand/Headline";
import { Photo } from "@/components/brand/Photo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Full-bleed action photo with one punchy line about the trails next door. */
export function RideBand() {
  const { t } = useI18n();
  return (
    <section>
      <Photo
        slot="home-ride"
        alt={t("home.ride.alt")}
        what={t("home.ride.what")}
        fade="bottom"
        rounded={false}
        className="flex min-h-[460px] items-end border-y border-line sm:min-h-[540px] lg:min-h-[620px]"
      >
        <div className="container pb-12 pt-24 sm:pb-16">
          <Headline text={t("home.ride.title")} className="max-w-3xl text-5xl sm:text-6xl lg:text-7xl" brush />
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg/85">{t("home.ride.body")}</p>
          <Link href="/events" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-7")}>
            {t("home.ride.cta")}
          </Link>
        </div>
      </Photo>
    </section>
  );
}
