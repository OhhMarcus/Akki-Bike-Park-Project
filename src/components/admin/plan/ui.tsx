"use client";

import { useRef, useState } from "react";
import { CalendarDays, ChevronDown, CloudLightning, CloudRain, Sun, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { dictionary, type MessageKey } from "@/i18n/dictionary";
import { createFormatters } from "@/i18n/format";
import { interpolate } from "@/i18n/shared";
import { MonthGrid, MonthNav } from "@/components/calendar/MonthCalendar";
import { Select } from "@/components/ui/field";
import { useEvents } from "@/lib/hooks";
import { bookingTitle } from "@/lib/labels";
import { addDays, fromMin, hkNow, parts, toMin } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Booking, HHmm, ISODate, Locale, LocalizedText, WarningCode } from "@/types";

/* ---------- formatting helpers ---------- */

/** t + fmt for a fixed language (rider messages are written in both, whatever the UI language). */
export function formattersFor(locale: Locale) {
  const t = (key: MessageKey, vars?: Record<string, string | number>) => interpolate((dictionary[key] as LocalizedText)[locale], vars);
  return { t, fmt: createFormatters(locale, t) };
}

/** Bookings, riders and distinct phone numbers in a list. */
export function tally(bookings: Booking[]) {
  return {
    bookings: bookings.length,
    riders: bookings.reduce((s, b) => s + b.riders, 0),
    contacts: new Set(bookings.map((b) => b.phone)).size,
  };
}

/** "Mon 12 Oct, 5:00–8:00pm" / "Today, all day". `rel` uses Today/Tomorrow. */
export function useWhen() {
  const { t, fmt } = useI18n();
  return (o: { date: ISODate; start?: HHmm; end?: HHmm }, today?: ISODate) => {
    const date = today ? fmt.relDay(o.date, today) : fmt.dateWeekday(o.date);
    return o.start && o.end ? t("adminPlan.when.window", { date, window: fmt.timeRange(o.start, o.end) }) : t("adminPlan.when.day", { date });
  };
}

/** "Today, 2:31pm" for an ISO timestamp, in Hong Kong time. */
export function useStamp() {
  const { t, fmt } = useI18n();
  return (iso: string, today: ISODate) => {
    const n = hkNow(Date.parse(iso));
    return t("adminPlan.stamp", { day: fmt.relDay(n.date, today), time: fmt.time(fromMin(n.minutes)) });
  };
}

/** Half-hour times between two minute marks, inclusive. */
export function halfHours(from = 6 * 60, to = 23 * 60 + 30): HHmm[] {
  const out: HHmm[] = [];
  for (let m = from; m <= to; m += 30) out.push(fromMin(m));
  return out;
}

export const upcomingFrom = (b: Pick<Booking, "date" | "start">, now: { date: ISODate; minutes: number }) =>
  b.date > now.date || (b.date === now.date && toMin(b.start) > now.minutes);

/* ---------- layout ---------- */

/** Section card used on the planning screens. */
export function Panel({
  id, title, titleExtra, lead, actions, children, className, bodyClassName,
}: {
  id: string; title: string; titleExtra?: React.ReactNode; lead?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("surface scroll-mt-24", className)}>
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="h-display text-xl sm:text-2xl">
            {title}
            {titleExtra}
          </h2>
          {lead && <p className="mt-1 max-w-2xl text-sm text-muted">{lead}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Small amber warning line (icon + text, never colour alone). */
export function Warn({ children, id, className }: { children: React.ReactNode; id?: string; className?: string }) {
  return (
    <p id={id} className={cn("flex items-start gap-1.5 text-xs font-medium text-brand-amber", className)}>
      <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Red inline error. */
export function ErrorText({ children, id, className }: { children: React.ReactNode; id?: string; className?: string }) {
  return (
    <p id={id} role="alert" className={cn("text-xs font-medium text-state-closed", className)}>
      {children}
    </p>
  );
}

/* ---------- controls ---------- */

/** On/off switch. Squared to match the brand (no pills). Pass visible text as children. */
export function Switch({
  checked, onChange, label, disabled, id, className, children, describedBy,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean; id?: string; className?: string; children?: React.ReactNode; describedBy?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("group inline-flex min-h-9 items-center gap-2.5 rounded-md text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40", className)}
    >
      <span aria-hidden className={cn("relative inline-block h-5 w-9 shrink-0 rounded transition-colors", checked ? "bg-fg" : "bg-line-strong group-hover:bg-[#4A4646]")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-sm transition-transform", checked ? "translate-x-[18px] bg-ink" : "translate-x-0.5 bg-muted")} />
      </span>
      {children}
    </button>
  );
}

/** Time picker in 30-minute steps, labelled with fmt.time. */
export function TimeSelect({
  id, value, onChange, options, invalid, describedBy, disabled, label, className,
}: {
  id: string; value: HHmm; onChange: (v: HHmm) => void; options: HHmm[]; invalid?: boolean; describedBy?: string; disabled?: boolean; label?: string; className?: string;
}) {
  const { fmt } = useI18n();
  const opts = options.includes(value) ? options : [...options, value].sort((a, b) => toMin(a) - toMin(b));
  return (
    <Select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn("tabular disabled:opacity-40", className)}
    >
      {opts.map((o) => (
        <option key={o} value={o}>
          {fmt.time(o)}
        </option>
      ))}
    </Select>
  );
}

/** Pick-one chips (radio group). Selected = off-white, like Segmented. */
export function RadioChips<T extends string>({
  name, legend, value, onChange, options, className, error,
}: {
  name: string;
  legend: React.ReactNode;
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[];
  className?: string;
  error?: string;
}) {
  return (
    <fieldset className={className} aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                "relative inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors",
                "has-[:focus-visible]:shadow-[0_0_0_2px_#080808,0_0_0_4px_#EBB04A]",
                active ? "border-fg bg-fg text-ink" : "border-line bg-[#0E0D0D] text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              <input type="radio" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
              {o.icon}
              {o.label}
            </label>
          );
        })}
      </div>
      {error && <ErrorText id={`${name}-error`} className="mt-1.5">{error}</ErrorText>}
    </fieldset>
  );
}

/** A date button that opens an inline month calendar. Selected day = brand gradient. */
export function DateField({
  id, label, value, onChange, min, max, today, className,
}: {
  id: string; label: string; value: ISODate; onChange: (d: ISODate) => void; min: ISODate; max: ISODate; today: ISODate; className?: string;
}) {
  const { t, fmt } = useI18n();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => ({ y: parts(value).y, m: parts(value).m }));
  const grid = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const ym = (d: ISODate) => ({ y: parts(d).y, m: parts(d).m });
  const inMonth = (d: ISODate) => parts(d).y === month.y && parts(d).m === month.m;
  let focusable = value;
  if (!inMonth(value)) {
    focusable = `${month.y}-${String(month.m).padStart(2, "0")}-01`;
    while (focusable < min) focusable = addDays(focusable, 1);
  }

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => button.current?.focus());
  };
  const focusDate = (d: ISODate) => {
    if (!inMonth(d)) setMonth(ym(d));
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${d}"]`)?.focus());
  };

  return (
    <div className={className}>
      <span id={`${id}-label`} className="mb-1.5 block text-sm font-medium">
        {label}
      </span>
      <button
        ref={button}
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-calendar`}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => {
          setMonth(ym(value));
          setOpen((o) => !o);
        }}
        className="field flex items-center justify-between gap-3 text-left"
      >
        <span id={`${id}-value`} className="truncate">{fmt.dateLong(value)}</span>
        <span className="flex shrink-0 items-center gap-1 text-muted">
          <CalendarDays className="h-4 w-4" aria-hidden />
          <span className="sr-only">{t("adminPlan.date.change")}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
        </span>
      </button>
      {open && (
        <div
          id={`${id}-calendar`}
          className="mt-2 rounded-lg border border-line bg-card-2 p-3"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
        >
          <MonthNav month={month} onChange={setMonth} min={ym(min)} max={ym(max)} />
          <div ref={grid} className="mt-3">
            <MonthGrid
              month={month}
              renderCell={(date, inside) => {
                if (!inside) return <span aria-hidden className="block aspect-square" />;
                const disabled = date < min || date > max;
                const selected = date === value;
                return (
                  <button
                    type="button"
                    data-date={date}
                    disabled={disabled}
                    aria-pressed={selected}
                    aria-label={date === today ? `${t("fmt.today")} · ${fmt.dateLong(date)}` : fmt.dateLong(date)}
                    tabIndex={date === focusable ? 0 : -1}
                    onClick={() => {
                      onChange(date);
                      close();
                    }}
                    onKeyDown={(e) => {
                      const step = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 } as Record<string, number>)[e.key];
                      if (!step) return;
                      e.preventDefault();
                      const d = addDays(date, step);
                      if (d >= min && d <= max) focusDate(d);
                    }}
                    className={cn(
                      "grid aspect-square w-full place-items-center rounded-md text-sm font-semibold tabular transition-colors",
                      selected ? "bg-grad text-ink" : "text-fg hover:bg-white/[.06]",
                      disabled && "text-muted/40 hover:bg-transparent",
                      date === today && !selected && "border border-line-strong",
                    )}
                  >
                    {parts(date).d}
                  </button>
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- display ---------- */

/** Compact calendar tile: weekday, day number, month. */
export function DateTile({ date, today, className }: { date: ISODate; today: ISODate; className?: string }) {
  const { t, fmt } = useI18n();
  const { d, m } = parts(date);
  return (
    <div className={cn("flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-line bg-card-2 leading-none", className)}>
      <span className="text-[10px] font-semibold uppercase text-muted">{date === today ? t("fmt.today") : fmt.weekday(date)}</span>
      <span className="font-display text-2xl font-extrabold italic leading-none [font-synthesis:none]">{d}</span>
      <span className="text-[10px] font-semibold text-muted">{fmt.monthShort(m)}</span>
    </div>
  );
}

/** HK Observatory warning glyph: rainstorm colours, signal numbers, lightning. */
export function WarningGlyph({ code, className }: { code: WarningCode; className?: string }) {
  const base = "grid h-9 w-9 shrink-0 place-items-center rounded-md border";
  switch (code) {
    case "black_rain":
      return <span aria-hidden className={cn(base, "border-fg/60 bg-black text-fg", className)}><CloudRain className="h-5 w-5" /></span>;
    case "red_rain":
      return <span aria-hidden className={cn(base, "border-state-closed/60 bg-state-closed/15 text-state-closed", className)}><CloudRain className="h-5 w-5" /></span>;
    case "amber_rain":
      return <span aria-hidden className={cn(base, "border-brand-amber/60 bg-brand-amber/10 text-brand-amber", className)}><CloudRain className="h-5 w-5" /></span>;
    case "thunderstorm":
      return <span aria-hidden className={cn(base, "border-line-strong bg-card-2 text-brand-amber", className)}><CloudLightning className="h-5 w-5" /></span>;
    case "very_hot":
      return <span aria-hidden className={cn(base, "border-line-strong bg-card-2 text-brand-amber", className)}><Sun className="h-5 w-5" /></span>;
    case "t8":
    case "t3":
      return (
        <span aria-hidden className={cn(base, "border-line-strong bg-card-2 font-display text-xl font-extrabold italic text-fg [font-synthesis:none]", className)}>
          {code === "t8" ? 8 : 3}
        </span>
      );
  }
}

/**
 * Compact booking list: time, rider (+ headcount), what, phone. Used for
 * closure previews, block clashes and flagged bookings.
 */
export function BookingMiniList({
  bookings, limit = 6, trailing, className, compact,
}: {
  bookings: Booking[];
  limit?: number;
  trailing?: (b: Booking) => React.ReactNode;
  className?: string;
  /** keep the stacked phone layout at every width (narrow columns) */
  compact?: boolean;
}) {
  const { t, tn, l, fmt } = useI18n();
  const [events] = useEvents();
  const [all, setAll] = useState(false);
  const sorted = [...bookings].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start) || a.riderName.localeCompare(b.riderName));
  const shown = all ? sorted : sorted.slice(0, limit);
  return (
    <div className={className}>
      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-[#0E0D0D]">
        {shown.map((b) => {
          const phone = (
            <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="tabular text-muted hover:text-fg">
              {b.phone}
            </a>
          );
          return (
            <li
              key={b.id}
              className={cn(
                "px-3 py-2 text-sm",
                !compact && "sm:grid sm:items-center sm:gap-x-3",
                !compact && (trailing ? "sm:grid-cols-[132px_minmax(0,1fr)_128px_104px]" : "sm:grid-cols-[132px_minmax(0,1fr)_128px]"),
              )}
            >
              <div className={cn("flex items-baseline justify-between gap-3", !compact && "sm:contents")}>
                <span className="whitespace-nowrap tabular text-muted">{fmt.timeRange(b.start, b.end)}</span>
                <span className={cn("shrink-0 text-right text-xs", !compact && "sm:order-last")}>{trailing ? trailing(b) : phone}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {b.riderName}
                  {b.riders > 1 && <span className="font-normal text-muted"> · {tn("riders.count", b.riders)}</span>}
                </p>
                <p className="truncate text-xs text-muted">
                  {l(bookingTitle(b, events))}
                  {trailing && <span className={cn(!compact && "sm:hidden")}> · {b.phone}</span>}
                </p>
              </div>
              {!compact && trailing && <span className="hidden text-xs sm:block">{phone}</span>}
            </li>
          );
        })}
      </ul>
      {sorted.length > limit && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 min-h-9 text-sm font-semibold text-muted underline decoration-fg/30 underline-offset-4 hover:text-fg">
          {all ? t("adminPlan.showLess") : t("adminPlan.showAll", { n: sorted.length })}
        </button>
      )}
    </div>
  );
}
