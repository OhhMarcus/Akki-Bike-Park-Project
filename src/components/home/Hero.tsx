"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/provider";
import { PhotoPlaceholder } from "@/components/common/PhotoPlaceholder";
import { buttonVariants } from "@/components/ui/button";
import { ParkStatusBar } from "./ParkStatusBar";

export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const fade = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay: reduce ? 0 : 0.08 * i, ease: "easeOut" as const },
  });

  return (
    <section aria-labelledby="home-hero-title" className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden pb-10 md:pb-12">
      <PhotoPlaceholder alt={t("home.hero.photoAlt")} priority className="absolute inset-0 -z-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-ink/60" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-ink to-transparent" />

      <div className="container flex flex-1 flex-col justify-end pb-10 pt-24 md:pb-14">
        <motion.h1 id="home-hero-title" {...fade(0)} className="h-display max-w-4xl text-[clamp(3rem,10vw,7.5rem)]">
          {t("home.hero.title")}
        </motion.h1>
        <motion.p {...fade(1)} className="mt-5 max-w-xl text-base leading-relaxed text-silver md:text-lg">
          {t("home.hero.body")}
        </motion.p>
        <motion.div {...fade(2)} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/booking" className={buttonVariants({ size: "lg" })}>
            {t("cta.bookRide")}
          </Link>
          <Link href="/park" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            {t("cta.explore")}
          </Link>
        </motion.div>
      </div>

      <div className="container">
        <div className="overflow-hidden rounded-lg border border-graphite-700">
          <ParkStatusBar />
        </div>
      </div>
    </section>
  );
}
