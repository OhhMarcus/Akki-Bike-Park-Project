"use client";

import { useI18n } from "@/i18n/provider";
import type { SlotStatus } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Capacity bar. Available = brand gradient filling left→right (the gradient is
 * pinned to the full track width so a fuller bar shows more of the spectrum),
 * almost full = amber, full = grey, closed = red hatch.
 */
export function CapacityBar({
  booked, capacity, status, className, height = "h-1.5",
}: {
  booked: number; capacity: number; status: SlotStatus; className?: string; height?: string;
}) {
  const { t } = useI18n();
  const p = capacity > 0 ? Math.min(1, booked / capacity) : 0;
  const pct = status === "full" || status === "closed" ? 100 : Math.max(p * 100, booked > 0 ? 4 : 0);
  const fill =
    status === "closed" ? "hatch-closed bg-state-closed/20"
    : status === "full" ? "bg-state-full"
    : status === "almost" ? "bg-brand-amber"
    : "bg-grad";
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-valuenow={booked}
      aria-label={`${booked}/${capacity} · ${t(`status.${status}`)}`}
      className={cn("w-full overflow-hidden rounded-sm bg-line", height, className)}
    >
      <div
        className={cn("h-full rounded-sm transition-[width] duration-500", fill)}
        style={status === "available" && p > 0 ? { width: `${pct}%`, backgroundSize: `${100 / Math.max(p, 0.04)}% 100%` } : { width: `${pct}%` }}
      />
    </div>
  );
}
