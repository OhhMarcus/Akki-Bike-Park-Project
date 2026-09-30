"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/provider";
import { addDays } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { EventCalendar } from "./EventCalendar";
import { EventCard } from "./EventCard";
import { defaultFilters, EventFilters, type Filters } from "./EventFilters";
import { fits, useLiveEvents, useToday } from "./eventUtils";
import { FeaturedEvent } from "./FeaturedEvent";

type View = "list" | "calendar";
const views: View[] = ["list", "calendar"];

export function EventsExplorer() {
  const { t } = useI18n();
  const today = useToday();
  const all = useLiveEvents();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [view, setView] = useState<View>("list");
  const tabRefs = useRef<Record<View, HTMLButtonElement | null>>({ list: null, calendar: null });

  const upcoming = useMemo(() => (today ? all.filter((e) => e.date >= today) : []), [all, today]);

  const featured = useMemo(() => upcoming.find((e) => e.featured) ?? upcoming[0], [upcoming]);
  const isFeatured = !!featured?.featured;

  /** Type / level / age apply to both views. */
  const base = useMemo(
    () => all.filter((e) => (filters.type === "all" || e.type === filters.type) && (filters.level === "all" || e.level === "all" || e.level === filters.level) && (filters.age == null || fits(e, filters.age))),
    [all, filters.type, filters.level, filters.age],
  );

  const listed = useMemo(() => {
    if (!today) return [];
    let from = today;
    let to = "9999-12-31";
    if (filters.when === "week") to = addDays(today, 6);
    if (filters.when === "month") to = `${today.slice(0, 7)}-31`;
    if (filters.when === "custom" && filters.from) from = filters.from;
    return base.filter((e) => e.date >= from && e.date <= to);
  }, [base, today, filters.when, filters.from]);

  const dirty = filters.type !== "all" || filters.level !== "all" || filters.age != null || filters.when !== "upcoming";

  if (!today) {
    return (
      <div className="container space-y-6 pb-20" aria-busy="true">
        <Skeleton className="h-[26rem]" />
        <Skeleton className="h-12" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = views[(i + (e.key === "ArrowRight" ? 1 : views.length - 1)) % views.length];
    setView(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="container space-y-10 pb-20">
      {featured && <FeaturedEvent event={featured} today={today} isFeatured={isFeatured} />}

      <div className="space-y-6">
        <EventFilters value={filters} onChange={setFilters} showWhen={view === "list"} dirty={dirty} />

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-silver" aria-live="polite">
            {view === "list" ? (listed.length === 1 ? t("events.filter.count1") : t("events.filter.count", { n: listed.length })) : null}
          </p>
          <div role="tablist" aria-label={t("events.view.label")} className="inline-flex rounded-lg border border-graphite-600 p-1">
            {views.map((v, i) => (
              <button
                key={v}
                ref={(el) => {
                  tabRefs.current[v] = el;
                }}
                role="tab"
                id={`ev-tab-${v}`}
                aria-selected={view === v}
                aria-controls={`ev-panel-${v}`}
                tabIndex={view === v ? 0 : -1}
                onClick={() => setView(v)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn("min-h-11 rounded-md px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-silver", view === v ? "bg-bone text-ink" : "text-silver hover:text-bone")}
              >
                {t(`events.view.${v}`)}
              </button>
            ))}
          </div>
        </div>

        <div role="tabpanel" id={`ev-panel-${view}`} aria-labelledby={`ev-tab-${view}`}>
          {view === "list" ? (
            listed.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listed.map((e) => (
                  <EventCard key={e.id} event={e} today={today} />
                ))}
              </div>
            ) : dirty ? (
              <EmptyState
                title={t("events.empty.title")}
                body={t("events.empty.body")}
                action={<Button variant="secondary" onClick={() => setFilters(defaultFilters)}>{t("btn.clear")}</Button>}
              />
            ) : (
              <EmptyState
                title={t("events.empty.none")}
                body={t("events.empty.noneBody")}
                action={<Button asChild><Link href="/booking">{t("cta.bookRide")}</Link></Button>}
              />
            )
          ) : (
            <EventCalendar events={base} today={today} />
          )}
        </div>
      </div>
    </div>
  );
}
