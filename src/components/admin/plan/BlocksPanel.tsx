"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Ban, CalendarX, CloudRain, Flag, Lock, Plus, Trash, Wrench } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { StatusBadge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Field, Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { ConfirmDialog } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useAvailability, useBlocks, useBookings, useSettings } from "@/lib/hooks";
import { blockFor, hoursOn } from "@/lib/schedule";
import { addBlock, bookingsAffectedBy, removeBlock } from "@/lib/services";
import { addDays, fromMin, toMin, type HKNow } from "@/lib/time";
import type { Block, BlockReason, HHmm, ISODate, ScheduleSettings } from "@/types";
import { BookingMiniList, DateField, DateTile, ErrorText, Panel, RadioChips, TimeSelect, Warn, halfHours, notOver, tally, useWhen } from "./ui";

const REASONS: BlockReason[] = ["maintenance", "private", "event", "weather", "other"];
const SCOPES: Block["scope"][] = ["pump", "lessons", "all"];
const TIMES = halfHours(6 * 60, 23 * 60 + 30);

const reasonIcon: Record<BlockReason, typeof Wrench> = {
  maintenance: Wrench,
  private: Lock,
  event: Flag,
  weather: CloudRain,
  other: Ban,
};

const byStart = (a: Block, b: Block) => (a.date + (a.start ?? "")).localeCompare(b.date + (b.start ?? ""));
/** Bookings in a block window that haven't finished yet (riders who still need a heads-up). */
const clashes = (date: ISODate, start: HHmm | undefined, end: HHmm | undefined, scope: Block["scope"], now: HKNow) =>
  bookingsAffectedBy(date, start, end, scope).filter((b) => notOver(b, now));

function defaultWindow(date: ISODate, settings: ScheduleSettings, now: HKNow): { start: HHmm; end: HHmm } {
  const h = hoursOn(date, settings);
  if (!h.open) return { start: "10:00", end: "12:00" };
  let s = toMin(h.start);
  if (date === now.date) {
    // today: start from the next session that hasn't begun, on the half-hour grid the time pickers use
    while (s <= now.minutes && s + settings.slotMinutes < toMin(h.end)) s += settings.slotMinutes;
    s = Math.min(Math.ceil(s / 30) * 30, toMin(h.end) - 30);
  }
  return { start: fromMin(s), end: fromMin(Math.min(s + 120, toMin(h.end))) };
}

export function BlocksPanel({ now }: { now: HKNow }) {
  const { t, tn, l } = useI18n();
  const toast = useToast();
  const when = useWhen();
  const [blocks] = useBlocks();
  const [bookings] = useBookings();
  const [removing, setRemoving] = useState<Block | null>(null);
  const upcoming = useMemo(() => blocks.filter((b) => notOver(b, now)).sort(byStart), [blocks, now]);
  const inside = useMemo(() => {
    const map = new Map<string, ReturnType<typeof tally>>();
    for (const b of upcoming) map.set(b.id, tally(clashes(b.date, b.start, b.end, b.scope, now)));
    return map;
    // bookingsAffectedBy reads the live store, so re-run when bookings change
  }, [upcoming, bookings, now]);

  const what = (b: Block) => `${t(`adminPlan.blocks.reason.${b.reason}`)} · ${t(`adminPlan.blocks.scope.${b.scope}`)}`;

  return (
    <Panel id="blocks" title={t("adminPlan.blocks.title")} lead={t("adminPlan.blocks.lead")}>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted">
            {t("adminPlan.blocks.upcoming")} <span className="tabular">({upcoming.length})</span>
          </h3>
          {upcoming.length === 0 ? (
            <EmptyState
              title={t("adminPlan.blocks.emptyTitle")}
              body={t("adminPlan.blocks.emptyBody")}
              icon={<CalendarX className="h-6 w-6 text-muted" aria-hidden />}
            />
          ) : (
            <ul className="space-y-2">
              {upcoming.map((b) => {
                const Icon = reasonIcon[b.reason];
                const c = inside.get(b.id);
                return (
                  <li key={b.id} className="flex gap-3 rounded-lg border border-line bg-[#0E0D0D] p-3">
                    <DateTile date={b.date} today={now.date} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                        <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                        {t(`adminPlan.blocks.reason.${b.reason}`)}
                        <span className="rounded border border-line-strong px-1.5 py-px text-[11px] font-semibold text-muted">{t(`adminPlan.blocks.scope.${b.scope}`)}</span>
                        {b.closureId && <span className="rounded border border-state-closed/50 px-1.5 py-px text-[11px] font-semibold text-state-closed">{t("adminPlan.blocks.fromClosure")}</span>}
                      </p>
                      <p className="mt-0.5 text-sm tabular">{when(b, now.date)}</p>
                      {b.note && <p className="mt-0.5 truncate text-xs text-muted">{typeof b.note === "string" ? b.note : l(b.note)}</p>}
                      {c && c.bookings > 0 && (
                        <Warn className="mt-1">
                          {t("adminPlan.blocks.inside", { count: t("adminPlan.withRiders", { bookings: tn("adminPlan.bookings", c.bookings), riders: tn("riders.count", c.riders) }) })}
                        </Warn>
                      )}
                    </div>
                    <div className="shrink-0 self-start">
                      {b.closureId ? (
                        <Link href="/admin/weather" className={buttonVariants({ variant: "ghost", size: "sm", font: "sans" })}>
                          {t("adminPlan.blocks.manage")}
                        </Link>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          font="sans"
                          onClick={() => setRemoving(b)}
                          aria-label={t("adminPlan.blocks.removeLabel", { what: what(b), when: when(b, now.date) })}
                          className="hover:text-state-closed"
                        >
                          <Trash className="h-4 w-4" aria-hidden />
                          <span className="hidden sm:inline">{t("btn.remove")}</span>
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <AddBlockForm now={now} />
      </div>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={t("adminPlan.blocks.removeTitle")}
        confirmLabel={t("btn.remove")}
        onConfirm={() => {
          if (!removing) return;
          removeBlock(removing.id);
          toast(t("adminPlan.blocks.removed"));
        }}
        body={removing && t("adminPlan.blocks.removeBody", { what: what(removing), when: when(removing) })}
      />
    </Panel>
  );
}

function AddBlockForm({ now }: { now: HKNow }) {
  const { t, tn } = useI18n();
  const toast = useToast();
  const when = useWhen();
  const [settings] = useSettings();
  const [bookings] = useBookings();
  const [blocks] = useBlocks();
  const avail = useAvailability(now);
  const [date, setDate] = useState<ISODate>(now.date);
  const [mode, setMode] = useState<"day" | "window">("window");
  const [times, setTimes] = useState(() => defaultWindow(now.date, settings, now));
  const [touched, setTouched] = useState(false);
  const [scope, setScope] = useState<Block["scope"]>("pump");
  const [reason, setReason] = useState<BlockReason>("maintenance");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);

  const windowError = mode === "window" && toMin(times.end) <= toMin(times.start) ? t("adminPlan.errWindow") : undefined;
  const start = mode === "window" ? times.start : undefined;
  const end = mode === "window" ? times.end : undefined;

  const affected = useMemo(
    () => (windowError ? [] : clashes(date, start, end, scope, now)),
    // bookingsAffectedBy reads the live store, so re-run when bookings change
    [date, start, end, scope, windowError, bookings, now],
  );
  const already = windowError
    ? []
    : blocks.filter(
        (b) =>
          b.date === date &&
          (b.scope === "all" || scope === "all" || b.scope === scope) &&
          (!b.start || !b.end || !start || !end || (toMin(b.start) < toMin(end) && toMin(start) < toMin(b.end))),
      );
  const counts = tally(affected);

  const closes = useMemo(() => {
    if (windowError) return { pump: 0, lessons: 0 };
    const candidate: Block[] = [{ id: "preview", date, start, end, scope, reason }];
    // count sessions that haven't finished (one in progress still closes), matching the bookings listed below
    const pump = scope === "lessons" ? 0 : avail.pumpSlots(date).filter((s) => notOver(s, now) && s.status !== "closed" && blockFor(date, s.start, s.end, "pump", candidate)).length;
    const lessonCount = scope === "pump" ? 0 : avail.sessions(date).filter((s) => notOver(s, now) && s.status !== "closed" && blockFor(date, s.start, s.end, "lessons", candidate)).length;
    return { pump, lessons: lessonCount };
  }, [avail, date, start, end, scope, reason, windowError, now]);

  const closesList = [
    closes.pump > 0 ? tn("adminPlan.count.pump", closes.pump) : null,
    closes.lessons > 0 ? tn("adminPlan.count.lessons", closes.lessons) : null,
  ].filter((x): x is string => !!x);

  const pickDate = (d: ISODate) => {
    setDate(d);
    if (!touched) setTimes(defaultWindow(d, settings, now));
  };
  const setTime = (patch: Partial<{ start: HHmm; end: HHmm }>) => {
    setTouched(true);
    setTimes((x) => ({ ...x, ...patch }));
  };

  const clashText = t("adminPlan.blocks.clash", { bookings: tn("adminPlan.bookings", counts.bookings), riders: tn("riders.count", counts.riders) });

  const confirm = () => {
    addBlock({ date, start, end, scope, reason, note: note.trim() || undefined });
    toast(t("adminPlan.blocks.added"));
    // fresh form, so the same block isn't added twice by accident
    setDate(now.date);
    setMode("window");
    setTimes(defaultWindow(now.date, settings, now));
    setTouched(false);
    setScope("pump");
    setReason("maintenance");
    setNote("");
  };

  return (
    <form
      aria-labelledby="add-block-title"
      onSubmit={(e) => {
        e.preventDefault();
        if (!windowError) setConfirming(true);
      }}
      className="space-y-5 rounded-lg border border-line bg-card-2/50 p-4 xl:self-start"
    >
      <h3 id="add-block-title" className="flex items-center gap-2 text-base font-semibold">
        <Plus className="h-4 w-4 text-muted" aria-hidden />
        {t("adminPlan.blocks.formTitle")}
      </h3>

      <DateField id="block-date" label={t("label.date")} value={date} onChange={pickDate} min={now.date} max={addDays(now.date, 365)} today={now.date} />

      <div className="space-y-2">
        <p className="text-sm font-medium">{t("adminPlan.blocks.length")}</p>
        <Segmented
          label={t("adminPlan.blocks.length")}
          value={mode}
          onChange={setMode}
          options={[{ value: "window", label: t("adminPlan.blocks.window") }, { value: "day", label: t("adminPlan.blocks.wholeDay") }]}
          className="w-full"
        />
        {mode === "window" && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Field label={t("adminPlan.blocks.from")} htmlFor="block-start">
              <TimeSelect id="block-start" value={times.start} options={TIMES} onChange={(v) => setTime({ start: v })} invalid={!!windowError} describedBy={windowError ? "block-window-error" : undefined} />
            </Field>
            <Field label={t("adminPlan.blocks.to")} htmlFor="block-end">
              <TimeSelect id="block-end" value={times.end} options={TIMES} onChange={(v) => setTime({ end: v })} invalid={!!windowError} describedBy={windowError ? "block-window-error" : undefined} />
            </Field>
            {windowError && <ErrorText id="block-window-error" className="col-span-2">{windowError}</ErrorText>}
          </div>
        )}
      </div>

      <RadioChips<Block["scope"]>
        name="block-scope"
        legend={t("adminPlan.blocks.scope")}
        value={scope}
        onChange={setScope}
        options={SCOPES.map((s) => ({ value: s, label: t(`adminPlan.blocks.scope.${s}`) }))}
      />

      <RadioChips<BlockReason>
        name="block-reason"
        legend={t("adminPlan.blocks.reason")}
        value={reason}
        onChange={setReason}
        options={REASONS.map((r) => {
          const Icon = reasonIcon[r];
          return { value: r, label: t(`adminPlan.blocks.reason.${r}`), icon: <Icon className="h-4 w-4" aria-hidden /> };
        })}
      />

      <Field label={t("adminPlan.blocks.note")} htmlFor="block-note" optional={t("label.optional")}>
        <Input id="block-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("adminPlan.blocks.notePh")} maxLength={120} />
      </Field>

      <div aria-live="polite" className="space-y-3 rounded-md border border-line bg-[#0E0D0D] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("adminPlan.blocks.preview")}</p>
        <p className="text-sm">
          {closesList.length
            ? t("adminPlan.blocks.closes", { list: closesList.length === 2 ? t("adminPlan.and", { a: closesList[0], b: closesList[1] }) : closesList[0] })
            : t("adminPlan.blocks.nothing")}
        </p>
        {already.map((b) => (
          <Warn key={b.id} className="text-sm">
            {t("adminPlan.blocks.already", { what: `${t(`adminPlan.blocks.reason.${b.reason}`)} · ${t(`adminPlan.blocks.scope.${b.scope}`)}`, when: when(b, now.date) })}
          </Warn>
        ))}
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">{t("adminPlan.blocks.ridersSee")}</span>
          <StatusBadge status="closed" />
          <span className="text-fg/90">{t(`reason.${reason}`)}</span>
        </p>
        {counts.bookings > 0 ? (
          <div className="space-y-2">
            <Warn className="text-sm">{clashText}</Warn>
            <BookingMiniList bookings={affected} limit={4} compact />
          </div>
        ) : (
          !windowError && <p className="text-sm text-muted">{t("adminPlan.blocks.noClash")}</p>
        )}
      </div>

      <Button type="submit" font="sans" className="w-full" disabled={!!windowError}>
        {t("adminPlan.blocks.submit")}
      </Button>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("adminPlan.blocks.confirmTitle")}
        confirmLabel={t("adminPlan.blocks.submit")}
        onConfirm={confirm}
        body={
          <div className="space-y-2">
            <p>
              {t("adminPlan.blocks.confirmBody", {
                scope: t(`adminPlan.blocks.scope.${scope}`),
                when: when({ date, start, end }),
                reason: t(`adminPlan.blocks.reason.${reason}`),
              })}
            </p>
            {counts.bookings > 0 && <Warn className="text-sm">{t("adminPlan.blocks.confirmClash", { clash: clashText })}</Warn>}
          </div>
        }
      />
    </form>
  );
}
