"use client";

import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { BlockReason, ISODate, ParkEvent, SlotStatus } from "@/types";
import type { SlotView } from "@/lib/schedule";
import { waLink } from "@/lib/phone";
import { diffDays } from "@/lib/time";
import { DateStrip } from "@/components/calendar/DateStrip";
import { Button, buttonVariants } from "@/components/ui/button";
import { CapacityBar } from "@/components/ui/capacity";
import { EmptyState } from "@/components/ui/empty";
import { StatusBadge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { EventLink, LivePill, StatusLegend } from "./parts";
import { eventForSlot, isBookable } from "./lib";

type Notice =
  | { kind: "rest" }
  | { kind: "done" }
  | { kind: "full" }
  | { kind: "closed"; reason: BlockReason; event?: ParkEvent };

type Item = { kind: "slot"; slot: SlotView } | { kind: "closed"; slots: SlotView[]; reason: BlockReason };

/** Back-to-back closed sessions with the same reason become one card (e.g. a night jam's 7–9pm). */
function groupClosed(slots: SlotView[]): Item[] {
  const out: Item[] = [];
  for (const s of slots) {
    if (s.status !== "closed") {
      out.push({ kind: "slot", slot: s });
      continue;
    }
    const reason = s.closedReason ?? "other";
    const last = out[out.length - 1];
    if (last?.kind === "closed" && last.reason === reason && last.slots[last.slots.length - 1].end === s.start) last.slots.push(s);
    else out.push({ kind: "closed", slots: [s], reason });
  }
  return out;
}

/** Why a day has nothing to book, or null when it has open sessions. */
function dayNotice(slots: SlotView[], events: ParkEvent[]): Notice | null {
  if (!slots.length) return { kind: "rest" };
  const live = slots.filter((s) => !s.past);
  if (!live.length) return { kind: "done" };
  if (live.some(isBookable)) return null;
  const reasons = new Set(live.map((s) => (s.status === "closed" ? (s.closedReason ?? "other") : null)));
  const [only] = [...reasons];
  if (reasons.size === 1 && only) return { kind: "closed", reason: only, event: only === "event" ? eventForSlot(live[0], events) : undefined };
  return { kind: "full" };
}

/** Phones and tablets: swipeable 14-day strip, then the chosen day's sessions as cards. */
export function DayView({
  days, today, selected, slots, dayState, events, openDay, onSelect, onOpen, className,
}: {
  days: ISODate[];
  today: ISODate;
  selected: ISODate;
  slots: SlotView[];
  dayState: (d: ISODate) => SlotStatus | "none";
  events: ParkEvent[];
  openDay: ISODate | null;
  onSelect: (d: ISODate) => void;
  onOpen: (s: SlotView, opener: HTMLElement) => void;
  className?: string;
}) {
  const { t, tn, fmt } = useI18n();
  const live = slots.filter((s) => !s.past);
  const done = slots.length - live.length;
  const open = live.filter(isBookable).length;
  const notice = dayNotice(slots, events);
  const rel = diffDays(today, selected);
  const showList = live.length > 0 && (!notice || notice.kind === "full");

  const jumpAction = openDay ? (
    <Button variant="secondary" onClick={() => onSelect(openDay)}>
      {openDay < selected && <ArrowLeft className="h-4 w-4" aria-hidden />}
      {t(openDay > selected ? "pump.next" : "pump.nearest", { date: fmt.dateWeekday(openDay) })}
      {openDay > selected && <ArrowRight className="h-4 w-4" aria-hidden />}
    </Button>
  ) : (
    <a
      href={waLink(site.whatsapp.display, t("wa.prefill"))}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: "secondary", font: "sans" })}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {t("pump.none")}
    </a>
  );

  return (
    <section aria-labelledby="pump-pick-day" className={className}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="pump-pick-day" className="h3">{t("pump.pickDay")}</h2>
        <LivePill />
      </div>
      <StatusLegend className="mt-3 hidden sm:flex" />
      {/* scroll-px keeps the 16px gutter when the strip snaps to its first day */}
      <DateStrip className="mt-4 scroll-px-4 sm:scroll-px-0" dates={days} value={selected} onChange={onSelect} dayState={dayState} today={today} />

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="h-display text-[28px]" aria-live="polite">
            <span className="text-muted">{rel === 0 ? t("fmt.today") : rel === 1 ? t("fmt.tomorrow") : fmt.weekday(selected, "long")}</span>{" "}
            {fmt.dateShort(selected)}
          </h3>
          {open > 0 && <p className="shrink-0 text-sm text-muted">{tn("pump.dayCount", open)}</p>}
        </div>

        {notice?.kind === "closed" ? (
          <ClosedDay reason={notice.reason} event={notice.event} action={jumpAction} />
        ) : notice ? (
          <EmptyState
            className="mt-4"
            title={t(`pump.empty.${notice.kind}.title`)}
            body={notice.kind === "rest" ? t("pump.empty.rest.body", { day: fmt.weekday(selected, "long") }) : t(`pump.empty.${notice.kind}.body`)}
            action={jumpAction}
          />
        ) : null}

        {showList && (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {groupClosed(live).map((item) =>
              item.kind === "slot" ? (
                <SlotCard key={item.slot.id} slot={item.slot} onOpen={onOpen} />
              ) : (
                <ClosedCard key={item.slots[0].id} slots={item.slots} reason={item.reason} events={events} />
              ),
            )}
          </ul>
        )}
        {done > 0 && live.length > 0 && <p className="mt-3 text-xs text-muted">{tn("pump.earlier", done)}</p>}
        <StatusLegend bars={false} className="mt-5 sm:hidden" />
      </div>
    </section>
  );
}

function ClosedDay({ reason, event, action }: { reason: BlockReason; event?: ParkEvent; action: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="relative mt-4 overflow-hidden rounded-lg border border-state-closed/40 bg-card">
      <span aria-hidden className="hatch-closed absolute inset-0 opacity-50" />
      <div className="relative flex flex-col items-start gap-3 p-5">
        <StatusBadge status="closed" />
        <p className="h-display text-3xl">{t("pump.empty.closed.title")}</p>
        <p className="text-sm text-fg/85">{t("pump.empty.closed.body", { reason: t(`reason.${reason}`) })}</p>
        {event && <EventLink event={event} />}
        {action}
      </div>
    </div>
  );
}

/** One session. Bookable cards are a single big tap target (overlay button keeps the markup valid). */
function SlotCard({ slot, events, onOpen }: { slot: SlotView; events: ParkEvent[]; onOpen: (s: SlotView, opener: HTMLElement) => void }) {
  const { t, fmt } = useI18n();
  const time = fmt.timeRange(slot.start, slot.end);
  const left = t("spots.ofLeft", { n: slot.remaining, cap: slot.capacity });

  if (slot.status === "closed") {
    const reason = slot.closedReason ?? "other";
    const event = reason === "event" ? eventForSlot(slot, events) : undefined;
    return (
      <li className="relative overflow-hidden rounded-lg border border-state-closed/40 bg-card">
        <span aria-hidden className="hatch-closed absolute inset-0 opacity-50" />
        <div className="relative p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="h-display text-[26px] text-fg/60">{time}</p>
            <StatusBadge status="closed" />
          </div>
          <p className="mt-1.5 text-sm font-semibold text-fg/90">{t(`reason.${reason}`)}</p>
          {event && <EventLink event={event} className="mt-3" />}
        </div>
      </li>
    );
  }

  if (!isBookable(slot)) {
    return (
      <li className="rounded-lg border border-line/70 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="h-display text-[26px] text-state-full">{time}</p>
          <StatusBadge status={slot.status} />
        </div>
        <CapacityBar booked={slot.booked} capacity={slot.capacity} status={slot.status} className="mt-3" />
      </li>
    );
  }

  return (
    <li className="group relative rounded-lg border border-line bg-card transition-colors hover:border-line-strong hover:bg-card-2">
      <div aria-hidden className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="h-display text-[26px]">{time}</span>
          <span className="inline-flex items-center gap-0.5 rounded-md border border-fg/25 py-1.5 pl-3 pr-2 font-display text-[15px] font-extrabold uppercase italic leading-none [font-synthesis:none] group-hover:border-fg">
            {t("cta.book")}
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <StatusBadge status={slot.status} />
          <span className={cn("text-xs font-semibold tabular", slot.status === "almost" ? "text-brand-amber" : "text-muted")}>{left}</span>
        </div>
        <CapacityBar booked={slot.booked} capacity={slot.capacity} status={slot.status} className="mt-2.5" />
      </div>
      <button
        type="button"
        data-slot={slot.id}
        onClick={(e) => onOpen(slot, e.currentTarget)}
        aria-label={t("pump.slot.aria", { time, date: fmt.dateWeekday(slot.date), status: t(`status.${slot.status}`), left })}
        className="absolute inset-0 rounded-lg"
      />
    </li>
  );
}
