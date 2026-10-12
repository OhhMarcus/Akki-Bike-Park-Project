"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { lessonList, lessons, pack5 } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import { waLink } from "@/lib/phone";
import { parts } from "@/lib/time";
import type { ISODate, LessonId, SlotStatus } from "@/types";
import { Swap } from "@/components/brand/Swap";
import { AvailabilityCalendar } from "@/components/calendar/MonthCalendar";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { OptionCards } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { optionFocus } from "./bits";

type YM = { y: number; m: number };
const ym = (iso: ISODate): YM => ({ y: parts(iso).y, m: parts(iso).m });

/** Month view that follows the chosen date (e.g. when switching class moves it to another month). */
function DatePicker({ value, onChange, dayState, min, max }: { value: ISODate | null; onChange: (d: ISODate) => void; dayState: (d: ISODate) => SlotStatus | "none"; min: ISODate; max: ISODate }) {
  const [month, setMonth] = useState<YM>(() => ym(value ?? min));
  useEffect(() => {
    if (!value) return;
    const next = ym(value);
    setMonth((cur) => (cur.y === next.y && cur.m === next.m ? cur : next));
  }, [value]);
  return <AvailabilityCalendar month={month} onMonthChange={setMonth} value={value ?? undefined} onChange={onChange} dayState={dayState} min={min} max={max} />;
}

export function StepClassDate({
  lessonId, buyPack, date, min, max, dayState, openCount, noOpenDates, error, onLesson, onBuyPack, onDate,
}: {
  lessonId: LessonId;
  buyPack: boolean;
  date: ISODate | null;
  /** today / last bookable day; null until the HK clock is known (after hydration) */
  min: ISODate | null;
  max: ISODate | null;
  dayState: (d: ISODate) => SlotStatus | "none";
  /** bookable sessions on the chosen date */
  openCount: number;
  /** nothing bookable for this class in the whole window */
  noOpenDates: boolean;
  /** shown after Continue was pressed without a valid date */
  error?: string;
  onLesson: (id: LessonId) => void;
  onBuyPack: (v: boolean) => void;
  onDate: (d: ISODate) => void;
}) {
  const { t, tn, l, fmt } = useI18n();
  const lesson = lessons[lessonId];
  const packPrice = pack5.priceHKD[lessonId];
  const save = lesson.priceHKD * pack5.classes - packPrice;

  return (
    <div className="space-y-9">
      <OptionCards<LessonId>
        name="lesson"
        legend={t("lessons.class.legend")}
        value={lessonId}
        onChange={onLesson}
        className={optionFocus}
        options={lessonList.map((x) => ({
          value: x.id,
          title: (
            <span className="flex items-baseline justify-between gap-3">
              <span>{l(x.name)}</span>
              <span className="tabular">{fmt.money(x.priceHKD)}</span>
            </span>
          ),
          detail: `${t(`level.${x.level}`)} · ${fmt.duration(x.durationMin)} · ${t("spots.max", { n: x.capacity })}`,
        }))}
      />

      <div>
        <OptionCards<"single" | "pack">
          name="lesson-type"
          legend={t("lessons.type.legend")}
          value={buyPack ? "pack" : "single"}
          onChange={(v) => onBuyPack(v === "pack")}
          className={optionFocus}
          options={[
            { value: "single", title: t("lessons.type.single"), detail: t("lessons.type.singleDetail", { price: fmt.money(lesson.priceHKD) }) },
            { value: "pack", title: t("book.line.pack"), detail: t("lessons.type.packDetail", { price: fmt.money(packPrice), save: fmt.money(save) }) },
          ]}
        />
        {site.prices.placeholder && (
          <p className="mt-2 text-xs text-muted">
            <Swap className="ml-0 mr-1.5" label={t("demo.pricesPlaceholder")} />
          </p>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-medium">{t("label.date")}</legend>
        <p className="mb-4 mt-1 text-xs text-muted">{t("lessons.date.hint")}</p>
        <div className="grid gap-6 md:grid-cols-[minmax(0,400px)_minmax(0,1fr)] md:items-start lg:grid-cols-1 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <div className="w-full max-w-[400px]">
            {min && max ? (
              <DatePicker value={date} onChange={onDate} dayState={dayState} min={min} max={max} />
            ) : (
              <div aria-hidden>
                <Skeleton className="h-10 w-48" />
                <Skeleton className="mt-4 aspect-[7/6] w-full" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {noOpenDates ? (
              <div className="rounded-lg border border-dashed border-line-strong p-4 text-sm">
                <p className="font-semibold">{t("lessons.date.none", { lesson: l(lesson.name) })}</p>
                <p className="mt-1 text-muted">{t("lessons.date.noneBody")}</p>
                <a
                  href={waLink(site.whatsapp.display, t("lessons.wa.prefill"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "secondary", font: "sans" }), "mt-4 border-[#25D366]/50 text-[#5EDC8C] hover:border-[#25D366]")}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t("wa.label")}
                </a>
              </div>
            ) : (
              <p aria-live="polite" className={cn("min-h-6 text-sm font-semibold", !date && "text-muted")}>
                {date && min ? tn("lessons.date.chosen", openCount, { date: fmt.dateLong(date) }) : min ? t("val.pickDate") : null}
              </p>
            )}
            {error && !noOpenDates && (
              <p role="alert" className="text-xs font-medium text-state-closed">
                {error}
              </p>
            )}
            <div>
              <p className="text-xs text-muted">{t("status.legend")}</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {(["available", "almost", "full", "closed"] as const).map((s) => (
                  <li key={s}>
                    <StatusBadge status={s} />
                  </li>
                ))}
              </ul>
            </div>
            <p className="border-t border-line pt-4 text-xs text-muted">{t("lessons.other.klook")}</p>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
