"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Bike, CalendarClock, Check, ChevronDown, Cloud, CloudLightning, CloudRain, LayoutList, Plus, StickyNote, Sun,
  Users, Wallet,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { coachById, lessons } from "@/content/catalogue";
import { useAvailability, useBookings, useClosures, useConditions, useEvents, useNowHK, type Availability } from "@/lib/hooks";
import { rentalBikeCount, BIKE_SIZES } from "@/lib/sizing";
import { toMin, type HKNow } from "@/lib/time";
import { sampleWeather } from "@/lib/weather";
import type { BlockReason, Booking, Closure, HHmm, LessonId, ParkEvent, Rentals, SlotStatus, TeachingLanguage, WarningCode } from "@/types";
import { AdminPageHeader } from "@/components/layout/AdminShell";
import { Swap } from "@/components/brand/Swap";
import { Chip, EventTag, SourceTag, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CapacityBar } from "@/components/ui/capacity";
import { EmptyState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat";
import { AttendanceToggle, FlagChip, PayButton, PaymentBadge, rentalsText, sumRentals, telHref } from "./shared";
import { cn } from "@/lib/utils";

/** A row on today's timeline: one pump slot or lesson session (closed, empty pump slots in a row fold into one). */
type Unit = {
  id: string;
  kind: "pump" | "lesson";
  start: HHmm;
  end: HHmm;
  capacity: number;
  booked: number;
  status: SlotStatus;
  closedReason?: BlockReason;
  lessonId?: LessonId;
  language?: TeachingLanguage;
  coachId?: string;
  bookings: Booking[];
  folded?: boolean;
};

type Phase = "upcoming" | "live" | "done";
const phaseOf = (u: { start: HHmm; end: HHmm }, now: HKNow): Phase =>
  now.minutes >= toMin(u.end) ? "done" : now.minutes >= toMin(u.start) ? "live" : "upcoming";

const SEVERE: WarningCode[] = ["black_rain", "red_rain", "t8"];

function buildUnits(today: string, avail: Availability, todays: Booking[]): Unit[] {
  const byTarget = new Map<string, Booking[]>();
  for (const b of todays) {
    if (b.kind === "event") continue;
    byTarget.set(b.targetId, [...(byTarget.get(b.targetId) ?? []), b]);
  }
  const pump: Unit[] = [];
  for (const s of avail.pumpSlots(today)) {
    const bookings = byTarget.get(s.id) ?? [];
    const quiet = s.status === "closed" && !bookings.length;
    const prev = pump[pump.length - 1];
    if (quiet && prev?.folded && prev.closedReason === s.closedReason && prev.end === s.start) {
      prev.end = s.end;
      continue;
    }
    pump.push({
      id: s.id, kind: "pump", start: s.start, end: s.end, capacity: s.capacity, booked: s.booked, status: s.status,
      closedReason: s.closedReason, bookings, folded: quiet,
    });
  }
  const sessions: Unit[] = avail.sessions(today).map((s) => ({
    id: s.id, kind: "lesson", start: s.start, end: s.end, capacity: s.capacity, booked: s.booked, status: s.status,
    closedReason: s.closedReason, lessonId: s.lessonId, language: s.language, coachId: s.coachId, bookings: byTarget.get(s.id) ?? [],
  }));
  return [...pump, ...sessions].sort((a, b) => toMin(a.start) - toMin(b.start) || (a.kind === b.kind ? 0 : a.kind === "lesson" ? -1 : 1));
}

export function TodayScreen() {
  const { t, fmt } = useI18n();
  const now = useNowHK();
  return (
    <>
      <AdminPageHeader
        title={t("admin.nav.today")}
        lead={now ? fmt.dateLong(now.date) : " "}
        actions={
          <>
            <Button asChild variant="subtle" size="sm" font="sans">
              <Link href="/admin/bookings">
                <LayoutList className="h-4 w-4" aria-hidden />
                {t("admin.nav.bookings")}
              </Link>
            </Button>
            <Button asChild size="sm" font="sans">
              <Link href="/admin/bookings/new">
                <Plus className="h-4 w-4" aria-hidden />
                {t("admin.nav.add")}
              </Link>
            </Button>
          </>
        }
      />
      {now ? <TodayBoard now={now} /> : <TodaySkeleton />}
    </>
  );
}

function TodayBoard({ now }: { now: HKNow }) {
  const { t, tn, fmt } = useI18n();
  const today = now.date;
  const avail = useAvailability(now);
  const [bookings] = useBookings();
  const [events] = useEvents();
  const [conditions] = useConditions();
  const [closures] = useClosures();

  const todays = useMemo(() => bookings.filter((b) => b.date === today && b.status === "confirmed"), [bookings, today]);
  const units = useMemo(() => buildUnits(today, avail, todays), [today, avail, todays]);
  const eventsToday = events.filter((e) => e.date === today);
  const closedToday = closures.filter((c) => c.date === today && !c.reopenedAt);

  const slots = avail.pumpSlots(today);
  const sessions = avail.sessions(today);
  const openPump = slots.filter((s) => s.status !== "closed").length;
  const openLessons = sessions.filter((s) => s.status !== "closed").length;
  const closedCount = slots.length + sessions.length - openPump - openLessons;

  const k = useMemo(() => {
    let riders = 0, here = 0, unpaid = 0, unpaidHKD = 0, revenue = 0, paid = 0;
    for (const b of todays) {
      riders += b.riders;
      revenue += b.priceHKD;
      if (b.attendance === "attended") here += b.riders;
      if (b.payment === "paid") paid += b.priceHKD;
      if (b.payment === "unpaid") {
        unpaid += 1;
        unpaidHKD += b.priceHKD;
      }
    }
    const rentals = sumRentals(todays);
    return { riders, here, unpaid, unpaidHKD, revenue, paid, rentals, bikes: rentalBikeCount(rentals) };
  }, [todays]);

  const money = (n: number) => fmt.money(n, { zeroAsFree: false });
  const icon = (I: typeof Sun) => <I className="h-4 w-4 shrink-0 text-muted" aria-hidden />;
  const nothingOn = !units.length && !eventsToday.length;

  return (
    <div className="space-y-6">
      {closedToday.map((c) => (
        <ClosureBanner key={c.id} closure={c} flagged={bookings.filter((b) => b.flag?.closureId === c.id && b.status === "confirmed").length} />
      ))}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <WeatherCard now={now} warning={conditions.warning} className="col-span-2 md:col-span-3 xl:col-span-1 xl:row-span-2" />
        <StatTile
          label={t("adminOps.kpi.sessions")}
          value={openPump + openLessons}
          icon={icon(CalendarClock)}
          sub={[tn("adminOps.kpi.pumpCount", openPump), tn("adminOps.kpi.lessonCount", openLessons), closedCount ? t("adminOps.kpi.closed", { n: closedCount }) : ""]
            .filter(Boolean)
            .join(" · ")}
        />
        <StatTile
          label={t("adminOps.kpi.riders")}
          value={k.riders}
          icon={icon(Users)}
          sub={`${tn("adminOps.bookingCount", todays.length)} · ${t("adminOps.kpi.checkedIn", { n: k.here })}`}
        />
        <StatTile label={t("adminOps.kpi.bikes")} value={k.bikes} icon={icon(Bike)} sub={tn("helmets.count", k.rentals.helmets)} />
        <StatTile
          label={t("adminOps.kpi.unpaid")}
          value={k.unpaid}
          icon={icon(Wallet)}
          sub={
            <>
              {t("adminOps.kpi.unpaidSub", { amount: money(k.unpaidHKD) })}
              {k.unpaid > 0 && (
                <>
                  {" · "}
                  <Link
                    href="/admin/bookings?range=today&status=unpaid"
                    aria-label={`${t("adminOps.kpi.unpaidView")}: ${t("adminOps.kpi.unpaid")}`}
                    className="font-semibold text-fg underline decoration-fg/30 underline-offset-2 hover:decoration-fg"
                  >
                    {t("adminOps.kpi.unpaidView")}
                  </Link>
                </>
              )}
            </>
          }
        />
        <StatTile
          className="col-span-2"
          label={t("adminOps.kpi.revenue")}
          value={money(k.revenue)}
          icon={<Chip>{t("adminOps.sample")}</Chip>}
          sub={t("adminOps.kpi.revenueSub", { amount: money(k.paid) })}
        />
      </div>

      {nothingOn ? (
        <EmptyState
          title={t("adminOps.today.emptyTitle")}
          body={t("adminOps.today.emptyBody")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild variant="secondary" size="sm" font="sans">
                <Link href="/admin/schedule">{t("adminOps.today.openSchedule")}</Link>
              </Button>
              <Button asChild variant="subtle" size="sm" font="sans">
                <Link href="/admin/bookings/new">{t("admin.nav.add")}</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <aside className="grid gap-4 md:grid-cols-2 xl:sticky xl:top-24 xl:col-start-2 xl:row-start-1 xl:grid-cols-1">
            {eventsToday.map((e) => (
              <EventCard key={e.id} event={e} now={now} avail={avail} />
            ))}
            <RentalsCard rentals={k.rentals} total={k.bikes} className={cn(eventsToday.length % 2 === 0 && "md:col-span-2 xl:col-span-1")} />
          </aside>
          <SessionList units={units} now={now} className="xl:col-start-1 xl:row-start-1" />
        </div>
      )}
    </div>
  );
}

function TodaySkeleton() {
  const { t } = useI18n();
  return (
    <div>
      <p className="sr-only" role="status">{t("state.loading")}</p>
      <div aria-hidden className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <Skeleton className="col-span-2 h-36 md:col-span-3 xl:col-span-1 xl:row-span-2 xl:h-auto" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[104px]" />
        ))}
        <Skeleton className="col-span-2 h-[104px]" />
      </div>
      <div aria-hidden className="mt-6 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}

function ClosureBanner({ closure, flagged }: { closure: Closure; flagged: number }) {
  const { t, tn, fmt } = useI18n();
  const span = closure.start && closure.end ? fmt.timeRange(closure.start, closure.end) : t("adminOps.closure.allDay");
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-state-closed/60 bg-state-closed/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span aria-hidden className="hatch-closed grid h-10 w-10 shrink-0 place-items-center rounded-md border border-state-closed/60">
          <CloudLightning className="h-5 w-5 text-state-closed" />
        </span>
        <div>
          <p className="font-semibold text-state-closed">{t("adminOps.closure.title")}</p>
          <p className="mt-0.5 text-sm">
            {t(`warning.${closure.warning}`)} · {span}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {tn("adminOps.closure.flagged", flagged)} · {closure.messageSent ? t("adminOps.closure.sent") : t("adminOps.closure.notSent")}
          </p>
        </div>
      </div>
      <Button asChild variant="secondary" size="sm" font="sans" className="self-start sm:self-auto">
        <Link href="/admin/weather">
          {t("adminOps.closure.open")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}

function WeatherCard({ now, warning, className }: { now: HKNow; warning: WarningCode | null; className?: string }) {
  const { t, fmt } = useI18n();
  const wx = sampleWeather(now.date, now.minutes);
  const Sky = wx.sky === "fair" ? Sun : wx.sky === "cloudy" ? Cloud : CloudRain;
  const severe = !!warning && SEVERE.includes(warning);
  return (
    <section aria-labelledby="ops-weather" className={cn("surface flex flex-col p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <h2 id="ops-weather" className="text-xs font-semibold text-muted">
          {t("adminOps.weather.title")}
        </h2>
        <Chip>{t("weather.sample")}</Chip>
      </div>
      <div className="mt-3 grid flex-1 gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center xl:grid-cols-1 xl:content-between xl:items-start">
        <div className="flex items-center gap-3">
          <Sky className="h-8 w-8 shrink-0 text-fg/80" aria-hidden />
          <div>
            <p className="font-display text-4xl font-extrabold italic leading-none tabular [font-synthesis:none]">{fmt.temp(wx.tempC)}</p>
            <p className="mt-1 text-sm text-muted">
              {t(`weather.${wx.sky}`)} · {t("adminOps.weather.humidity", { n: wx.humidity })}
            </p>
          </div>
        </div>
        <div className="border-t border-line pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 xl:border-l-0 xl:border-t xl:pl-0 xl:pt-3">
          <p className="text-xs text-muted">{t("warning.source")}</p>
          {warning ? (
            <p className={cn("mt-1 flex items-center gap-1.5 text-sm font-semibold", severe ? "text-state-closed" : "text-brand-amber")}>
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              {t(`warning.${warning}`)}
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <Check className="h-4 w-4 shrink-0 text-brand-sky" aria-hidden />
              {t("warning.none")}
            </p>
          )}
        </div>
        <Link href="/admin/weather" className="inline-flex items-center gap-1 text-sm font-semibold underline decoration-fg/30 underline-offset-4 hover:decoration-fg">
          {t("admin.nav.weather")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function EventCard({ event, now, avail }: { event: ParkEvent; now: HKNow; avail: Availability }) {
  const { t, l, fmt } = useI18n();
  const spots = avail.eventSpots(event);
  const ph = phaseOf(event, now);
  return (
    <section aria-labelledby={`ops-ev-${event.id}`} className="surface p-4">
      <h2 id={`ops-ev-${event.id}`} className="text-xs font-semibold text-muted">
        {t("adminOps.event.title")}
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <EventTag type={event.type} />
        {!event.published && <Chip>{t("adminOps.event.draft")}</Chip>}
        {ph === "live" && <LiveBadge />}
      </div>
      <p className="mt-2 font-semibold">{l(event.title)}</p>
      <p className="text-sm tabular text-muted">{fmt.timeRange(event.start, event.end)}</p>
      <div className="mt-3 space-y-1.5">
        <p className="text-xs tabular text-muted">{t("adminOps.event.entries", { taken: spots.taken, capacity: spots.capacity })}</p>
        <CapacityBar booked={spots.taken} capacity={spots.capacity} status={spots.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="subtle" size="sm" font="sans">
          <Link href="/admin/bookings?kind=event&range=today">{t("adminOps.event.viewEntries")}</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" font="sans">
          <Link href="/admin/events">{t("adminOps.event.manage")}</Link>
        </Button>
      </div>
    </section>
  );
}

function RentalsCard({ rentals, total, className }: { rentals: Rentals; total: number; className?: string }) {
  const { t, tn } = useI18n();
  const rows = [
    ...BIKE_SIZES.map((s) => ({ key: s, label: t(`size.${s}`), n: rentals.bikes[s] ?? 0 })),
    { key: "helmets", label: t("adminOps.rentals.helmets"), n: rentals.helmets },
  ];
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section aria-labelledby="ops-rentals" className={cn("surface p-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="ops-rentals" className="font-semibold">
          {t("adminOps.rentals.title")}
        </h2>
        <span className="shrink-0 text-sm font-semibold tabular">{tn("bikes.count", total)}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted">{t("adminOps.rentals.lead")}</p>
      <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-1">
        {rows.map((r) => {
          const p = r.n / max;
          return (
            <li key={r.key} className={cn("grid grid-cols-[84px_minmax(0,1fr)_28px] items-center gap-3 text-sm", r.key === "helmets" && "border-t border-line pt-2.5 sm:col-span-2 xl:col-span-1")}>
              <span className={cn(!r.n && "text-muted")}>{r.label}</span>
              <span aria-hidden className="h-2 overflow-hidden rounded-sm bg-line">
                {r.n > 0 && <span className="block h-full rounded-sm bg-grad" style={{ width: `${p * 100}%`, backgroundSize: `${100 / p}% 100%` }} />}
              </span>
              <span className={cn("text-right font-semibold tabular", !r.n && "text-muted")}>{r.n}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LiveBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-sky">
      <span aria-hidden className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-brand-sky" />
      {t("adminOps.onNow")}
    </span>
  );
}

function SessionList({ units, now, className }: { units: Unit[]; now: HKNow; className?: string }) {
  const { t } = useI18n();
  // Open the session that's on now (or the next one with riders) so check-in is one tap away.
  const [open, setOpen] = useState<Set<string>>(() => {
    const pick =
      units.find((u) => phaseOf(u, now) === "live" && u.bookings.length) ?? units.find((u) => phaseOf(u, now) === "upcoming" && u.bookings.length);
    return new Set(pick ? [pick.id] : []);
  });
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section aria-labelledby="ops-sessions" className={className}>
      <div className="mb-3">
        <h2 id="ops-sessions" className="h-display text-2xl">
          {t("adminOps.sessions.title")}
        </h2>
        <p className="mt-1 text-sm text-muted">{t("adminOps.sessions.lead")}</p>
      </div>
      {units.length ? (
        <ol className="space-y-2">
          {units.map((u) =>
            u.folded ? <ClosedRow key={u.id} unit={u} /> : <SessionRow key={u.id} unit={u} now={now} open={open.has(u.id)} onToggle={() => toggle(u.id)} />,
          )}
        </ol>
      ) : (
        <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{t("adminOps.slot.none")}</p>
      )}
    </section>
  );
}

function ClosedRow({ unit }: { unit: Unit }) {
  const { t, fmt } = useI18n();
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-dashed border-line px-3 py-3 text-sm sm:px-4">
      <span className="font-semibold tabular text-muted sm:w-[84px]">{fmt.timeRange(unit.start, unit.end)}</span>
      <span aria-hidden className="hatch-closed h-3 w-3 rounded-sm border border-state-closed" />
      <span className="font-semibold text-state-closed">{t("adminOps.sessions.closedRun")}</span>
      {unit.closedReason && <span className="text-muted">{t(`reason.${unit.closedReason}`)}</span>}
    </li>
  );
}

function SessionRow({ unit, now, open, onToggle }: { unit: Unit; now: HKNow; open: boolean; onToggle: () => void }) {
  const { t, tn, l, fmt } = useI18n();
  const ph = phaseOf(unit, now);
  const rosterId = `roster-${unit.id}`;
  const title = unit.lessonId ? l(lessons[unit.lessonId].name) : t("kind.pump");
  const coach = unit.coachId ? coachById(unit.coachId) : undefined;
  const rentals = rentalsText(sumRentals(unit.bookings), { t, tn });
  const flagged = unit.bookings.filter((b) => b.flag).length;

  return (
    <li className={cn("surface overflow-hidden", ph === "live" && "border-line-strong", ph === "done" && !open && "opacity-70")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={rosterId}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2.5 p-3 text-left transition-colors hover:bg-white/[.025] sm:grid-cols-[84px_minmax(0,1fr)_minmax(150px,200px)_20px] sm:items-center sm:p-4"
      >
        <span className="flex items-baseline gap-1.5 sm:col-start-1 sm:row-start-1 sm:block">
          <span className="font-semibold tabular">{fmt.time(unit.start)}</span>
          <span className="text-xs tabular text-muted sm:block">– {fmt.time(unit.end)}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn("col-start-2 row-start-1 h-5 w-5 justify-self-end text-muted transition-transform sm:col-start-4", open && "rotate-180")}
        />
        <span className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{title}</span>
            {unit.language && <Chip>{t(`tlang.${unit.language}`)}</Chip>}
            {ph === "live" && unit.status !== "closed" && <LiveBadge />}
          </span>
          <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {coach && (
              <span>
                {t("label.coach")}: {l(coach.name)}
                <Swap />
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {rentals ?? t("adminOps.sessions.noRentals")}
            </span>
            {flagged > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-state-closed">
                <CloudLightning className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {tn("adminOps.closure.flagged", flagged)}
              </span>
            )}
          </span>
        </span>
        <span className="col-span-2 block sm:col-span-1 sm:col-start-3 sm:row-start-1">
          <span className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
            <span className="tabular">{t("adminOps.sessions.riders", { booked: unit.booked, capacity: unit.capacity })}</span>
            <StatusBadge status={unit.status} past={ph === "done" && unit.status !== "closed"} />
          </span>
          <CapacityBar booked={unit.booked} capacity={unit.capacity} status={unit.status} />
        </span>
      </button>
      <div id={rosterId} hidden={!open}>
        {open && <Roster bookings={unit.bookings} label={`${title} ${fmt.timeRange(unit.start, unit.end)}`} />}
      </div>
    </li>
  );
}

function Roster({ bookings, label }: { bookings: Booking[]; label: string }) {
  const { t } = useI18n();
  if (!bookings.length) return <p className="border-t border-line px-4 py-4 text-sm text-muted">{t("adminOps.sessions.empty")}</p>;
  const list = [...bookings].sort((a, b) => a.riderName.localeCompare(b.riderName));
  return (
    <ul aria-label={t("adminOps.sessions.roster", { session: label })} className="divide-y divide-line border-t border-line bg-ink/40">
      {list.map((b) => (
        <RosterRow key={b.id} b={b} />
      ))}
    </ul>
  );
}

function RosterRow({ b }: { b: Booking }) {
  const { t, tn, fmt } = useI18n();
  const rentals = rentalsText(b.rentals, { t, tn });
  return (
    <li className="grid gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold">{b.riderName}</span>
          <span className="text-sm text-muted">{tn("riders.count", b.riders)}</span>
          {b.flag && <FlagChip />}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <a href={telHref(b.phone)} className="tabular underline-offset-2 hover:text-fg hover:underline">
            {b.phone}
          </a>
          <span className="inline-flex items-center gap-1.5">
            <SourceTag source={b.source} />
            {b.externalRef && <span className="font-mono">{b.externalRef}</span>}
          </span>
          <Link href={`/admin/bookings?q=${encodeURIComponent(b.ref)}`} className="font-mono underline-offset-2 hover:text-fg hover:underline">
            {b.ref}
          </Link>
          {rentals && (
            <span className="inline-flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {rentals}
            </span>
          )}
        </p>
        {b.notes && (
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-fg/80">
            <StickyNote className="mt-px h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
            {b.notes}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold tabular">{fmt.money(b.priceHKD)}</span>
        <PaymentBadge payment={b.payment} />
        {b.payment === "unpaid" && <PayButton booking={b} />}
        <AttendanceToggle booking={b} />
      </div>
    </li>
  );
}
