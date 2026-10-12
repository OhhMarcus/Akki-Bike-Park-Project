"use client";

import { coachById, lessons } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import type { SessionView } from "@/lib/schedule";
import type { Quote } from "@/lib/services";
import { rentalBikeCount } from "@/lib/sizing";
import type { ISODate, LessonId, Rentals } from "@/types";
import { Swap } from "@/components/brand/Swap";
import { QuoteSummary } from "@/components/booking/QuoteSummary";
import { cn } from "@/lib/utils";

export type SummaryProps = {
  lessonId: LessonId;
  buyPack: boolean;
  date: ISODate | null;
  session?: SessionView;
  riderName: string;
  rentals: Rentals;
};

/** Class, date, time, coach, rider and gear, as picked so far. */
export function BookingDetails({ lessonId, buyPack, date, session, riderName, rentals, className }: SummaryProps & { className?: string }) {
  const { t, tn, l, fmt } = useI18n();
  const lesson = lessons[lessonId];
  const coach = session ? coachById(session.coachId) : undefined;
  const notYet = <span className="text-muted">{t("lessons.sum.notYet")}</span>;
  const bikes = rentalBikeCount(rentals);
  const gear = [bikes ? tn("bikes.count", bikes) : null, rentals.helmets ? tn("helmets.count", rentals.helmets) : null].filter(Boolean).join(" · ");
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t("label.date"), value: date ? fmt.dateLong(date) : notYet },
    { label: t("label.time"), value: session ? `${fmt.timeRange(session.start, session.end)} · ${t(`tlang.${session.language}`)}` : notYet },
    { label: t("label.coach"), value: coach ? <>{l(coach.name)}<Swap /></> : notYet },
    { label: t("book.done.who"), value: riderName.trim() || notYet },
    { label: t("label.rentals"), value: gear || t("book.rent.own") },
  ];
  return (
    <div className={cn("surface p-5", className)}>
      <p className="eyebrow">{t("lessons.sum.title")}</p>
      <p className="h-display mt-2 text-2xl">{l(lesson.name)}</p>
      <p className="mt-1 text-sm text-muted">
        {t(`level.${lesson.level}`)} · {buyPack ? t("book.line.pack") : t("lessons.type.single")}
      </p>
      <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4">
            <dt className="shrink-0 text-muted">{r.label}</dt>
            <dd className="min-w-0 text-right font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Desktop side column: details + running price. */
export function BookingSummary({ quote, ...details }: SummaryProps & { quote: Quote }) {
  return (
    <div className="sticky top-24 space-y-4">
      <BookingDetails {...details} />
      <QuoteSummary quote={quote} />
    </div>
  );
}
