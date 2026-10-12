"use client";

import Link from "next/link";
import { ArrowRight, Cloud, CloudRain, ShieldCheck, Sun, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useConditions, type Availability } from "@/lib/hooks";
import { fromMin, hkInstant, type HKNow } from "@/lib/time";
import { sampleWeather } from "@/lib/weather";
import { Countdown } from "@/components/common/Countdown";
import { EventTag } from "@/components/ui/badge";
import { CapacityBar } from "@/components/ui/capacity";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StateMark } from "./StateMark";
import { coherentWeather, summarizePark } from "./status";

const skyIcon = { fair: Sun, cloudy: Cloud, showers: CloudRain } as const;
const label = "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted";

/**
 * The hero's live park card: open/closed, sample weather, HK Observatory
 * warning, next free pump track session and a countdown to the next race.
 * Shows a skeleton until the HK clock is known, so server and first client
 * render match.
 */
export function ParkStatusCard({ now, avail }: { now: HKNow | null; avail: Availability }) {
  const { t, fmt } = useI18n();
  return (
    <section aria-labelledby="park-status-title" className="surface overflow-hidden shadow-lift">
      <header className="flex min-h-11 items-center justify-between gap-3 border-b border-line bg-card-2 px-5 py-2.5">
        <h2 id="park-status-title" className="eyebrow text-fg/85">
          {t("home.status.title")}
        </h2>
        {now ? (
          <p className="text-xs text-muted tabular">{t("home.status.updated", { time: fmt.time(fromMin(now.minutes)) })}</p>
        ) : (
          <Skeleton className="h-3 w-24 rounded-sm" />
        )}
      </header>
      {now ? <StatusBody now={now} avail={avail} /> : <StatusSkeleton />}
    </section>
  );
}

function StatusBody({ now, avail }: { now: HKNow; avail: Availability }) {
  const { t, l, fmt } = useI18n();
  const [conditions] = useConditions();
  const warning = conditions.warning;
  const park = summarizePark(avail.parkState(now), now, t, fmt);
  const wx = coherentWeather(sampleWeather(now.date, now.minutes), warning);
  const Sky = skyIcon[wx.sky];
  const slot = avail.nextFreePump(now);
  const race = avail.nextRace(now);

  return (
    <div className="grid animate-fade-up md:grid-cols-2 lg:grid-cols-1">
      <div className="md:border-r md:border-line lg:border-r-0">
        {/* open / closed */}
        <div className={cn("relative px-5 py-5", park.weather && "bg-state-closed/10")}>
          {park.weather && <span aria-hidden className="hatch-closed absolute inset-y-0 left-0 w-1.5 bg-state-closed/30" />}
          <div className="flex items-center gap-3">
            <StateMark open={park.open} />
            <p className={cn("h-display text-[2.5rem]", park.weather && "text-state-closed")}>{park.title}</p>
          </div>
          <p className="mt-2 text-sm text-fg/80">
            {park.reason && <span className={cn(park.weather && "font-semibold text-fg")}>{park.reason}</span>}
            {park.reason && park.when && <span aria-hidden className="mx-1.5 text-muted">·</span>}
            {park.when}
          </p>
        </div>

        {/* sample weather */}
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Sky aria-hidden className="h-5 w-5 shrink-0 text-fg/70" />
            <p className="font-display text-3xl font-extrabold italic leading-none tabular [font-synthesis:none]">{fmt.temp(wx.tempC)}</p>
            <div className="min-w-0 text-sm leading-tight">
              <p>{t(`weather.${wx.sky}`)}</p>
              <p className="text-xs text-muted">{t("home.status.humidity", { n: wx.humidity })}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-sm border border-dashed border-line-strong px-1.5 py-0.5 text-[11px] text-muted">
            {t("weather.sample")}
          </span>
        </div>

        {/* HK Observatory warning */}
        {warning ? (
          <div className="flex items-center gap-3 border-t border-state-closed/40 bg-state-closed/10 px-5 py-3">
            <TriangleAlert aria-hidden className="h-4 w-4 shrink-0 text-state-closed" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t(`warning.${warning}`)}</p>
              <p className="text-xs text-muted">{t("warning.source")}</p>
            </div>
            <Link
              href="/visit#weather"
              className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs font-semibold text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-fg"
            >
              {t("home.status.policy")}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 border-t border-line px-5 py-3 text-sm text-muted">
            <ShieldCheck aria-hidden className="h-4 w-4 shrink-0" />
            <p>
              {t("warning.none")}
              <span className="text-xs"> · {t("warning.source")}</span>
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-line md:border-t-0 lg:border-t">
        {/* next free pump track session */}
        {slot ? (
          <Link href={`/pump-track?date=${slot.date}`} className="group block px-5 py-4 transition-colors hover:bg-white/[.03]">
            <span className="flex items-center justify-between gap-3">
              <span className={label}>{t("home.status.nextPump")}</span>
              <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
            </span>
            <span className="mt-1.5 block text-lg font-semibold tabular">
              {t("home.status.when", { day: fmt.relDay(slot.date, now.date), time: fmt.time(slot.start) })}
              <span aria-hidden className="mx-1.5 text-muted">·</span>
              <span className={slot.status === "almost" ? "text-brand-amber" : undefined}>
                {t("spots.ofLeft", { n: slot.remaining, cap: slot.capacity })}
              </span>
            </span>
            <CapacityBar className="mt-3" booked={slot.booked} capacity={slot.capacity} status={slot.status} />
          </Link>
        ) : (
          <div className="px-5 py-4">
            <p className={label}>{t("home.status.nextPump")}</p>
            <p className="mt-1.5 text-sm text-muted">{t("home.status.noPump")}</p>
            <Link href="/pump-track" className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold hover:underline">
              {t("home.status.seeTimes")}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* countdown to the next race */}
        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className={label}>{t("home.status.nextRace")}</p>
            <EventTag type="race" />
          </div>
          {race ? (
            <>
              <Link href={`/events/${race.slug}`} className="group mt-0.5 flex min-h-11 items-center justify-between gap-3">
                <span className="text-lg font-semibold leading-snug [overflow-wrap:anywhere] [word-break:keep-all] group-hover:underline group-hover:decoration-fg/40 group-hover:underline-offset-4">
                  {l(race.title)}
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
              </Link>
              <p className="text-sm text-muted tabular">
                {fmt.dateWeekday(race.date)} · {fmt.time(race.start)}
              </p>
              <Countdown to={hkInstant(race.date, race.start)} size="sm" className="mt-3" />
            </>
          ) : (
            <>
              <p className="mt-1.5 text-sm text-muted">{t("home.status.noRace")}</p>
              <Link href="/events" className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold hover:underline">
                {t("home.status.seeEvents")}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Same footprint as the real card so nothing jumps when it fills in. */
function StatusSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-1" aria-hidden>
      <div className="md:border-r md:border-line lg:border-r-0">
        <div className="space-y-3 px-5 py-5">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-40 rounded-sm" />
        </div>
        <div className="flex items-center gap-3 border-t border-line px-5 py-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>
        <div className="border-t border-line px-5 py-3.5">
          <Skeleton className="h-4 w-44 rounded-sm" />
        </div>
      </div>
      <div className="border-t border-line md:border-t-0 lg:border-t">
        <div className="space-y-2.5 px-5 py-4">
          <Skeleton className="h-3 w-40 rounded-sm" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-1.5 w-full rounded-sm" />
        </div>
        <div className="space-y-2.5 border-t border-line px-5 py-4">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
