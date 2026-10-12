"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { Availability } from "@/lib/hooks";
import type { HKNow } from "@/lib/time";
import { Logo } from "@/components/brand/Logo";
import { PatternBand } from "@/components/brand/Pattern";
import { buttonVariants } from "@/components/ui/button";
import { ParkStatusCard } from "./ParkStatusCard";

/** Black pattern band: big logo, one line, two CTAs, and the live park card. */
export function Hero({ now, avail }: { now: HKNow | null; avail: Availability }) {
  const { t } = useI18n();
  return (
    <PatternBand className="border-b border-line">
      <div className="container grid items-center gap-10 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:py-20 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-16">
        <div>
          <h1 className="w-full max-w-[620px]">
            <Logo variant="hero" priority />
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg/90 [word-break:keep-all] sm:text-xl">{t("home.hero.line")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/lessons" className={buttonVariants({ size: "xl" })}>
              {t("cta.bookLesson")}
            </Link>
            <Link href="/pump-track" className={buttonVariants({ variant: "secondary", size: "xl" })}>
              {t("cta.bookPump")}
            </Link>
          </div>
        </div>
        <ParkStatusCard now={now} avail={avail} />
      </div>
    </PatternBand>
  );
}
