"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { BlockReason, ISODate, ParkEvent } from "@/types";
import type { SlotView } from "@/lib/schedule";
import { addDays, dateRange, diffDays, parts, startOfWeek, toMin } from "@/lib/time";
import { CapacityBar } from "@/components/ui/capacity";
import { EmptyState } from "@/components/ui/empty";
import { StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EventLink, LivePill, StatusLegend } from "./parts";
import { eventForSlot, isBookable } from "./lib";

type Cell =
  | { kind: "empty" }
  | { kind: "covered" }
  | { kind: "slot"; slot: SlotView }
  | { kind: "closed"; slots: SlotView[]; reason: BlockReason }
  | { kind: "opens"; span: number; time: string }
  | { kind: "rest"; span: number }
  | { kind: "outside"; span: number };

const spanOf = (cell: Cell) =>
  cell.kind === "closed" ? cell.slots.length : cell.kind === "opens" || cell.kind === "rest" || cell.kind === "outside" ? cell.span : 1;

/**
 * Rows = union of start times. A run of closed slots with one reason becomes one
 * tall cell, and the hours before a day opens become one "Opens 4:00pm" cell.
 */
function buildMatrix(week: ISODate[], rows: string[], inWindow: (d: ISODate) => boolean, slotsByDay: Map<ISODate, SlotView[]>) {
  const m: Cell[][] = rows.map(() => week.map((): Cell => ({ kind: "empty" })));
  if (!rows.length) return m;
  const cover = (c: number, from: number, to: number) => {
    for (let r = from; r < to; r++) m[r][c] = { kind: "covered" };
  };
  week.forEach((d, c) => {
    const slots = inWindow(d) ? (slotsByDay.get(d) ?? []) : [];
    if (!inWindow(d) || !slots.length) {
      m[0][c] = inWindow(d) ? { kind: "rest", span: rows.length } : { kind: "outside", span: rows.length };
      cover(c, 1, rows.length);
      return;
    }
    const firstRow = rows.indexOf(slots[0].start);
    if (firstRow > 0) {
      m[0][c] = { kind: "opens", span: firstRow, time: slots[0].start };
      cover(c, 1, firstRow);
    }
    const at = new Map(slots.map((s) => [s.start, s]));
    for (let r = Math.max(0, firstRow); r < rows.length; r++) {
      if (m[r][c].kind === "covered") continue;
      const s = at.get(rows[r]);
      if (!s) continue;
      if (s.status !== "closed" || s.past) {
        m[r][c] = { kind: "slot", slot: s };
        continue;
      }
      const reason = s.closedReason ?? "other";
      const run = [s];
      for (let k = r + 1; k < rows.length; k++) {
        const n = at.get(rows[k]);
        if (!n || n.past || n.status !== "closed" || (n.closedReason ?? "other") !== reason || n.start !== run[run.length - 1].end) break;
        run.push(n);
        m[k][c] = { kind: "covered" };
      }
      m[r][c] = { kind: "closed", slots: run, reason };
    }
  });
  return m;
}

/** Desktop: one Mon–Sun week at a time across the 14-day booking window. */
export function WeekGrid({
  first, last, today, selected, slotsByDay, events, onSelect, onOpen, className,
}: {
  first: ISODate;
  last: ISODate;
  today: ISODate;
  selected: ISODate;
  slotsByDay: Map<ISODate, SlotView[]>;
  events: ParkEvent[];
  onSelect: (d: ISODate) => void;
  onOpen: (s: SlotView, opener: HTMLElement) => void;
  className?: string;
}) {
  const { t, fmt } = useI18n();
  const weekStart = startOfWeek(selected);
  const week = dateRange(weekStart, 7);
  const inWindow = (d: ISODate) => d >= first && d <= last;
  const rows = [...new Set(week.filter(inWindow).flatMap((d) => (slotsByDay.get(d) ?? []).map((s) => s.start)))].sort((a, b) => toMin(a) - toMin(b));
  const matrix = buildMatrix(week, rows, inWindow, slotsByDay);
  const weekIndex = Math.round(diffDays(startOfWeek(first), weekStart) / 7);
  const weekLabel = t(weekIndex === 0 ? "pump.week.this" : weekIndex === 1 ? "pump.week.next" : "pump.week.later");
  const range = t("pump.week.range", { a: fmt.dateShort(weekStart), b: fmt.dateShort(addDays(weekStart, 6)) });
  const canPrev = weekStart > first;
  const canNext = addDays(weekStart, 6) < last;
  const shift = (dir: 1 | -1) => {
    const d = addDays(selected, 7 * dir);
    onSelect(d < first ? first : d > last ? last : d);
  };

  return (
    <section aria-labelledby="pump-week" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label={t("btn.prevWeek")} className="grid h-11 w-11 place-items-center rounded-lg border border-line text-fg hover:border-line-strong hover:bg-white/5 disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label={t("btn.nextWeek")} className="grid h-11 w-11 place-items-center rounded-lg border border-line text-fg hover:border-line-strong hover:bg-white/5 disabled:opacity-30">
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div aria-live="polite">
            <h2 id="pump-week" className="h3">{weekLabel}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted tabular">
              {range}
              <LivePill />
            </p>
          </div>
        </div>
        <StatusLegend />
      </div>

      {!rows.length ? (
        <EmptyState className="mt-6" title={t("pump.empty.full.title")} body={t("pump.empty.full.body")} />
      ) : (
        <table className="mt-6 w-full table-fixed border-separate border-spacing-1.5">
          <caption className="sr-only">{t("pump.week.caption", { range })}</caption>
          <colgroup>
            <col className="w-[76px]" />
            {week.map((d) => (
              <col key={d} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="p-0">
                <span className="sr-only">{t("label.time")}</span>
              </th>
              {week.map((d) => (
                <th key={d} scope="col" className="p-0 align-bottom font-normal">
                  <DayHeader date={d} today={today} selected={d === selected} bookable={inWindow(d)} onSelect={onSelect} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((start, r) => (
              <tr key={start}>
                {/* the row header's height is the row's minimum, so rows holding only merged cells keep their size */}
                <th scope="row" className="h-[68px] whitespace-nowrap p-0 pr-1.5 pt-2 text-right align-top text-xs font-semibold text-muted tabular">
                  {fmt.time(start)}
                </th>
                {week.map((d, c) => {
                  const cell = matrix[r][c];
                  if (cell.kind === "covered") return null;
                  return (
                    <td key={d} rowSpan={spanOf(cell)} className="h-px p-0 align-top">
                      <GridCell cell={cell} selected={d === selected} events={events} onOpen={onOpen} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function DayHeader({ date, today, selected, bookable, onSelect }: { date: ISODate; today: ISODate; selected: boolean; bookable: boolean; onSelect: (d: ISODate) => void }) {
  const { t, fmt } = useI18n();
  const { d, m } = parts(date);
  const isToday = date === today;
  const inner = (
    <>
      <span className={cn("text-[11px] font-semibold uppercase", selected ? "text-ink/80" : "text-muted")}>{fmt.weekday(date)}</span>
      <span className="font-display text-[28px] font-extrabold italic leading-none [font-synthesis:none]">{d}</span>
      {isToday ? (
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase", selected ? "text-ink" : "text-fg")}>
          <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", selected ? "bg-ink" : "bg-grad")} />
          {t("fmt.today")}
        </span>
      ) : (
        <span className={cn("text-[10px] font-semibold", selected ? "text-ink/70" : "text-muted")}>{fmt.monthShort(m)}</span>
      )}
    </>
  );
  const base = "flex w-full flex-col items-center gap-1 rounded-lg border px-1 pb-2 pt-2";
  if (!bookable) {
    return (
      <div className={cn(base, "border-line/50 opacity-40")}>
        {inner}
        <span className="sr-only">{t("pump.week.outside")}</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      aria-pressed={selected}
      aria-label={fmt.dateLong(date)}
      className={cn(base, "transition-colors", selected ? "border-transparent bg-grad text-ink" : "border-line bg-card text-fg hover:border-line-strong")}
    >
      {inner}
    </button>
  );
}

function GridCell({ cell, selected, events, onOpen }: { cell: Cell; selected: boolean; events: ParkEvent[]; onOpen: (s: SlotView, opener: HTMLElement) => void }) {
  const { t, fmt } = useI18n();
  const frame = "relative flex h-full min-h-[68px] flex-col rounded-md border p-2";

  if (cell.kind === "empty" || cell.kind === "covered") return null;
  if (cell.kind === "outside") {
    return (
      <div className="h-full min-h-[68px] rounded-md bg-card/30">
        <span className="sr-only">{t("pump.week.outside")}</span>
      </div>
    );
  }
  if (cell.kind === "rest") {
    return <div className={cn(frame, "items-center border-dashed border-line text-xs text-muted")}>{t("reason.restday")}</div>;
  }
  if (cell.kind === "opens") {
    return (
      <div className={cn(frame, "items-center justify-end overflow-hidden border-line/40")}>
        <span aria-hidden className="pattern-dim-bg absolute inset-0 opacity-25" />
        <span className="relative rounded bg-ink/85 px-2 py-1 text-[11px] font-semibold text-muted">{t("pump.week.opens", { time: fmt.time(cell.time) })}</span>
      </div>
    );
  }
  if (cell.kind === "closed") {
    const event = cell.reason === "event" ? eventForSlot(cell.slots[0], events) : undefined;
    return (
      <div className={cn(frame, "gap-1.5 overflow-hidden border-state-closed/40 bg-card")}>
        <span aria-hidden className="hatch-closed absolute inset-0 opacity-60" />
        <span className="relative">
          <StatusBadge status="closed" />
        </span>
        <span className="relative text-xs font-semibold leading-snug text-fg/90">
          {t(`reason.${cell.reason}`)}
          <span className="sr-only"> · {fmt.timeRange(cell.slots[0].start, cell.slots[cell.slots.length - 1].end)}</span>
        </span>
        {event && <EventLink event={event} compact className="relative mt-1" />}
      </div>
    );
  }

  const s = cell.slot;
  const time = fmt.timeRange(s.start, s.end);
  if (s.past) {
    return (
      <div className={cn(frame, "border-dashed border-line/60 opacity-60")}>
        <StatusBadge status={s.status} past />
        <span className="sr-only">{time}</span>
      </div>
    );
  }
  if (!isBookable(s)) {
    return (
      <div className={cn(frame, "justify-between gap-1.5 border-line/60 bg-card/40")}>
        <StatusBadge status={s.status} />
        <span className="sr-only">{time}</span>
        <CapacityBar booked={s.booked} capacity={s.capacity} status={s.status} height="h-1" />
      </div>
    );
  }
  const left = t("spots.ofLeft", { n: s.remaining, cap: s.capacity });
  return (
    <div className={cn(frame, "group justify-between gap-1.5 bg-card transition-colors hover:border-fg/40 hover:bg-card-2", selected ? "border-line-strong" : "border-line")}>
      <div aria-hidden className="flex h-full flex-col justify-between gap-1.5">
        <StatusBadge status={s.status} />
        <span className={cn("text-[11px] font-semibold leading-none tabular", s.status === "almost" ? "text-brand-amber" : "text-muted")}>{left}</span>
        <CapacityBar booked={s.booked} capacity={s.capacity} status={s.status} height="h-1" />
      </div>
      <button
        type="button"
        data-slot={s.id}
        onClick={(e) => onOpen(s, e.currentTarget)}
        aria-label={t("pump.slot.aria", { time, date: fmt.dateWeekday(s.date), status: t(`status.${s.status}`), left })}
        className="absolute inset-0 rounded-md"
      />
    </div>
  );
}
