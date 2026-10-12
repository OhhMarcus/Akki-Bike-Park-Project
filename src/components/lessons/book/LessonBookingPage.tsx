"use client";

import { Suspense } from "react";
import { useI18n } from "@/i18n/provider";
import { Headline } from "@/components/brand/Headline";
import { PatternBand } from "@/components/brand/Pattern";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonBookingFlow } from "./BookingFlow";

function FlowFallback() {
  return (
    <div aria-hidden className="container space-y-8 pb-10 pt-6 sm:pt-8">
      <Skeleton className="h-11" />
      <Skeleton className="h-10 w-2/3 max-w-sm" />
      <div className="grid gap-2 sm:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="aspect-[7/6] max-w-[400px]" />
    </div>
  );
}

/** /lessons/book: compact header band + the six-step flow. */
export function LessonBookingPage() {
  const { t } = useI18n();
  return (
    <>
      <PatternBand className="border-b border-line">
        <div className="container py-7 sm:py-10">
          <p className="eyebrow">{t("nav.lessons")}</p>
          <Headline as="h1" text={t("lessons.book.title")} className="h2 mt-2" />
          <p className="mt-3 hidden max-w-xl text-fg/80 sm:block">{t("lessons.book.lead")}</p>
        </div>
      </PatternBand>
      <Suspense fallback={<FlowFallback />}>
        <LessonBookingFlow />
      </Suspense>
    </>
  );
}
