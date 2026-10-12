"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { defaultSchedule } from "@/config/schedule";
import { Swap } from "@/components/brand/Swap";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { ConfirmDialog } from "@/components/ui/sheet";
import { NumberStepper } from "@/components/ui/stepper";
import { useToast } from "@/components/ui/toast";
import { useBookings, useSettings } from "@/lib/hooks";
import { buildIndex, pumpSlotsOn } from "@/lib/schedule";
import { updateSettings } from "@/lib/services";
import { toMin, type HKNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Booking, ISODate, PumpTrackDayHours, ScheduleSettings } from "@/types";
import { ErrorText, Panel, Switch, TimeSelect, halfHours, tally, upcomingFrom, useStamp } from "./ui";

type HoursDraft = Pick<ScheduleSettings, "pumpHours" | "slotMinutes" | "slotCapacity">;

/** Monday first, like the public hours list. */
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const SLOT_OPTIONS = [30, 45, 60, 90];
const START_TIMES = halfHours(6 * 60, 23 * 60);
const END_TIMES = halfHours(6 * 60 + 30, 23 * 60 + 30);

function normalize(s: HoursDraft): HoursDraft {
  return {
    slotMinutes: s.slotMinutes,
    slotCapacity: s.slotCapacity,
    pumpHours: ORDER.map((wd) => s.pumpHours.find((h) => h.weekday === wd) ?? { weekday: wd, open: false, start: "10:00", end: "20:00" }),
  };
}

/** Upcoming pump bookings that no longer match a session, and sessions that would be over the new limit. */
function hoursImpact(bookings: Booking[], next: ScheduleSettings, now: HKNow) {
  const empty = buildIndex([]);
  const ids = new Map<ISODate, Set<string>>();
  const slotsOn = (date: ISODate) => {
    let s = ids.get(date);
    if (!s) {
      s = new Set(pumpSlotsOn(date, next, empty, []).map((x) => x.id));
      ids.set(date, s);
    }
    return s;
  };
  const upcoming = bookings.filter((b) => b.kind === "pump" && b.status === "confirmed" && upcomingFrom(b, now));
  const outside = upcoming.filter((b) => !slotsOn(b.date).has(b.targetId));
  const perSlot = new Map<string, number>();
  for (const b of upcoming) if (slotsOn(b.date).has(b.targetId)) perSlot.set(b.targetId, (perSlot.get(b.targetId) ?? 0) + b.riders);
  const over = [...perSlot.values()].filter((n) => n > next.slotCapacity).length;
  return { outside, over };
}

export function PumpHoursPanel({ now }: { now: HKNow }) {
  const { t, tn, fmt } = useI18n();
  const toast = useToast();
  const stamp = useStamp();
  const [settings] = useSettings();
  const [bookings] = useBookings();
  const saved = useMemo(
    () => normalize({ pumpHours: settings.pumpHours, slotMinutes: settings.slotMinutes, slotCapacity: settings.slotCapacity }),
    [settings],
  );
  const [draft, setDraft] = useState<HoursDraft | null>(null);
  const [impact, setImpact] = useState<ReturnType<typeof hoursImpact> | null>(null);
  const cur = draft ?? saved;
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);

  const edit = (patch: Partial<HoursDraft>) => setDraft({ ...cur, ...patch });
  const editDay = (wd: number, patch: Partial<PumpTrackDayHours>) =>
    edit({ pumpHours: cur.pumpHours.map((h) => (h.weekday === wd ? { ...h, ...patch } : h)) });

  const errors: Record<number, string | undefined> = {};
  let weekSessions = 0;
  for (const h of cur.pumpHours) {
    if (!h.open) continue;
    const len = toMin(h.end) - toMin(h.start);
    if (len <= 0) errors[h.weekday] = t("adminPlan.errWindow");
    else if (len < cur.slotMinutes) errors[h.weekday] = t("adminPlan.hours.errShort", { n: cur.slotMinutes });
    else weekSessions += Math.floor(len / cur.slotMinutes);
  }
  const hasErrors = Object.values(errors).some(Boolean);

  const commit = () => {
    updateSettings((s) => ({ ...s, ...cur }));
    setDraft(null);
    setImpact(null);
    toast(t("adminPlan.hours.saved"));
  };

  const onSave = () => {
    if (hasErrors) {
      toast(t("adminPlan.hours.fixErrors"), "error");
      return;
    }
    const im = hoursImpact(bookings, { ...settings, ...cur }, now);
    if (im.outside.length || im.over) setImpact(im);
    else commit();
  };

  const outside = impact ? tally(impact.outside) : null;
  /** Affected bookings grouped by session, soonest first. */
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; date: ISODate; start: string; bookings: Booking[] }>();
    for (const b of impact?.outside ?? []) {
      const key = `${b.date}|${b.start}`;
      const g = map.get(key) ?? { key, date: b.date, start: b.start, bookings: [] };
      g.bookings.push(b);
      map.set(key, g);
    }
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [impact]);

  return (
    <Panel id="hours" title={t("adminPlan.hours.title")} titleExtra={<Swap />} lead={t("adminPlan.hours.lead")} bodyClassName="p-0 sm:p-0">
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div aria-hidden className="hidden grid-cols-[120px_118px_minmax(0,1fr)_minmax(0,1fr)] gap-x-3 border-b border-line pb-2 text-xs font-semibold text-muted sm:grid lg:grid-cols-[132px_118px_minmax(0,1fr)_minmax(0,1fr)_120px]">
            <span>{t("adminPlan.hours.day")}</span>
            <span>{t("label.status")}</span>
            <span>{t("adminPlan.hours.opens")}</span>
            <span>{t("adminPlan.hours.closes")}</span>
            <span className="hidden text-right lg:block">{t("adminPlan.hours.sessionsHead")}</span>
          </div>
          <ul className="divide-y divide-line">
            {cur.pumpHours.map((h) => {
              const day = fmt.weekday(h.weekday, "long");
              const err = errors[h.weekday];
              const errId = `hours-${h.weekday}-error`;
              const len = toMin(h.end) - toMin(h.start);
              const count = h.open && len > 0 ? Math.floor(len / cur.slotMinutes) : 0;
              const left = h.open && len > 0 ? len % cur.slotMinutes : 0;
              const sessions = (
                <>
                  {tn("adminPlan.hours.sessions", count)}
                  {left > 0 && ` · ${t("adminPlan.hours.leftover", { n: left })}`}
                </>
              );
              return (
                <li
                  key={h.weekday}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[120px_118px_minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[132px_118px_minmax(0,1fr)_minmax(0,1fr)_120px]"
                >
                  <div className="min-w-0">
                    <p className={cn("font-semibold", !h.open && "text-muted")}>{day}</p>
                    <p className="text-xs text-muted sm:hidden">{h.open ? !err && sessions : t("adminPlan.hours.restDay")}</p>
                  </div>
                  <Switch checked={h.open} onChange={(v) => editDay(h.weekday, { open: v })} label={t("adminPlan.hours.openOn", { day })}>
                    <span className={cn("w-12", h.open ? "text-fg" : "text-muted")}>{h.open ? t("adminPlan.hours.open") : t("adminPlan.hours.closed")}</span>
                  </Switch>
                  {h.open ? (
                    <>
                      <div className="col-span-2 grid grid-cols-2 gap-2 sm:contents">
                        <label className="space-y-1 sm:space-y-0">
                          <span className="block text-xs text-muted sm:sr-only">{t("adminPlan.hours.opens")}</span>
                          <TimeSelect
                            id={`hours-${h.weekday}-start`}
                            value={h.start}
                            options={START_TIMES}
                            onChange={(v) => editDay(h.weekday, { start: v })}
                            invalid={!!err}
                            describedBy={err ? errId : undefined}
                            label={`${day} · ${t("adminPlan.hours.opens")}`}
                          />
                        </label>
                        <label className="space-y-1 sm:space-y-0">
                          <span className="block text-xs text-muted sm:sr-only">{t("adminPlan.hours.closes")}</span>
                          <TimeSelect
                            id={`hours-${h.weekday}-end`}
                            value={h.end}
                            options={END_TIMES}
                            onChange={(v) => editDay(h.weekday, { end: v })}
                            invalid={!!err}
                            describedBy={err ? errId : undefined}
                            label={`${day} · ${t("adminPlan.hours.closes")}`}
                          />
                        </label>
                      </div>
                      {err ? (
                        <ErrorText id={errId} className="col-span-2 sm:col-span-4 lg:col-span-1 lg:text-right">{err}</ErrorText>
                      ) : (
                        <p className="hidden text-xs text-muted sm:col-span-4 sm:block lg:col-span-1 lg:text-right">{sessions}</p>
                      )}
                    </>
                  ) : (
                    <p className="hidden text-sm text-muted sm:col-span-2 sm:block lg:col-span-3">{t("adminPlan.hours.restDay")}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-6 xl:border-l xl:border-line xl:pl-8">
          <div>
            <p className="mb-2 text-sm font-medium">
              {t("adminPlan.hours.slot")}
              <Swap />
            </p>
            <Segmented
              label={t("adminPlan.hours.slot")}
              value={String(cur.slotMinutes)}
              onChange={(v) => edit({ slotMinutes: Number(v) })}
              options={SLOT_OPTIONS.map((n) => ({ value: String(n), label: t("fmt.minutes", { n }) }))}
              className="w-full max-w-sm"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">
              {t("adminPlan.hours.capacity")}
              <Swap />
            </p>
            <NumberStepper value={cur.slotCapacity} onChange={(n) => edit({ slotCapacity: n })} min={1} max={40} label={t("adminPlan.hours.capacity")} />
            <p className="mt-2 text-xs text-muted">{t("adminPlan.hours.capacityHint")}</p>
          </div>
          <p className="border-t border-line pt-4 text-sm text-muted">
            {t("adminPlan.hours.week", { sessions: tn("adminPlan.hours.sessions", weekSessions), places: fmt.number(weekSessions * cur.slotCapacity) })}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5",
          dirty && "sticky bottom-0 z-10 rounded-b-lg bg-card/95 backdrop-blur",
        )}
      >
        <p className="text-sm" aria-live="polite">
          {dirty ? (
            <span className="inline-flex items-center gap-2 font-semibold text-brand-amber">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-amber" />
              {t("adminPlan.hours.unsaved")}
            </span>
          ) : (
            <span className="text-muted">
              {settings.updatedAt === defaultSchedule.updatedAt ? t("adminPlan.hours.defaults") : t("adminPlan.hours.lastSaved", { when: stamp(settings.updatedAt, now.date) })}
            </span>
          )}
        </p>
        <div className="flex gap-2">
          {dirty && (
            <Button variant="ghost" font="sans" onClick={() => setDraft(null)}>
              {t("adminPlan.hours.discard")}
            </Button>
          )}
          <Button font="sans" variant={dirty ? "primary" : "subtle"} disabled={!dirty} onClick={onSave} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4" aria-hidden />
            {t("adminPlan.hours.save")}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!impact}
        onOpenChange={(o) => !o && setImpact(null)}
        title={t("adminPlan.hours.impactTitle")}
        confirmLabel={t("adminPlan.hours.saveAnyway")}
        onConfirm={commit}
        body={
          impact && (
            <div className="space-y-3">
              {outside && outside.bookings > 0 && (
                <>
                  <p>
                    {t("adminPlan.hours.impactBody", {
                      count: t("adminPlan.withRiders", { bookings: tn("adminPlan.bookings", outside.bookings), riders: tn("riders.count", outside.riders) }),
                    })}
                  </p>
                  <ul className="space-y-1 rounded-md border border-line bg-[#0E0D0D] p-2.5 text-xs text-fg/90">
                    {groups.slice(0, 5).map((g) => (
                      <li key={g.key} className="flex justify-between gap-3">
                        <span className="tabular">{fmt.dateWeekday(g.date)} · {fmt.time(g.start)}</span>
                        <span className="text-right text-muted">{tn("adminPlan.bookings", g.bookings.length)} · {tn("riders.count", tally(g.bookings).riders)}</span>
                      </li>
                    ))}
                    {groups.length > 5 && <li className="text-muted">{t("adminPlan.moreSessions", { n: groups.length - 5 })}</li>}
                  </ul>
                </>
              )}
              {impact.over > 0 && <p>{tn("adminPlan.hours.over", impact.over)}</p>}
            </div>
          )
        }
      />
    </Panel>
  );
}
