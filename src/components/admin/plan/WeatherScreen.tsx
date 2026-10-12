"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Lock, RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { DateStrip } from "@/components/calendar/DateStrip";
import { AdminPageHeader } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { ConfirmDialog } from "@/components/ui/sheet";
import { StatTile } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { useAvailability, useBookings, useClosures, useConditions, useNowHK, useSettings } from "@/lib/hooks";
import { blockFor, hoursOn } from "@/lib/schedule";
import { bookingsAffectedBy, closePark } from "@/lib/services";
import { dateRange, fromMin, toMin, type HKNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Block, HHmm, ISODate, Locale, ScheduleSettings, WarningCode } from "@/types";
import { ClosureCard, ClosureHistory, WarningControl } from "./ClosurePanels";
import { BookingMiniList, ErrorText, Panel, PlanSkeleton, TimeSelect, Warn, WarningGlyph, formattersFor, halfHours, notOver, tally, useWhen } from "./ui";

/** Warnings that close the park, most common first. */
const CLOSURE_WARNINGS: WarningCode[] = ["black_rain", "t8", "red_rain", "thunderstorm", "t3"];
const TIMES = halfHours(6 * 60, 23 * 60 + 30);

type Range = { mode: "day" | "window"; start: HHmm; end: HHmm };

/** From the next half hour (today) or opening time, until closing. Whole day on rest days. */
function defaultRange(date: ISODate, settings: ScheduleSettings, now: HKNow): Range {
  const h = hoursOn(date, settings);
  if (!h.open) return { mode: "day", start: "10:00", end: "20:00" };
  let s = toMin(h.start);
  if (date === now.date) s = Math.max(s, Math.ceil((now.minutes + 1) / 30) * 30);
  if (s >= toMin(h.end)) return { mode: "day", start: h.start, end: h.end };
  return { mode: "window", start: fromMin(s), end: h.end };
}

/** Admin → Weather closure. */
export function WeatherScreen() {
  const { t } = useI18n();
  const now = useNowHK();
  return (
    <>
      <AdminPageHeader title={t("admin.nav.weather")} lead={t("adminPlan.weather.lead")} />
      {now ? <WeatherBody now={now} /> : <PlanSkeleton />}
    </>
  );
}

function WeatherBody({ now }: { now: HKNow }) {
  const { t } = useI18n();
  const [closures] = useClosures();
  const [focusId, setFocusId] = useState<string | null>(null);
  const active = closures
    .filter((c) => !c.reopenedAt && c.date >= now.date)
    .sort((a, b) => (a.date + (a.start ?? "")).localeCompare(b.date + (b.start ?? "")));

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`closure-${focusId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    el?.focus({ preventScroll: true });
  }, [focusId]);

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <section aria-labelledby="active-closures" className="space-y-3">
          <h2 id="active-closures" className="h-display text-xl sm:text-2xl">{t("adminPlan.weather.activeTitle")}</h2>
          {active.map((c) => (
            <ClosureCard key={c.id} closure={c} now={now} />
          ))}
        </section>
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CloseParkForm now={now} onClosed={setFocusId} />
        <div className="space-y-6">
          <WarningControl now={now} />
          <ClosureHistory now={now} />
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, id, children }: { n: number; title: string; id: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="space-y-3">
      <h3 id={id} className="flex items-center gap-2.5 text-base font-semibold">
        <span aria-hidden className="grid h-6 w-6 place-items-center rounded-sm border border-line-strong font-display text-sm font-extrabold italic text-muted [font-synthesis:none]">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function CloseParkForm({ now, onClosed }: { now: HKNow; onClosed: (id: string) => void }) {
  const { t, tn, fmt } = useI18n();
  const toast = useToast();
  const when = useWhen();
  const [settings] = useSettings();
  const [bookings] = useBookings();
  const [closures] = useClosures();
  const [conditions] = useConditions();
  const avail = useAvailability(now);
  const dates = useMemo(() => dateRange(now.date, 7), [now.date]);

  const [warning, setWarningCode] = useState<WarningCode | null>(() =>
    conditions.warning && CLOSURE_WARNINGS.includes(conditions.warning) ? conditions.warning : null,
  );
  const [date, setDate] = useState<ISODate>(now.date);
  const [range, setRange] = useState<Range>(() => defaultRange(now.date, settings, now));
  const [touched, setTouched] = useState(false);
  const [msg, setMsg] = useState<Record<Locale, string | null>>({ en: null, zh: null });
  const [tried, setTried] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const start = range.mode === "window" ? range.start : undefined;
  const end = range.mode === "window" ? range.end : undefined;
  const windowError =
    range.mode !== "window" ? undefined
    : toMin(range.end) <= toMin(range.start) ? t("adminPlan.errWindow")
    : date === now.date && toMin(range.end) <= now.minutes ? t("adminPlan.weather.errPassed")
    : undefined;

  const generated = useMemo(() => {
    if (!warning) return null;
    const make = (locale: Locale) => {
      const { t: tl, fmt: fl } = formattersFor(locale);
      const d = fl.dateWeekday(date);
      const w = start && end ? tl("adminPlan.msg.whenWindow", { date: d, window: fl.timeRange(start, end) }) : tl("adminPlan.msg.whenDay", { date: d });
      return tl("adminPlan.msg.template", { warning: tl(`warning.${warning}`), when: w });
    };
    return { en: make("en"), zh: make("zh") };
  }, [warning, date, start, end]);
  const text = { en: msg.en ?? generated?.en ?? "", zh: msg.zh ?? generated?.zh ?? "" };

  const affected = useMemo(
    () => (windowError ? [] : bookingsAffectedBy(date, start, end, "all")),
    // bookingsAffectedBy reads the live store, so re-run when bookings change
    [date, start, end, windowError, bookings],
  );
  const counts = tally(affected);
  const sessionsClosed = useMemo(() => {
    if (windowError) return 0;
    const candidate: Block[] = [{ id: "preview", date, start, end, scope: "all", reason: "weather" }];
    // a session in progress still gets closed, same as the bookings listed for it
    const pump = avail.pumpSlots(date).filter((s) => notOver(s, now) && s.status !== "closed" && blockFor(date, s.start, s.end, "pump", candidate));
    const classes = avail.sessions(date).filter((s) => notOver(s, now) && s.status !== "closed" && blockFor(date, s.start, s.end, "lessons", candidate));
    return pump.length + classes.length;
  }, [avail, date, start, end, windowError, now]);
  const sameDay = closures.filter((c) => !c.reopenedAt && c.date === date);
  const hours = hoursOn(date, settings);

  const pickDate = (d: ISODate) => {
    setDate(d);
    if (!touched) setRange(defaultRange(d, settings, now));
  };
  const editRange = (patch: Partial<Range>) => {
    setTouched(true);
    setRange((r) => ({ ...r, ...patch }));
  };

  const warningError = tried && !warning ? t("adminPlan.weather.pickWarning") : undefined;
  const msgError = tried && warning && (!text.en.trim() || !text.zh.trim()) ? t("adminPlan.weather.msgRequired") : undefined;
  const countText = t("adminPlan.withRiders", { bookings: tn("adminPlan.bookings", counts.bookings), riders: tn("riders.count", counts.riders) });

  const submit = () => {
    setTried(true);
    if (!warning || windowError || !text.en.trim() || !text.zh.trim()) return;
    setConfirming(true);
  };

  const confirm = () => {
    if (!warning) return;
    const closure = closePark({ date, start, end, warning, messageEn: text.en.trim(), messageZh: text.zh.trim() });
    toast(t("adminPlan.weather.closedToast", { when: when(closure, now.date), count: tn("adminPlan.bookings", closure.affectedBookingIds.length) }));
    // start the form afresh so the same closure can't be sent twice by accident
    setWarningCode(null);
    setDate(now.date);
    setRange(defaultRange(now.date, settings, now));
    setTouched(false);
    setMsg({ en: null, zh: null });
    setTried(false);
    onClosed(closure.id);
  };

  return (
    <Panel id="close" title={t("adminPlan.weather.formTitle")} lead={t("adminPlan.weather.formLead")}>
      <div className="space-y-8">
        <Step n={1} id="step-warning" title={t("adminPlan.weather.stepWarning")}>
          <div role="radiogroup" aria-labelledby="step-warning" aria-describedby={warningError ? "warning-error" : undefined} className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            {CLOSURE_WARNINGS.map((w) => {
              const selected = warning === w;
              return (
                <label
                  key={w}
                  className={cn(
                    "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                    "has-[:focus-visible]:shadow-[0_0_0_2px_#080808,0_0_0_4px_#EBB04A]",
                    selected ? "border-fg bg-card-2" : "border-line bg-[#0E0D0D] hover:border-line-strong",
                  )}
                >
                  <input type="radio" name="closure-warning" value={w} checked={selected} onChange={() => setWarningCode(w)} className="sr-only" />
                  <WarningGlyph code={w} />
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{t(`warning.${w}`)}</span>
                  <span aria-hidden className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-sm border", selected ? "border-fg bg-fg text-ink" : "border-line-strong")}>
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </span>
                </label>
              );
            })}
          </div>
          {warningError && <ErrorText id="warning-error">{warningError}</ErrorText>}
        </Step>

        <Step n={2} id="step-day" title={t("adminPlan.weather.stepDay")}>
          <DateStrip dates={dates} value={date} onChange={pickDate} dayState={avail.dayPump} today={now.date} />
          <p className="text-sm text-muted">
            <span className="font-semibold text-fg">{fmt.dateLong(date)}</span> ·{" "}
            {hours.open ? t("adminPlan.weather.dayHours", { hours: fmt.timeRange(hours.start, hours.end) }) : t("adminPlan.weather.dayRest")}
          </p>
          {sameDay.map((c) => (
            <Warn key={c.id}>{t("adminPlan.weather.alreadyClosed", { when: `${when(c)} · ${t(`warning.${c.warning}`)}` })}</Warn>
          ))}
        </Step>

        <Step n={3} id="step-time" title={t("adminPlan.weather.stepTime")}>
          <Segmented
            label={t("adminPlan.weather.stepTime")}
            value={range.mode}
            onChange={(mode) => editRange({ mode })}
            options={[{ value: "window", label: t("adminPlan.blocks.window") }, { value: "day", label: t("adminPlan.blocks.wholeDay") }]}
            className="w-full sm:w-auto"
          />
          {range.mode === "window" && (
            <div className="grid max-w-md grid-cols-2 gap-3">
              <Field label={t("adminPlan.blocks.from")} htmlFor="closure-start">
                <TimeSelect id="closure-start" value={range.start} options={TIMES} onChange={(v) => editRange({ start: v })} invalid={!!windowError} describedBy={windowError ? "closure-window-error" : undefined} />
              </Field>
              <Field label={t("adminPlan.blocks.to")} htmlFor="closure-end">
                <TimeSelect id="closure-end" value={range.end} options={TIMES} onChange={(v) => editRange({ end: v })} invalid={!!windowError} describedBy={windowError ? "closure-window-error" : undefined} />
              </Field>
            </div>
          )}
          {windowError && <ErrorText id="closure-window-error">{windowError}</ErrorText>}
        </Step>

        <Step n={4} id="step-affected" title={t("adminPlan.weather.stepAffected")}>
          <div aria-live="polite" className="grid grid-cols-3 gap-2">
            <StatTile label={t("adminPlan.weather.statBookings")} value={counts.bookings} />
            <StatTile label={t("adminPlan.weather.statRiders")} value={counts.riders} />
            <StatTile label={t("adminPlan.weather.statSessions")} value={sessionsClosed} />
          </div>
          {counts.bookings > 0 ? <BookingMiniList bookings={affected} limit={6} /> : <p className="text-sm text-muted">{t("adminPlan.weather.nobody")}</p>}
        </Step>

        <Step n={5} id="step-message" title={t("adminPlan.weather.stepMessage")}>
          <p className="text-sm text-muted">{warning ? t("adminPlan.weather.msgHint") : t("adminPlan.weather.msgPick")}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(["en", "zh"] as const).map((loc) => {
              const id = `closure-msg-${loc}`;
              const edited = msg[loc] !== null && msg[loc] !== generated?.[loc];
              return (
                <div key={loc} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={id} className="text-sm font-medium">
                      {t(loc === "en" ? "lang.en" : "lang.zh")}
                    </label>
                    {edited && (
                      <button type="button" onClick={() => setMsg((m) => ({ ...m, [loc]: null }))} className="inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-muted hover:text-fg">
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        {t("adminPlan.weather.msgReset")}
                      </button>
                    )}
                  </div>
                  <Textarea
                    id={id}
                    lang={loc === "zh" ? "zh-Hant-HK" : "en"}
                    rows={6}
                    value={text[loc]}
                    disabled={!warning}
                    onChange={(e) => setMsg((m) => ({ ...m, [loc]: e.target.value }))}
                    aria-invalid={msgError && !text[loc].trim() ? true : undefined}
                    aria-describedby={edited ? `${id}-note` : undefined}
                    className="min-h-40 text-sm disabled:opacity-50"
                  />
                  {edited && <Warn id={`${id}-note`}>{t("adminPlan.weather.msgStale")}</Warn>}
                </div>
              );
            })}
          </div>
          {msgError && <ErrorText>{msgError}</ErrorText>}
        </Step>

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {warning && <span className="font-semibold text-fg">{t(`warning.${warning}`)} · </span>}
            {t("adminPlan.weather.closeSummary", { when: when({ date, start, end }, now.date), count: tn("adminPlan.bookings", counts.bookings) })}
          </p>
          <Button variant="danger" size="lg" font="sans" onClick={submit} className="w-full shrink-0 text-base sm:w-auto">
            <Lock className="h-4 w-4" aria-hidden />
            {t("adminPlan.weather.close")}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("adminPlan.weather.confirmTitle")}
        confirmLabel={t("adminPlan.weather.close")}
        danger
        onConfirm={confirm}
        body={
          warning && (
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5">
                <WarningGlyph code={warning} className="h-8 w-8" />
                <span>
                  <span className="block font-semibold text-fg">{t(`warning.${warning}`)}</span>
                  <span className="block">{when({ date, start, end })}</span>
                </span>
              </li>
              <li>{counts.bookings ? t("adminPlan.weather.confirmFlag", { count: countText }) : t("adminPlan.weather.confirmNone")}</li>
              <li>{t("adminPlan.weather.confirmSite")}</li>
              <li className="text-fg">{t("adminPlan.weather.confirmUndo")}</li>
            </ul>
          )
        }
      />
    </Panel>
  );
}
