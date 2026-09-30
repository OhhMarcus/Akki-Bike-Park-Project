"use client";

import { Clock } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { DayPeriod, TimeSlot } from "@/types";
import { availabilityMeta } from "./AvailabilityLegend";

/** Morning / afternoon / full-day buttons with honest capacity wording. */
export function SlotPicker({ slots, value, partySize, minParticipants, onChange, onWaitlist }: {
  slots: TimeSlot[];
  value?: DayPeriod;
  partySize: number;
  minParticipants: number;
  onChange: (p: DayPeriod) => void;
  onWaitlist: (s: TimeSlot) => void;
}) {
  const { t } = useI18n();
  return (
    <ul className="grid gap-3 sm:grid-cols-3" role="list">
      {slots.map((s) => {
        const disabled = s.status === "full" || s.status === "closed" || s.remaining < minParticipants;
        const tooSmall = s.status !== "closed" && s.status !== "full" && s.remaining < partySize;
        const waitlist = s.status === "full" || tooSmall;
        const selected = value === s.period;
        const meta = availabilityMeta[s.status];
        const Icon = meta.icon;
        const capacityText = s.status === "limited" ? t("label.spots", { n: s.remaining }) : t(`avail.${s.status}`);
        return (
          <li key={s.id} className="space-y-2">
            <button
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(s.period)}
              className={cn(
                "flex min-h-11 w-full flex-col items-start gap-1 rounded-lg border p-4 text-left",
                selected ? "border-bone bg-bone text-ink" : "border-graphite-600 bg-graphite-900 hover:bg-graphite-800",
                disabled && "cursor-not-allowed opacity-50 hover:bg-graphite-900",
              )}
            >
              <span className="font-display text-xl font-bold uppercase">{t(`period.${s.period}`)}</span>
              <span className={cn("inline-flex items-center gap-1.5 text-sm", selected ? "text-ink/80" : "text-silver")}>
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {s.startTime}–{s.endTime}
              </span>
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", selected ? "text-ink" : meta.text)}>
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {capacityText}
              </span>
            </button>
            {waitlist && (
              <div className="space-y-1">
                {tooSmall && <p className="text-xs text-signal">{t("booking.slotTooSmall", { n: s.remaining, party: partySize })}</p>}
                <button type="button" onClick={() => onWaitlist(s)} className="min-h-11 w-full rounded-md border border-graphite-600 px-3 text-sm font-medium text-bone hover:bg-graphite-800">
                  {t("booking.waitlistCta")}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
