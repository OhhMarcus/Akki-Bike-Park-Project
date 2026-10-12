"use client";

import Link from "next/link";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { Headline } from "@/components/brand/Headline";
import { Swap } from "@/components/brand/Swap";
import { buttonVariants } from "@/components/ui/button";

/** AKKI Bike Club call-out on a pattern panel. */
export function ClubTeaser() {
  const { t, fmt } = useI18n();
  // "{price} a year" / "每年 {price}": style the price, keep each language's word order
  const [before, after] = t("home.club.fee").split("{price}");
  return (
    <section className="container py-8 sm:py-10">
      <div className="pattern-bg relative isolate overflow-hidden rounded-xl border border-line">
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:p-14">
          <div className="max-w-xl space-y-3">
            <p className="eyebrow">{t("nav.club")}</p>
            <Headline text={t("home.club.title")} className="text-5xl sm:text-6xl" />
            <p className="text-base leading-relaxed text-fg/80 sm:text-lg">{t("home.club.body")}</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <p className="flex items-baseline gap-1.5 text-sm text-fg/80">
              {before}
              <span className="font-display text-4xl font-extrabold italic leading-none text-fg tabular [font-synthesis:none]">
                {fmt.money(site.club.annualFeeHKD)}
              </span>
              {after}
              {site.club.placeholder && <Swap />}
            </p>
            <Link href="/club" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              {t("home.club.cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
