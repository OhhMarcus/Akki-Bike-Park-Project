"use client";

import Link from "next/link";
import { ArrowRight, Clock, Languages, Users } from "lucide-react";
import { site } from "@/config/site";
import { lessonList, pack5 } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import type { Availability } from "@/lib/hooks";
import type { HKNow } from "@/lib/time";
import type { Lesson } from "@/types";
import { SectionTitle } from "@/components/brand/Headline";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";
import { Chip } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = { now: HKNow | null; avail: Availability };

export function LessonsTeaser({ now, avail }: Props) {
  const { t } = useI18n();
  return (
    <section className="container pb-16 pt-12 sm:pb-20 sm:pt-14">
      <SectionTitle
        eyebrow={t("nav.lessons")}
        title={t("home.lessons.title")}
        lead={t("home.lessons.lead")}
        brush={false}
        action={
          <Link href="/lessons" className={cn(buttonVariants({ variant: "ghost", size: "md", font: "sans" }), "-ml-3 self-start sm:ml-0 sm:self-auto")}>
            {t("home.lessons.all")}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {lessonList.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} now={now} avail={avail} />
        ))}
      </div>
      <PackStrip />
    </section>
  );
}

function LessonCard({ lesson, now, avail }: Props & { lesson: Lesson }) {
  const { t, l, fmt } = useI18n();
  const name = l(lesson.name);
  const next = now ? avail.nextFreeSession(now, lesson.id) : null;
  return (
    <article className="surface flex flex-col overflow-hidden">
      <Photo
        slot={`lessons-${lesson.id}`}
        alt={t("home.lessons.photoAlt", { lesson: name })}
        what={t("home.lessons.photoWhat", { lesson: name })}
        fade="bottom"
        rounded={false}
        sizes="(min-width: 1024px) 620px, 100vw"
        className="flex aspect-[16/8] items-end sm:aspect-[16/7]"
      >
        <div className="w-full px-5 pb-4 pt-12">
          <Chip className="bg-ink/70">{t(`level.${lesson.level}`)}</Chip>
          <h3 className="h3 mt-2">{name}</h3>
        </div>
      </Photo>
      <div className="flex flex-1 flex-col gap-5 p-5 pt-4">
        <p className="leading-relaxed text-fg/80">{l(lesson.summary)}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg/85">
          <li className="inline-flex items-center gap-2">
            <Clock aria-hidden className="h-4 w-4 text-muted" />
            {fmt.duration(lesson.durationMin)}
          </li>
          <li className="inline-flex items-center gap-2">
            <Users aria-hidden className="h-4 w-4 text-muted" />
            {t("home.lessons.group", { n: lesson.capacity })}
            <Swap />
          </li>
          <li className="inline-flex items-center gap-2">
            <Languages aria-hidden className="h-4 w-4 text-muted" />
            {t("home.lessons.langs")}
          </li>
        </ul>
        <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-line bg-ink/40 px-3 py-2 text-sm">
          <span className="font-semibold text-muted">{t("home.lessons.next")}</span>
          {!now ? (
            <Skeleton className="h-4 w-52 rounded-sm" />
          ) : next ? (
            <span className="tabular">
              {fmt.relDay(next.date, now.date)} · {fmt.time(next.start)} · {t(`tlang.${next.language}`)} ·{" "}
              <span className={cn("whitespace-nowrap", next.status === "almost" && "text-brand-amber")}>
                {t("spots.ofLeft", { n: next.remaining, cap: next.capacity })}
              </span>
            </span>
          ) : (
            <span className="text-muted">{t("home.lessons.nextNone")}</span>
          )}
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-extrabold italic leading-none tabular [font-synthesis:none]">{fmt.money(lesson.priceHKD)}</span>
            <span className="text-sm text-muted">{t("unit.perClass")}</span>
            {site.prices.placeholder && <Swap />}
          </p>
          <Link href={`/lessons/book?lesson=${lesson.id}`} className={cn(buttonVariants({ variant: "secondary", size: "md" }), "w-full sm:w-auto")}>
            {t("home.lessons.book", { lesson: name })}
          </Link>
        </div>
      </div>
    </article>
  );
}

function PackStrip() {
  const { t, l, fmt } = useI18n();
  return (
    <div className="surface mt-4 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
      <div className="max-w-sm">
        <div className="flex items-center">
          <h3 className="h3">{t("book.line.pack")}</h3>
          {site.prices.placeholder && <Swap />}
        </div>
        <p className="mt-1.5 text-sm text-muted">{t("home.pack.body")}</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 md:min-w-[440px] lg:min-w-[520px]">
        {lessonList.map((lesson) => {
          const price = pack5.priceHKD[lesson.id];
          const save = lesson.priceHKD * pack5.classes - price;
          return (
            <li key={lesson.id}>
              <Link
                href={`/lessons/book?lesson=${lesson.id}&pack=1`}
                className="group flex h-full items-center justify-between gap-3 rounded-lg border border-line bg-card-2 px-4 py-3 transition-colors hover:border-line-strong hover:bg-card-3"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{t("home.pack.cta", { lesson: l(lesson.name) })}</span>
                  <span className="block text-sm text-muted tabular">
                    {fmt.money(price)} · {t("home.pack.perClass", { amount: fmt.money(Math.round(price / pack5.classes)) })}
                  </span>
                  {save > 0 && <span className="mt-0.5 block text-xs font-semibold text-fg/90">{t("home.pack.save", { amount: fmt.money(save) })}</span>}
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
