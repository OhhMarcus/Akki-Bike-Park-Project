"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { STEP_KEYS } from "./draft";

/**
 * Class & date → Time → Rider → Waiver → Pay → Done. Any step the rider has
 * already unlocked is a button (jump back, or forward again while the details
 * still check out). Bars only on phones, numbered labels from md up.
 */
export function FlowStepper({
  current, reachable, done, onSelect,
}: {
  current: number;
  /** highest step whose earlier steps are all complete */
  reachable: number;
  done: boolean;
  onSelect: (step: number) => void;
}) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("lessons.steps.label")}>
      <ol className="grid grid-cols-6 gap-1.5 md:gap-3">
        {STEP_KEYS.map((key, i) => {
          const label = t(`lessons.step.${key}`);
          const state = done || i < current ? "done" : i === current ? "current" : "todo";
          const clickable = !done && i !== current && i <= reachable;
          const inner = (
            <>
              <span
                aria-hidden
                className={cn(
                  "block h-1 w-full rounded-sm transition-colors",
                  state === "current" ? "bg-fg" : state === "done" ? "bg-fg/45" : "bg-line",
                  clickable && "group-hover:bg-fg/70",
                )}
              />
              <span className="mt-2.5 hidden min-w-0 items-center gap-2 md:flex">
                <span
                  aria-hidden
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-sm border text-xs font-bold tabular",
                    state === "current" ? "border-fg bg-fg text-ink" : state === "done" ? "border-fg/45 text-fg" : "border-line text-muted",
                  )}
                >
                  {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("truncate text-sm font-semibold", state === "todo" ? "text-muted" : "text-fg")}>{label}</span>
              </span>
              <span className="sr-only md:hidden">{label}</span>
              {state === "done" && <span className="sr-only"> ({t("lessons.steps.completed")})</span>}
            </>
          );
          const box = "flex min-h-11 w-full flex-col justify-center md:justify-start md:pt-1";
          return (
            <li key={key} aria-current={state === "current" ? "step" : undefined} className="min-w-0">
              {clickable ? (
                <button type="button" onClick={() => onSelect(i)} className={cn(box, "group rounded-sm text-left")}>
                  {inner}
                </button>
              ) : (
                <div className={box}>{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
