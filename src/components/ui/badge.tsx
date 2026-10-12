"use client";

import { useI18n } from "@/i18n/provider";
import type { BookingSource, EventType, SlotStatus } from "@/types";
import { cn } from "@/lib/utils";

/** Event colour tags: race = amber, night jam = purple, group ride = sky, kids camp = rose. */
export const eventTone: Record<EventType, { text: string; bg: string; dot: string; border: string }> = {
  race: { text: "text-brand-amber", bg: "bg-brand-amber/10", dot: "bg-brand-amber", border: "border-brand-amber" },
  nightjam: { text: "text-brand-purple", bg: "bg-brand-purple/15", dot: "bg-brand-purple", border: "border-brand-purple" },
  groupride: { text: "text-brand-sky", bg: "bg-brand-sky/10", dot: "bg-brand-sky", border: "border-brand-sky" },
  kidscamp: { text: "text-brand-rose", bg: "bg-brand-rose/15", dot: "bg-brand-rose", border: "border-brand-rose" },
};

export function EventTag({ type, className }: { type: EventType; className?: string }) {
  const { t } = useI18n();
  const tone = eventTone[type];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold", tone.bg, tone.text, className)}>
      <span aria-hidden className={cn("h-1.5 w-1.5 rotate-45", tone.dot)} />
      {t(`evtype.${type}`)}
    </span>
  );
}

/** Slot status with colour AND shape/text, never colour alone. */
export function StatusBadge({ status, past, className }: { status: SlotStatus; past?: boolean; className?: string }) {
  const { t } = useI18n();
  if (past) return <span className={cn("text-xs font-semibold text-muted", className)}>{t("status.past")}</span>;
  const styles: Record<SlotStatus, string> = {
    available: "text-fg",
    almost: "text-brand-amber",
    full: "text-state-full",
    closed: "text-state-closed",
  };
  const mark: Record<SlotStatus, React.ReactNode> = {
    available: <span aria-hidden className="h-2 w-2 rounded-full bg-grad" />,
    almost: <span aria-hidden className="h-2 w-2 rounded-full bg-brand-amber" />,
    full: <span aria-hidden className="h-2 w-2 rounded-full border border-state-full" />,
    closed: <span aria-hidden className="h-2.5 w-2.5 rounded-sm border border-state-closed hatch-closed" />,
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", styles[status], className)}>
      {mark[status]}
      {t(`status.${status}`)}
    </span>
  );
}

const sourceTone: Record<BookingSource, string> = {
  website: "border-fg/25 text-fg",
  klook: "border-[#FF5B00]/50 text-[#FF8A4C]",
  whatsapp: "border-[#25D366]/45 text-[#5EDC8C]",
  walkin: "border-line-strong text-muted",
};

/** Booking source tag (admin). */
export function SourceTag({ source, className }: { source: BookingSource; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold", sourceTone[source], className)}>
      {t(`source.${source}`)}
    </span>
  );
}

/** Generic small label chip. */
export function Chip({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "amber" | "red" | "sky" | "green" | "purple"; className?: string }) {
  const tones = {
    neutral: "border-line-strong text-muted",
    amber: "border-brand-amber/50 text-brand-amber bg-brand-amber/10",
    red: "border-state-closed/50 text-state-closed bg-state-closed/10",
    sky: "border-brand-sky/50 text-brand-sky bg-brand-sky/10",
    green: "border-[#25D366]/40 text-[#5EDC8C] bg-[#25D366]/10",
    purple: "border-brand-purple/50 text-brand-purple bg-brand-purple/10",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold", tones[tone], className)}>{children}</span>;
}
