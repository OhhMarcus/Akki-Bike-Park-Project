"use client";

import { useI18n } from "@/i18n/provider";
import { useSettings } from "@/lib/hooks";
import type { PumpTrackDayHours } from "@/types";
import { cn } from "@/lib/utils";

/** Groups identical consecutive days (Mon first): "Tue–Fri 3:00–9:00pm". */
export function groupHours(hours: PumpTrackDayHours[]) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const days = order.map((wd) => hours.find((h) => h.weekday === wd)).filter(Boolean) as PumpTrackDayHours[];
  const groups: { from: number; to: number; h: PumpTrackDayHours }[] = [];
  for (const h of days) {
    const last = groups[groups.length - 1];
    const same = last && last.h.open === h.open && (!h.open || (last.h.start === h.start && last.h.end === h.end));
    if (same) last.to = h.weekday;
    else groups.push({ from: h.weekday, to: h.weekday, h });
  }
  return groups;
}

/** Opening hours from the live schedule (Admin → Schedule). */
export function HoursList({ className }: { className?: string }) {
  const { t, fmt } = useI18n();
  const [settings] = useSettings();
  return (
    <dl className={cn("space-y-1.5 text-sm", className)}>
      {groupHours(settings.pumpHours).map((g) => (
        <div key={g.from} className="flex justify-between gap-6">
          <dt className="text-muted">
            {g.from === g.to ? fmt.weekday(g.from, "long") : `${fmt.weekday(g.from, "long")} – ${fmt.weekday(g.to, "long")}`}
          </dt>
          <dd className="tabular text-fg">{g.h.open ? fmt.timeRange(g.h.start, g.h.end) : t("hours.closed")}</dd>
        </div>
      ))}
    </dl>
  );
}
