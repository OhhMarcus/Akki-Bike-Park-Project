"use client";

import { useI18n } from "@/i18n/provider";
import { eventTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EVENT_TYPES, type EventFilter } from "./utils";

/** Type filter chips in the event colours (toggle buttons; "All" resets). Counts appear once data is ready. */
export function TypeFilter({
  value, onChange, counts, className,
}: {
  value: EventFilter;
  onChange: (v: EventFilter) => void;
  counts?: Record<EventFilter, number>;
  className?: string;
}) {
  const { t } = useI18n();
  const options: EventFilter[] = ["all", ...EVENT_TYPES];
  return (
    <div role="group" aria-label={t("events.filter.label")} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const active = value === o;
        const tone = o === "all" ? null : eventTone[o];
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o)}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition-colors",
              active
                ? tone
                  ? cn(tone.border, tone.bg, tone.text)
                  : "border-fg bg-white/10 text-fg"
                : "border-line bg-card text-fg/75 hover:border-line-strong hover:text-fg",
            )}
          >
            {tone && <span aria-hidden className={cn("h-2 w-2 rotate-45", tone.dot)} />}
            {o === "all" ? t("events.filter.all") : t(`evtype.${o}`)}
            {counts && (
              <span className={cn("min-w-5 rounded-sm px-1 text-center text-xs tabular", active ? "bg-ink/40" : "bg-white/5 text-muted")}>
                {counts[o]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
