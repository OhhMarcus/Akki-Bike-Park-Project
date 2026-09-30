"use client";

import Link from "next/link";
import { Bike, Briefcase, Check, GraduationCap, Megaphone, PartyPopper, Users } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";
import { DemoTag } from "@/components/common/DemoTag";
import { segmentMsgKey, type Segment } from "./segments";

const icons = { GraduationCap, Users, Briefcase, PartyPopper, Bike, Megaphone };

export function SegmentSection({ segment, onQuote }: { segment: Segment; onQuote: (s: Segment) => void }) {
  const { t, l } = useI18n();
  const Icon = icons[segment.icon];
  const name = t(segmentMsgKey(segment.key));
  return (
    <section id={segment.anchor} aria-labelledby={`${segment.anchor}-h`} className="scroll-mt-32 border-b border-graphite-800 py-12 first:pt-0 md:py-16">
      <Reveal>
        <div className="flex items-center gap-3 text-silver">
          <Icon className="h-6 w-6" aria-hidden />
          <span className="eyebrow">{t("groups.eyebrow")}</span>
        </div>
        <h2 id={`${segment.anchor}-h`} className="h-section mt-3">{name}</h2>
        <p className="mt-3 max-w-xl text-silver">{l(segment.blurb)}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="eyebrow mb-3">{t("groups.benefits")}</h3>
            <ul className="space-y-3">
              {segment.benefits.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm text-bone/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-trail-green" aria-hidden />
                  {l(b)}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="eyebrow">{t("groups.itinerary")}</h3>
              <DemoTag />
            </div>
            <ol className="space-y-3">
              {segment.itinerary.map((s, i) => (
                <li key={s.step} className="flex gap-3 text-sm">
                  <span className="font-display w-5 shrink-0 text-silver-dim">{i + 1}</span>
                  <span>
                    <span className="font-semibold text-bone">{t(`groups.step.${s.step}`)}</span>
                    <span className="text-silver"> · {l(s.text)}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-silver-dim">{t("groups.itineraryNote")}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => onQuote(segment)}>{t("groups.requestQuote")}</Button>
          {segment.bookExp && (
            <Link href={`/booking?exp=${segment.bookExp}`} className={buttonVariants({ variant: "secondary" })}>
              {t("groups.bookInstant")}
            </Link>
          )}
        </div>
      </Reveal>
    </section>
  );
}
