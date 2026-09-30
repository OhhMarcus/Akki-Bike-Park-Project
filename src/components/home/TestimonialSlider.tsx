"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { siteConfig } from "@/config/site";
import { testimonials } from "@/content/testimonials";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TestimonialSlider() {
  const { t, l } = useI18n();
  const [i, setI] = useState(0);
  const n = testimonials.length;
  const cur = testimonials[i];
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const anyPlaceholder = testimonials.some((x) => x.isPlaceholder);

  return (
    <section className="container section-pad" aria-label={t("home.te.title")}>
      <SectionHeading eyebrow={t("home.te.eyebrow")} title={t("home.te.title")} />
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={t("home.te.label")}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
        className="mt-10 max-w-3xl"
      >
        <div aria-live="polite" role="group" aria-roledescription="slide" aria-label={t("home.ev.slide", { i: i + 1, n })} className="surface min-h-56 space-y-5 p-6 md:p-8">
          <Quote className="h-6 w-6 text-silver-dim" aria-hidden />
          <blockquote className="text-xl leading-relaxed md:text-2xl">{l(cur.quote)}</blockquote>
          <p className="flex flex-wrap items-center gap-2 text-sm text-silver">
            {l(cur.author)}
            {cur.isPlaceholder && <DemoTag label={t("demo.placeholder")} />}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex">
            {testimonials.map((x, idx) => (
              <button key={x.id} type="button" aria-label={t("home.te.dot", { i: idx + 1 })} aria-current={idx === i} onClick={() => setI(idx)} className="flex h-11 w-8 items-center justify-center">
                <span className={cn("h-2 rounded-full transition-all", idx === i ? "w-6 bg-bone" : "w-2 bg-graphite-600")} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" aria-label={t("home.te.prev")} onClick={() => go(-1)}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </Button>
            <Button variant="secondary" size="icon" aria-label={t("home.te.next")} onClick={() => go(1)}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
        {anyPlaceholder && siteConfig.showDemoLabels && <p className="mt-4 text-xs text-silver-dim">{t("home.te.note")}</p>}
      </div>
    </section>
  );
}
