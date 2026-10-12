"use client";

import { CalendarDays, Languages, UserRound } from "lucide-react";
import { coachById } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import type { SessionView } from "@/lib/schedule";
import { toMin, type HKNow } from "@/lib/time";
import type { ISODate } from "@/types";
import { Swap } from "@/components/brand/Swap";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CapacityBar } from "@/components/ui/capacity";
import { EmptyState } from "@/components/ui/empty";
import { OptionCards } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { optionFocus } from "./bits";
import { isBookable } from "./draft";

function SessionBadge({ s, now }: { s: SessionView; now: HKNow | null }) {
  const { t } = useI18n();
  if (s.past) {
    const ended = !!now && (s.date < now.date || toMin(s.end) <= now.minutes);
    return ended ? <StatusBadge status={s.status} past /> : <span className="text-xs font-semibold text-muted">{t("lessons.time.started")}</span>;
  }
  return <StatusBadge status={s.status} />;
}

export function StepTime({
  date, sessions, value, now, error, onChange, onChangeDate,
}: {
  date: ISODate | null;
  sessions: SessionView[];
  value: string | null;
  now: HKNow | null;
  error?: string;
  onChange: (id: string) => void;
  onChangeDate: () => void;
}) {
  const { t, l, fmt } = useI18n();

  if (!date || sessions.every((s) => s.past)) {
    return (
      <EmptyState
        title={t("lessons.time.none")}
        body={t("lessons.time.noneBody")}
        action={
          <Button variant="secondary" onClick={onChangeDate}>
            <CalendarDays aria-hidden className="h-4 w-4" />
            {t("lessons.time.changeDate")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <OptionCards<string>
        name="session"
        legend={t("lessons.time.legend", { date: fmt.dateLong(date) })}
        value={value ?? undefined}
        onChange={onChange}
        columns={1}
        className={cn(optionFocus, "[&_legend]:mb-3")}
        options={sessions.map((s) => {
          const coach = coachById(s.coachId);
          const bookable = isBookable(s);
          return {
            value: s.id,
            disabled: !bookable,
            title: (
              <span className="flex items-center justify-between gap-3 pt-0.5">
                <span className="h-display text-2xl tabular">{fmt.timeRange(s.start, s.end)}</span>
                <SessionBadge s={s} now={now} />
              </span>
            ),
            detail: (
              <span className="mt-2 block space-y-3">
                <span className="flex flex-wrap gap-x-5 gap-y-1.5 text-fg/85">
                  <span className="inline-flex items-center gap-1.5">
                    <Languages aria-hidden className="h-4 w-4 text-muted" />
                    {t("lessons.time.taught", { lang: t(`tlang.${s.language}`) })}
                  </span>
                  {coach && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound aria-hidden className="h-4 w-4 text-muted" />
                      <span className="sr-only">{t("label.coach")} </span>
                      {l(coach.name)}
                      <Swap />
                    </span>
                  )}
                </span>
                {s.status === "closed" && s.closedReason ? (
                  <span className="block text-xs font-semibold text-state-closed">{t(`reason.${s.closedReason}`)}</span>
                ) : (
                  <span className="block max-w-sm">
                    <span
                      className={cn(
                        "block text-xs font-semibold tabular",
                        s.status === "almost" ? "text-brand-amber" : s.status === "full" ? "text-state-full" : "text-fg/80",
                      )}
                    >
                      {s.status === "full" ? t("status.full") : t("spots.ofLeft", { n: s.remaining, cap: s.capacity })}
                    </span>
                    <CapacityBar booked={s.booked} capacity={s.capacity} status={s.status} className="mt-1.5" />
                  </span>
                )}
              </span>
            ),
          };
        })}
      />
      {error && (
        <p role="alert" className="text-xs font-medium text-state-closed">
          {error}
        </p>
      )}
      <button type="button" onClick={onChangeDate} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-fg">
        <CalendarDays aria-hidden className="h-4 w-4" />
        {t("lessons.time.changeDate")}
      </button>
    </div>
  );
}
