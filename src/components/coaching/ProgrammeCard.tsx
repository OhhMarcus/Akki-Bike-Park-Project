"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { CoachingProgramme } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { DemoTag } from "@/components/common/DemoTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { cn } from "@/lib/utils";
import { programmeIcon } from "./programmeIcons";

/** `nextDate` is null until hydration (it depends on today's date). */
export function ProgrammeCard({ programme: p, nextDate }: { programme: CoachingProgramme; nextDate: string | null }) {
  const { t, l, date, money } = useI18n();
  const Icon = programmeIcon(p.icon);
  const href = `/booking?exp=${p.experienceId}${nextDate ? `&date=${nextDate}` : ""}`;

  return (
    <article id={`programme-${p.id}`} aria-labelledby={`programme-title-${p.id}`} className="surface flex scroll-mt-24 flex-col gap-4 p-5">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Icon className="h-6 w-6 text-silver" aria-hidden />
          <DifficultyBadge level={p.level} />
        </div>
        <h3 id={`programme-title-${p.id}`} className="font-display text-2xl font-bold uppercase leading-tight">
          {l(p.name)}
        </h3>
        <p className="text-sm text-silver">{l(p.summary)}</p>
      </header>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        {(
          [
            ["coaching.card.age", p.ageRange],
            ["coaching.card.duration", p.duration],
            ["coaching.card.group", p.groupSize],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs uppercase tracking-wider text-silver-dim">{t(k)}</dt>
            <dd className="mt-1 text-bone">{l(v)}</dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="text-xs uppercase tracking-wider text-silver-dim">{t("coaching.card.outcomes")}</p>
        <ul className="mt-2 space-y-1 text-sm text-silver">
          {p.outcomes.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-silver-dim" />
              {l(o)}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-silver-dim">{t("coaching.card.equipment")}</p>
        <p className="mt-1 text-sm text-silver">{p.equipment.map((e) => l(e)).join(" · ")}</p>
      </div>

      <p className="flex flex-wrap items-center gap-2 text-sm text-silver">
        <span className="text-xs uppercase tracking-wider text-silver-dim">{t("coaching.card.instructor")}</span>
        {l(p.instructor)}
        <DemoTag label={t("demo.placeholder")} />
      </p>

      <div className="mt-auto space-y-3 border-t border-graphite-700 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={cn("flex items-center gap-2", p.priceHKD == null ? "text-sm text-silver" : "font-display text-2xl font-bold")}>
            {p.priceHKD == null ? t("coaching.card.priceTbc") : money(p.priceHKD)}
            <DemoTag />
          </p>
          <p className="flex items-center gap-2 text-sm text-silver">
            <span className="sr-only">{t("coaching.card.next")}: </span>
            <span aria-hidden className="text-xs uppercase tracking-wider text-silver-dim">
              {t("coaching.card.next")}
            </span>
            {nextDate ? date(nextDate, { weekday: "short", day: "numeric", month: "short" }) : "—"}
            <DemoTag />
          </p>
        </div>
        <Link href={href} className={cn(buttonVariants(), "w-full")}>
          {t("coaching.card.book")}
        </Link>
      </div>
    </article>
  );
}
