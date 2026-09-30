"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { useProgrammes } from "@/lib/store";

export function CoachingPreview() {
  const { t, l, money } = useI18n();
  const [programmes] = useProgrammes();
  const shown = programmes.slice(0, 4);
  return (
    <section className="container section-pad" aria-label={t("home.co.title")}>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow={t("home.co.eyebrow")} title={t("home.co.title")} />
        <Link href="/coaching" className={buttonVariants({ variant: "secondary" })}>
          {t("home.co.all")}
        </Link>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((p, i) => (
          <li key={p.id}>
            <Reveal delay={i * 0.05} className="h-full">
              <Link href="/coaching" className="surface flex h-full flex-col gap-3 p-5 transition-colors hover:border-silver-dim">
                <DifficultyBadge level={p.level} className="self-start" />
                <h3 className="font-display text-xl font-bold uppercase leading-tight">{l(p.name)}</h3>
                <p className="flex-1 text-sm text-silver">{l(p.summary)}</p>
                <div className="flex items-center justify-between gap-2 border-t border-graphite-700 pt-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-silver">
                    <Clock className="h-4 w-4" aria-hidden />
                    {l(p.duration)}
                  </span>
                  {p.priceHKD !== null && (
                    <span className="inline-flex items-center gap-2 font-semibold">
                      {money(p.priceHKD)}
                      <DemoTag />
                    </span>
                  )}
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
