"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { Logo } from "@/components/brand/Logo";
import { PatternBand } from "@/components/brand/Pattern";
import { SectionTitle } from "@/components/brand/Headline";
import { buttonVariants } from "@/components/ui/button";
import { CapacityBar } from "@/components/ui/capacity";
import { StatusBadge, EventTag } from "@/components/ui/badge";
import { Photo } from "@/components/brand/Photo";

export default function Home() {
  const { t } = useI18n();
  return (
    <>
      <PatternBand className="border-b border-line">
        <div className="container grid min-h-[78svh] items-center gap-10 py-16 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-8">
            <Logo variant="hero" priority className="max-w-[620px]" />
            <p className="max-w-lg text-xl text-fg/90">Pump track, jumps and trails in Sheung Shui. Come ride.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/lessons" className={buttonVariants({ size: "lg" })}>{t("cta.bookLesson")}</Link>
              <Link href="/pump-track" className={buttonVariants({ size: "lg", variant: "secondary" })}>{t("cta.bookPump")}</Link>
            </div>
          </div>
          <div className="surface space-y-4 p-5">
            <StatusBadge status="available" />
            <CapacityBar booked={5} capacity={12} status="available" />
            <StatusBadge status="almost" />
            <CapacityBar booked={10} capacity={12} status="almost" />
            <StatusBadge status="full" />
            <CapacityBar booked={12} capacity={12} status="full" />
            <StatusBadge status="closed" />
            <CapacityBar booked={0} capacity={12} status="closed" />
            <div className="flex gap-2"><EventTag type="race" /><EventTag type="nightjam" /><EventTag type="groupride" /><EventTag type="kidscamp" /></div>
          </div>
        </div>
      </PatternBand>
      <section className="container py-20">
        <SectionTitle eyebrow="Lessons" title="Learn to *shred*" lead="Two-hour small group classes in English and Cantonese." />
        <Photo slot="home-ride" alt="Rider on the pump track" what="pump track action" className="mt-10 aspect-[21/9]" fade="bottom" />
      </section>
    </>
  );
}
