"use client";

import { CalendarDays } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { ParkEvent, SlotStatus } from "@/types";
import { CapacityBar } from "@/components/ui/capacity";
import { Swap } from "@/components/brand/Swap";
import { cn } from "@/lib/utils";
import { priceSpan, splitTemplate, type EventSpots } from "./utils";

const spotsTone: Record<SlotStatus, string> = {
  available: "text-fg",
  almost: "text-brand-amber",
  full: "text-state-full",
  closed: "text-state-closed",
};

/** "from HK$150" (lowest category), a single price, or "Free". Prices are placeholders, so they carry the Swap marker. */
export function EventPrice({ event, className, amountClassName }: { event: Pick<ParkEvent, "categories">; className?: string; amountClassName?: string }) {
  const { t, fmt } = useI18n();
  const span = priceSpan(event);
  if (!span) return null;
  const amount = cn("font-display font-extrabold italic tabular [font-synthesis:none]", amountClassName);
  let body: React.ReactNode;
  if (span.min === span.max) {
    body = <span className={amount}>{fmt.money(span.min)}</span>;
  } else if (span.min === 0) {
    body = <span className={amount}>{t("events.priceRange", { min: fmt.money(0), max: fmt.money(span.max) })}</span>;
  } else {
    const { before, after } = splitTemplate((price) => t("events.priceFrom", { price }));
    body = (
      <>
        {before && <span className="text-sm text-muted">{before}</span>}
        <span className={amount}>{fmt.money(span.min)}</span>
        {after && <span className="text-sm text-muted">{after}</span>}
      </>
    );
  }
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1", className)}>
      {body}
      {site.prices.placeholder && <Swap />}
    </span>
  );
}

/** Spots left as text, toned by status (text always says it, colour only backs it up). */
export function SpotsText({ spots, className }: { spots: Pick<EventSpots, "remaining" | "status" | "ended">; className?: string }) {
  const { t, tn } = useI18n();
  if (spots.ended) return <span className={cn("text-sm font-semibold text-muted", className)}>{t("status.past")}</span>;
  return (
    <span className={cn("text-sm font-semibold", spotsTone[spots.status], className)}>
      {spots.status === "full" ? t("status.full") : tn("spots.left", spots.remaining)}
    </span>
  );
}

/** Capacity bar + spots left for a whole event. */
export function SpotsMeter({ spots, className, aside }: { spots: EventSpots; className?: string; aside?: React.ReactNode }) {
  return (
    <div className={cn("space-y-2", className)}>
      {!spots.ended && <CapacityBar booked={spots.taken} capacity={spots.capacity} status={spots.status} />}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <SpotsText spots={spots} />
        {aside}
      </div>
    </div>
  );
}

/** Date + time line. */
export function EventWhen({ event, className, iconClassName }: { event: Pick<ParkEvent, "date" | "start" | "end">; className?: string; iconClassName?: string }) {
  const { fmt } = useI18n();
  return (
    <p className={cn("flex items-start gap-2 text-sm text-fg/85", className)}>
      <CalendarDays className={cn("mt-0.5 h-4 w-4 shrink-0 text-muted", iconClassName)} aria-hidden />
      <span>
        <span className="font-semibold text-fg">{fmt.dateWeekday(event.date)}</span>
        <span className="text-muted"> · </span>
        <span className="tabular">{fmt.timeRange(event.start, event.end)}</span>
      </span>
    </p>
  );
}
