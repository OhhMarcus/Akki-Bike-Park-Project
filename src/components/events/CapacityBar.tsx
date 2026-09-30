"use client";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { ParkEvent } from "@/types";
import { isLow, remainingSpots } from "./eventUtils";

/** Capacity meter. "n spots left" wording appears only when genuinely low. */
export function CapacityBar({ event, className }: { event: ParkEvent; className?: string }) {
  const { t } = useI18n();
  const left = remainingSpots(event);
  const pct = event.capacity ? Math.min(100, Math.round((event.registered / event.capacity) * 100)) : 0;
  const label = left === 0 ? t("events.cap.full") : isLow(event) ? t("label.spots", { n: left }) : t("events.cap.available");
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
        <span className={cn("font-medium", left === 0 ? "text-danger" : isLow(event) ? "text-signal" : "text-silver")}>{label}</span>
        <span className="text-silver-dim">{t("events.cap.registered", { n: Math.min(event.registered, event.capacity), total: event.capacity })}</span>
      </div>
      <div
        role="progressbar"
        aria-label={t("events.cap.label")}
        aria-valuemin={0}
        aria-valuemax={event.capacity}
        aria-valuenow={Math.min(event.registered, event.capacity)}
        className="h-1.5 overflow-hidden rounded-full bg-graphite-700"
      >
        <div className={cn("h-full rounded-full", left === 0 ? "bg-danger" : isLow(event) ? "bg-signal" : "bg-silver")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
