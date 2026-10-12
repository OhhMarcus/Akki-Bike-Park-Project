"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { site } from "@/config/site";
import { lessonList, pack5 } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import { SectionTitle } from "@/components/brand/Headline";
import { Swap } from "@/components/brand/Swap";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 5-class pack offer: price per class type, saving vs singles, validity, CTA into the flow with &pack=1. */
export function PackOffer() {
  const { t, l, fmt } = useI18n();
  return (
    <section id="pack" className="scroll-mt-20 border-y border-line bg-card/40">
      <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-start lg:gap-14">
        <div className="space-y-5">
          <SectionTitle eyebrow={t("lessons.pack.eyebrow")} title={t("lessons.pack.title")} lead={t("lessons.pack.lead")} />
          <p className="max-w-md text-sm leading-relaxed text-muted">{t("lessons.pack.how")}</p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {lessonList.map((lesson) => {
            const name = l(lesson.name);
            const price = pack5.priceHKD[lesson.id];
            const single = lesson.priceHKD * pack5.classes;
            const points = [
              t("lessons.pack.save", { amount: fmt.money(single - price), single: fmt.money(single) }),
              t("lessons.pack.each", { price: fmt.money(Math.round(price / pack5.classes)) }),
              t("lessons.pack.valid", { n: pack5.validityDays }),
              t("lessons.pack.firstClass"),
            ];
            return (
              <li key={lesson.id} className="surface flex flex-col p-5 sm:p-6">
                <p className="eyebrow">{t(`level.${lesson.level}`)}</p>
                <h3 className="h3 mt-1.5">{t("lessons.pack.name", { lesson: name })}</h3>
                <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                  <span className="h-display text-5xl tabular">{fmt.money(price)}</span>
                  <span className="text-sm text-muted">{t("lessons.pack.price", { n: pack5.classes })}</span>
                  {site.prices.placeholder && <Swap label={t("demo.pricesPlaceholder")} />}
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {points.map((p, i) => (
                    <li key={p} className={cn("flex gap-2.5 leading-snug", i === 0 ? "font-semibold text-fg" : "text-fg/80")}>
                      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={2.5} />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Link
                    href={`/lessons/book?lesson=${lesson.id}&pack=1`}
                    className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full whitespace-normal text-center")}
                  >
                    {t("lessons.pack.cta", { lesson: name })}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
