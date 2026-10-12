"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { usePublishedEvents, type Availability } from "@/lib/hooks";
import type { HKNow } from "@/lib/time";
import { SectionTitle } from "@/components/brand/Headline";
import { EventTag, StatusBadge, eventTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CapacityBar } from "@/components/ui/capacity";
import { EmptyState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Next three published events that haven't finished, with live spots left. */
export function EventsTeaser({ now, avail }: { now: HKNow | null; avail: Availability }) {
  const { t, tn, l, fmt } = useI18n();
  const events = usePublishedEvents();
  const upcoming = now
    ? events
        .map((e) => ({ e, spots: avail.eventSpots(e) }))
        .filter((x) => !x.spots.ended)
        .slice(0, 3)
    : null;

  return (
    <section className="container py-16 sm:py-20">
      <SectionTitle
        eyebrow={t("nav.events")}
        title={t("home.events.title")}
        lead={t("home.events.lead")}
        brush={false}
        action={
          <Link href="/events" className={cn(buttonVariants({ variant: "ghost", size: "md", font: "sans" }), "-ml-3 self-start sm:ml-0 sm:self-auto")}>
            {t("btn.seeAll")}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        }
      />

      {upcoming === null ? (
        <div className="mt-10 grid gap-4 md:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      ) : upcoming.length ? (
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {upcoming.map(({ e, spots }) => (
            <li key={e.id}>
              <Link
                href={`/events/${e.slug}`}
                className="surface group relative flex h-full flex-col overflow-hidden p-5 pt-6 transition-colors hover:border-line-strong hover:bg-card-2"
              >
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", eventTone[e.type].dot)} />
                <span className="flex items-center justify-between gap-3">
                  <EventTag type={e.type} />
                  <span className="text-xs font-semibold text-muted tabular">{fmt.dateWeekday(e.date)}</span>
                </span>
                <h3 className="h3 mt-4 [overflow-wrap:anywhere] [word-break:keep-all]">{l(e.title)}</h3>
                <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{l(e.summary)}</span>
                <span className="mt-auto block pt-6">
                  <span className="block text-sm font-semibold tabular">{fmt.timeRange(e.start, e.end)}</span>
                  <CapacityBar className="mt-3" booked={spots.taken} capacity={spots.capacity} status={spots.status} />
                  <span className="mt-2.5 flex items-center justify-between gap-3 text-sm">
                    {spots.status === "full" ? (
                      <StatusBadge status="full" className="text-sm" />
                    ) : (
                      <span className={spots.status === "almost" ? "text-brand-amber" : "text-fg/85"}>{tn("spots.left", spots.remaining)}</span>
                    )}
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-10" title={t("home.events.emptyTitle")} body={t("home.events.emptyBody")} />
      )}
    </section>
  );
}
