"use client";

import { ShieldCheck, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useAvailability, useConditions, useNowHK } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMark } from "@/components/home/StateMark";
import { summarizePark } from "@/components/home/status";
import { cn } from "@/lib/utils";

/** "Right now" line: park open/closed from the live schedule plus the HK Observatory warning. */
export function LiveStatus({ className }: { className?: string }) {
  const { t, fmt } = useI18n();
  const now = useNowHK();
  const avail = useAvailability(now);
  const [conditions] = useConditions();

  if (!now) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)} aria-hidden>
        <Skeleton className="h-11 w-64 rounded-md" />
        <Skeleton className="h-11 w-48 rounded-md" />
      </div>
    );
  }

  const park = summarizePark(avail.parkState(now), now, t, fmt);
  const warning = conditions.warning;
  const detail = [park.reason, park.when].filter(Boolean).join(" · ");
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <p
        className={cn(
          "inline-flex min-h-11 flex-wrap items-center gap-x-2.5 gap-y-0.5 rounded-md border px-3 py-2 text-sm",
          park.weather ? "border-state-closed/50 bg-state-closed/10" : "border-line bg-ink/70",
        )}
      >
        <span className="sr-only">{t("visit.live.label")}: </span>
        <StateMark open={park.open} className="h-2.5 w-2.5" />
        <span className={cn("font-semibold", park.weather && "text-state-closed")}>{park.title}</span>
        {detail && <span className="text-fg/75">{detail}</span>}
      </p>
      <p
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm",
          warning ? "border-state-closed/50 bg-state-closed/10 font-semibold" : "border-line bg-ink/70 text-fg/75",
        )}
      >
        {warning ? <TriangleAlert aria-hidden className="h-4 w-4 shrink-0 text-state-closed" /> : <ShieldCheck aria-hidden className="h-4 w-4 shrink-0" />}
        {warning ? t(`warning.${warning}`) : t("warning.none")}
      </p>
    </div>
  );
}
