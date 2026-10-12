"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { useAvailability, useNowHK } from "@/lib/hooks";
import { waLink } from "@/lib/phone";
import type { SessionView } from "@/lib/schedule";
import { addDays } from "@/lib/time";
import type { LessonId } from "@/types";
import { Swap } from "@/components/brand/Swap";
import { StatusBadge } from "@/components/ui/badge";
import { CapacityBar } from "@/components/ui/capacity";
import { Skeleton } from "@/components/ui/skeleton";
import { BOOKING_WINDOW_DAYS, isBookable } from "./book/draft";

const SHOW = 3;

/** The next few sessions of one class, each linking straight into the booking flow on that date. */
export function NextSessions({ lessonId, lessonName }: { lessonId: LessonId; lessonName: string }) {
  const { t, fmt } = useI18n();
  const now = useNowHK();
  const avail = useAvailability(now);

  const upcoming = useMemo(() => {
    if (!now) return null;
    const out: SessionView[] = [];
    for (let i = 0; i < BOOKING_WINDOW_DAYS && out.length < SHOW; i++) {
      for (const s of avail.sessions(addDays(now.date, i), lessonId)) {
        if (!s.past && s.status !== "closed" && out.length < SHOW) out.push(s);
      }
    }
    return out;
  }, [now, avail, lessonId]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{t("lessons.card.next")}</p>
        <Swap label={t("lessons.card.sampleTimes")} />
      </div>

      {!now || !upcoming ? (
        <ul aria-hidden className="mt-3 space-y-2">
          {Array.from({ length: SHOW }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-[58px]" />
            </li>
          ))}
        </ul>
      ) : upcoming.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-line-strong px-4 py-4 text-sm text-muted">
          {t("lessons.card.none")}{" "}
          <a
            href={waLink(site.whatsapp.display, t("lessons.wa.prefill"))}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-fg"
          >
            {t("lessons.card.noneCta")}
          </a>
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {upcoming.map((s) => {
            const bookable = isBookable(s);
            const body = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">
                    <span className="font-semibold">{fmt.relDay(s.date, now.date)}</span>
                    <span className="text-muted"> · {t(`tlang.${s.language}`)}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-muted tabular">{fmt.timeRange(s.start, s.end)}</span>
                </span>
                <span className="w-28 shrink-0">
                  {bookable ? (
                    <span className={s.status === "almost" ? "block text-right text-xs font-semibold text-brand-amber" : "block text-right text-xs font-semibold text-fg/80"}>
                      {t("spots.ofLeft", { n: s.remaining, cap: s.capacity })}
                    </span>
                  ) : (
                    <span className="flex justify-end">
                      <StatusBadge status={s.status} />
                    </span>
                  )}
                  <CapacityBar booked={s.booked} capacity={s.capacity} status={s.status} className="mt-1.5" />
                </span>
              </>
            );
            return (
              <li key={s.id}>
                {bookable ? (
                  <Link
                    href={`/lessons/book?lesson=${lessonId}&date=${s.date}`}
                    className="group -mx-2 flex min-h-[58px] items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="sr-only">{t("lessons.card.bookDate", { lesson: lessonName, date: fmt.dateWeekday(s.date) })}: </span>
                    {body}
                    <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                  </Link>
                ) : (
                  <div className="flex min-h-[58px] items-center gap-3 py-2 pr-7 opacity-70">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
