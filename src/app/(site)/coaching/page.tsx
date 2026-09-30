import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getServerT } from "@/i18n/server";
import { SectionHeading } from "@/components/common/SectionHeading";
import { DemoTag } from "@/components/common/DemoTag";
import { ProgrammeList } from "@/components/coaching/ProgrammeList";
import { ProgrammeQuiz } from "@/components/coaching/ProgrammeQuiz";
import { ProgressionPath } from "@/components/coaching/ProgressionPath";
import { GroupCoachingCta } from "@/components/coaching/GroupCoachingCta";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: { en: "Coaching", zh: "教練課程" },
    description: {
      en: "Coaching programmes from first ride to race preparation. Find your level and book a session.",
      zh: "由首次騎行到比賽準備的教練課程。找到適合你的級別並預約。",
    },
    path: "/coaching",
  });
}

const levels = ["beginner", "intermediate", "advanced"] as const;

export default async function CoachingPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const { t } = await getServerT();
  const { level } = await searchParams;
  const initialLevel = levels.find((l) => l === level) ?? "all";
  return (
    <>
      <section className="topo border-b border-graphite-700">
        <div className="container space-y-5 py-14 md:py-20">
          <p className="eyebrow">{t("coaching.hero.eyebrow")}</p>
          <h1 className="h-display text-5xl md:text-7xl">{t("coaching.hero.title")}</h1>
          <p className="max-w-xl text-base text-silver md:text-lg">{t("coaching.hero.body")}</p>
          <p className="flex max-w-2xl items-start gap-3 rounded-lg border border-signal/40 bg-signal/5 p-3 text-sm text-silver">
            <DemoTag className="mt-0.5 shrink-0" />
            {t("coaching.demoNote")}
          </p>
          <a href="#quiz" className="inline-flex min-h-11 items-center text-sm text-bone underline underline-offset-4">
            {t("coaching.hero.quiz")}
          </a>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <ProgrammeList initialLevel={initialLevel} />
      </section>

      <section id="quiz" className="container scroll-mt-24 pb-12 md:pb-16">
        <SectionHeading eyebrow={t("coaching.quiz.eyebrow")} title={t("coaching.quiz.title")} body={t("coaching.quiz.body")} className="mb-8" />
        <ProgrammeQuiz />
      </section>

      <section className="container pb-12 md:pb-16">
        <SectionHeading eyebrow={t("coaching.path.eyebrow")} title={t("coaching.path.title")} className="mb-8" />
        <ProgressionPath />
      </section>

      <section className="container pb-16 md:pb-24">
        <GroupCoachingCta />
      </section>
    </>
  );
}
