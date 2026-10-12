"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { ParkEvent } from "@/types";
import { useAvailability, useNowHK, usePublishedEvents } from "@/lib/hooks";
import { PageHero } from "@/components/brand/PageHero";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "./EventCard";
import { EventsCalendar } from "./EventsCalendar";
import { NextRaceCard } from "./NextRaceCard";
import { TypeFilter } from "./TypeFilter";
import { EVENT_TYPES, ymAt, ymIndex, ymOf, type EventFilter, type EventSpots, type YM } from "./utils";

type Item = { event: ParkEvent; spots: EventSpots };

function MonthGroup({ ym, items }: { ym: YM; items: Item[] }) {
  const { tn, fmt } = useI18n();
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
        <h2 id={id} className="h3">{fmt.monthYear(ym.y, ym.m)}</h2>
        <span className="shrink-0 text-sm text-muted">{tn("events.count", items.length)}</span>
      </div>
      <ul className="mt-4 grid gap-3 md:grid-cols-2 md:gap-4">
        {items.map((it) => (
          <li key={it.event.id}>
            <EventCard event={it.event} spots={it.spots} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * /events: hero with the next race, type filter, a month calendar on desktop
 * and a month-grouped list on phones. Everything time-based waits for the
 * HK clock (useNowHK) so the server markup always matches.
 */
export function EventsPage() {
  const { t, tn, fmt } = useI18n();
  const now = useNowHK();
  const avail = useAvailability(now);
  const published = usePublishedEvents();
  const [filter, setFilter] = useState<EventFilter>("all");
  const [picked, setPicked] = useState<YM | null>(null);
  const monthHeadingId = useId();

  const data = useMemo(() => {
    if (!now) return null;
    const all: Item[] = published.map((event) => ({ event, spots: avail.eventSpots(event) }));
    const upcoming = all.filter((it) => !it.spots.ended);
    const counts = { all: upcoming.length } as Record<EventFilter, number>;
    for (const type of EVENT_TYPES) counts[type] = upcoming.filter((it) => it.event.type === type).length;
    const race = avail.nextRace(now);
    return { all, upcoming, counts, race: race ? { event: race, spots: avail.eventSpots(race) } : null };
  }, [now, published, avail]);

  const view = useMemo(() => {
    if (!data || !now) return null;
    const match = (it: Item) => filter === "all" || it.event.type === filter;
    const current = ymOf(now.date);
    const upcoming = data.upcoming.filter(match);
    const last = data.upcoming.at(-1);
    const minI = ymIndex(current);
    const maxI = Math.max(minI + 2, last ? ymIndex(ymOf(last.event.date)) : minI);
    const monthI = Math.min(maxI, Math.max(minI, picked ? ymIndex(picked) : minI));
    const groups: { ym: YM; items: Item[] }[] = [];
    for (const it of upcoming) {
      const ym = ymOf(it.event.date);
      const g = groups.at(-1);
      if (g && ymIndex(g.ym) === ymIndex(ym)) g.items.push(it);
      else groups.push({ ym, items: [it] });
    }
    return {
      today: now.date,
      upcoming,
      groups,
      month: ymAt(monthI),
      min: current,
      max: ymAt(maxI),
      // the calendar also shows this month's finished events, dimmed
      calendar: data.all.filter((it) => match(it) && ymIndex(ymOf(it.event.date)) >= minI),
      monthCards: upcoming.filter((it) => ymIndex(ymOf(it.event.date)) === monthI),
      jumpTo: upcoming[0] ? ymOf(upcoming[0].event.date) : undefined,
    };
  }, [data, now, filter, picked]);

  const showAll = (
    <Button variant="secondary" onClick={() => setFilter("all")}>
      {t("events.empty.showAll")}
    </Button>
  );

  return (
    <>
      <PageHero
        eyebrow={t("nav.events")}
        title={t("events.hero.title")}
        lead={t("events.hero.lead")}
        aside={!data ? <Skeleton className="h-[380px] w-full lg:h-[420px]" /> : data.race ? <NextRaceCard event={data.race.event} spots={data.race.spots} /> : undefined}
      />

      <section aria-label={t("events.list.label")} className="container space-y-8 py-10 lg:py-14">
        {(!data || data.upcoming.length > 0) && <TypeFilter value={filter} onChange={setFilter} counts={data?.counts} />}
        <p className="sr-only" aria-live="polite">
          {view ? tn("events.count", view.upcoming.length) : ""}
        </p>

        {!data || !view ? (
          <>
            <Skeleton className="hidden h-[750px] lg:block" />
            <div className="space-y-3 lg:hidden">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </>
        ) : data.upcoming.length === 0 ? (
          <EmptyState
            title={t("events.empty.title")}
            body={t("events.empty.body")}
            action={
              <Link href="/pump-track" className={buttonVariants({ size: "lg" })}>
                {t("cta.bookPump")}
              </Link>
            }
          />
        ) : filter !== "all" && view.upcoming.length === 0 ? (
          <EmptyState
            title={t("events.empty.typeTitle", { types: t(`events.typePlural.${filter}`) })}
            body={t("events.empty.typeBody")}
            action={showAll}
          />
        ) : (
          <>
            <div className="hidden space-y-12 lg:block">
              <EventsCalendar
                month={view.month}
                onMonthChange={setPicked}
                min={view.min}
                max={view.max}
                items={view.calendar}
                today={view.today}
                jumpTo={view.jumpTo}
              />
              {view.monthCards.length > 0 && (
                <section aria-labelledby={monthHeadingId}>
                  <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
                    <h2 id={monthHeadingId} className="h3">
                      {t("events.month.heading", { month: fmt.monthName(view.month.m) })}
                    </h2>
                    <span className="text-sm text-muted">{tn("events.count", view.monthCards.length)}</span>
                  </div>
                  <ul className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-3">
                    {view.monthCards.map((it) => (
                      <li key={it.event.id}>
                        <EventCard event={it.event} spots={it.spots} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <div className="space-y-10 lg:hidden">
              {view.groups.map((g) => (
                <MonthGroup key={ymIndex(g.ym)} ym={g.ym} items={g.items} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
