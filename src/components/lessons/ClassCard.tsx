"use client";

import Link from "next/link";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { Lesson } from "@/types";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NextSessions } from "./NextSessions";

/** Triangle bullet, a nod to the park's tribar pattern. */
export function TriBullet({ className }: { className?: string }) {
  return <span aria-hidden className={cn("mt-[5px] h-0 w-0 shrink-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-fg/60", className)} />;
}

/** One class: photo header, facts, what you learn, next sessions, price and the Book CTA. */
export function ClassCard({ lesson }: { lesson: Lesson }) {
  const { t, l, fmt } = useI18n();
  const name = l(lesson.name);
  const titleId = `class-${lesson.id}-title`;
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: t("label.duration"), value: fmt.duration(lesson.durationMin) },
    { label: t("label.groupSize"), value: <>{t("spots.max", { n: lesson.capacity })}<Swap /></> },
    { label: t("label.language"), value: `${t("tlang.en")} / ${t("tlang.yue")}` },
    { label: t("lessons.card.ages"), value: <>{t("lessons.card.minAge", { n: lesson.minAge })}<Swap /></> },
  ];

  return (
    <article aria-labelledby={titleId} className="surface flex flex-col overflow-hidden">
      <Photo
        slot={`lessons-${lesson.id}`}
        alt={t("lessons.card.photoAlt", { lesson: name })}
        what={t("lessons.card.photoWhat", { lesson: name })}
        fade="bottom"
        rounded={false}
        sizes="(min-width: 1024px) 600px, 100vw"
        className="aspect-[16/9] min-h-[200px]"
      >
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="eyebrow text-fg/80">{t(`level.${lesson.level}`)}</p>
          <h3 id={titleId} className="h-display mt-1.5 text-4xl sm:text-5xl">{name}</h3>
        </div>
      </Photo>

      <div className="flex flex-1 flex-col gap-7 p-5 sm:p-6">
        <p className="text-[15px] leading-relaxed text-fg/85">{l(lesson.summary)}</p>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line py-4 text-sm">
          {facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-xs text-muted">{f.label}</dt>
              <dd className="mt-0.5 font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="eyebrow">{t("lessons.card.learn")}</p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {lesson.learn.map((item) => (
              <li key={item.en} className="flex gap-2.5 text-sm leading-snug text-fg/90">
                <TriBullet />
                {l(item)}
              </li>
            ))}
          </ul>
        </div>

        <NextSessions lessonId={lesson.id} lessonName={name} />

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-1">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="h-display text-4xl tabular">{fmt.money(lesson.priceHKD)}</span>
            <span className="text-sm text-muted">{t("unit.perClass")}</span>
            {site.prices.placeholder && <Swap label={t("demo.pricesPlaceholder")} />}
          </p>
          <Link href={`/lessons/book?lesson=${lesson.id}`} className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
            {t("lessons.card.book", { lesson: name })}
          </Link>
        </div>
      </div>
    </article>
  );
}
