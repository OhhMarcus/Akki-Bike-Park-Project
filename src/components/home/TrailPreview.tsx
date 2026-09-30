"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { trails } from "@/content/trails";

const picks = ["t3", "t2", "t4"];
const featured = trails.filter((x) => picks.includes(x.id));

export function TrailPreview() {
  const { t, l } = useI18n();
  return (
    <section className="container section-pad" aria-label={t("home.trail.title")}>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow={t("home.trail.eyebrow")} title={t("home.trail.title")} />
        <Link href="/park" className={buttonVariants({ variant: "secondary" })}>
          {t("home.trail.cta")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {featured.map((tr, i) => (
          <li key={tr.id}>
            <Reveal delay={i * 0.06} className="h-full">
              <Link href="/park" className="surface flex h-full flex-col gap-4 p-5 transition-colors hover:border-silver-dim">
                <svg aria-hidden viewBox="0 0 600 380" className="topo h-28 w-full rounded-md" preserveAspectRatio="xMidYMid meet">
                  <path d={tr.path} fill="none" stroke="#b8bcc4" strokeWidth="6" strokeLinecap="round" strokeOpacity=".7" />
                </svg>
                <div className="flex items-center justify-between gap-2">
                  <DifficultyBadge level={tr.difficulty} />
                  <DemoTag label={t("demo.placeholder")} />
                </div>
                <h3 className="font-display text-xl font-bold uppercase">{l(tr.name)}</h3>
                <p className="text-sm text-silver">{l(tr.suitable)}</p>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-silver-dim">{t("home.trail.note")}</p>
    </section>
  );
}
