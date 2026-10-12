"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { ISODate, ParkEvent, SlotStatus } from "@/types";
import { waLink } from "@/lib/phone";
import { CapacityBar } from "@/components/ui/capacity";
import { EventTag, StatusBadge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { cn } from "@/lib/utils";

/** "Group of 7 or more? WhatsApp us" with the date prefilled. */
export function GroupLink({ date, className }: { date: ISODate; className?: string }) {
  const { t, fmt } = useI18n();
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-sm text-muted", className)}>
      {t("pump.group.lead")}
      <a
        href={waLink(site.whatsapp.display, t("pump.group.prefill", { date: fmt.dateWeekday(date) }))}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-fg"
      >
        <WhatsAppIcon className="h-4 w-4 text-[#5EDC8C]" />
        {t("pump.group.cta")}
      </a>
    </p>
  );
}

/** Small "live" marker: availability is read straight from the shared store. */
export function LivePill({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-muted", className)}>
      <span aria-hidden className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-brand-sky" />
      <span aria-hidden>{t("pump.live")}</span>
      <span className="sr-only">{t("pump.liveHint")}</span>
    </span>
  );
}

const SAMPLE: { status: SlotStatus; booked: number }[] = [
  { status: "available", booked: 5 },
  { status: "almost", booked: 10 },
  { status: "full", booked: 12 },
  { status: "closed", booked: 0 },
];

/** Status legend with the exact visuals used on the slots (bar + badge). */
export function StatusLegend({ className, bars = true }: { className?: string; bars?: boolean }) {
  const { t } = useI18n();
  return (
    <ul aria-label={t("status.legend")} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {SAMPLE.map(({ status, booked }) => (
        <li key={status} className="flex items-center gap-2">
          {bars && (
            <span aria-hidden className="block w-7">
              <CapacityBar booked={booked} capacity={12} status={status} height="h-1" />
            </span>
          )}
          <StatusBadge status={status} />
        </li>
      ))}
    </ul>
  );
}

/** Link to the event that closes the track (race day, night jam, camp). */
export function EventLink({ event, compact, className }: { event: ParkEvent; compact?: boolean; className?: string }) {
  const { t, l } = useI18n();
  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "inline-flex max-w-full rounded-md border border-line bg-ink/80 text-left font-semibold text-fg transition-colors hover:border-fg/40",
        compact ? "flex-col items-start gap-1 p-2 text-xs leading-snug" : "min-h-11 items-center gap-2 px-3 py-2 text-sm",
        className,
      )}
    >
      <EventTag type={event.type} className={compact ? "px-1.5 text-[11px]" : undefined} />
      <span className="min-w-0">{l(event.title)}</span>
      {!compact && <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />}
      <span className="sr-only"> · {t("pump.slot.eventLink")}</span>
    </Link>
  );
}
