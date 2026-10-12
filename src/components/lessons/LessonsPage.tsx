"use client";

import Link from "next/link";
import { Bike, Clock, Languages, Users } from "lucide-react";
import { lessonList, lessons } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import { SectionTitle } from "@/components/brand/Headline";
import { PageHero } from "@/components/brand/PageHero";
import { PatternDivider } from "@/components/brand/Pattern";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";
import { buttonVariants } from "@/components/ui/button";
import { ClassCard } from "./ClassCard";
import { CoachCards } from "./CoachCards";
import { LessonsFaq } from "./LessonsFaq";
import { PackOffer } from "./PackOffer";

/** /lessons: the two classes, the 5-class pack, coaches and FAQ. */
export function LessonsPage() {
  const { t, fmt } = useI18n();
  const facts = [
    { Icon: Clock, text: fmt.duration(lessons.foundation.durationMin) },
    { Icon: Users, text: t("spots.max", { n: lessons.foundation.capacity }), swap: true },
    { Icon: Languages, text: t("lessons.facts.langs") },
    { Icon: Bike, text: t("lessons.facts.hire") },
  ];

  return (
    <>
      <PageHero
        eyebrow={t("nav.lessons")}
        title={t("lessons.hero.title")}
        lead={t("lessons.hero.lead")}
        actions={
          <>
            <Link href="/lessons/book" className={buttonVariants({ size: "lg" })}>
              {t("cta.bookLesson")}
            </Link>
            <a href="#pack" className={buttonVariants({ size: "lg", variant: "secondary" })}>
              {t("lessons.hero.packCta")}
            </a>
          </>
        }
        aside={
          <Photo
            slot="lessons-header"
            alt={t("lessons.hero.photoAlt")}
            what={t("lessons.hero.photoWhat")}
            fade="bottom"
            priority
            sizes="(min-width: 1024px) 420px, 100vw"
            className="aspect-[16/9] border border-line lg:aspect-[4/5]"
          />
        }
      />

      <div className="border-b border-line bg-card/40">
        <ul aria-label={t("lessons.facts.label")} className="container grid grid-cols-2 gap-x-4 gap-y-3 py-5 sm:grid-cols-4">
          {facts.map(({ Icon, text, swap }) => (
            <li key={text} className="flex items-center gap-2.5 text-sm font-semibold">
              <Icon aria-hidden className="h-5 w-5 shrink-0 text-muted" />
              <span>
                {text}
                {swap && <Swap />}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <section id="classes" className="container scroll-mt-20 py-16 sm:py-20">
        <SectionTitle eyebrow={t("lessons.classes.eyebrow")} title={t("lessons.classes.title")} lead={t("lessons.classes.lead")} />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {lessonList.map((lesson) => (
            <ClassCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>

      <PackOffer />
      <CoachCards />
      <PatternDivider />
      <LessonsFaq />
    </>
  );
}
