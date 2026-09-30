"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { STEP_COUNT } from "./booking-utils";

const labels = ["booking.step.experience", "booking.step.datetime", "booking.step.riders", "booking.step.review", "booking.step.payment", "booking.step.confirmed"] as const;

/** Progress indicator. Completed steps are buttons (go back only); the current step has aria-current="step". */
export function BookingStepper({ step, onGo }: { step: number; onGo: (s: number) => void }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("booking.progress")} className="space-y-3">
      <p className="text-sm text-silver md:hidden" aria-hidden>
        {t("booking.stepOf", { n: step, total: STEP_COUNT })} · <span className="font-semibold text-bone">{t(labels[step - 1])}</span>
      </p>
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {labels.map((key, i) => {
          const n = i + 1;
          const done = n < step;
          const current = n === step;
          const clickable = done && step < STEP_COUNT;
          const dot = (
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold sm:h-8 sm:w-8", current ? "border-bone bg-bone text-ink" : done ? "border-trail-green/60 text-trail-green" : "border-graphite-600 text-silver-dim")}>
              {done ? <Check className="h-4 w-4" aria-hidden /> : n}
            </span>
          );
          const text = <span className={cn("hidden text-sm md:inline", current ? "font-semibold text-bone" : "text-silver")}>{t(key)}</span>;
          return (
            <li key={key} className="flex flex-1 items-center gap-2 last:flex-none" aria-current={current ? "step" : undefined}>
              {clickable ? (
                <button type="button" onClick={() => onGo(n)} className="flex min-h-11 items-center gap-2 rounded-md" aria-label={`${t("booking.goToStep", { n })}: ${t(key)}`}>
                  {dot}
                  {text}
                </button>
              ) : (
                <span className="flex min-h-11 items-center gap-2">
                  {dot}
                  {text}
                  <span className="sr-only">{`${t("booking.stepOf", { n, total: STEP_COUNT })}: ${t(key)}`}</span>
                </span>
              )}
              {n < STEP_COUNT && <span aria-hidden className={cn("h-px flex-1", done ? "bg-trail-green/50" : "bg-graphite-700")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
