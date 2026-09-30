"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { hkToday } from "@/lib/dates";
import { useEvents, useHydrated } from "@/lib/store";
import type { ParkEvent } from "@/types";

function EventCard({ ev, index, total }: { ev: ParkEvent; index: number; total: number }) {
  const { t, l, date, money } = useI18n();
  return (
    <li role="group" aria-roledescription="slide" aria-label={t("home.ev.slide", { i: index + 1, n: total })} className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]">
      <Link href={`/events/${ev.slug}`} className="surface flex h-full flex-col gap-3 p-5 transition-colors hover:border-silver-dim">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow">{t(`evtype.${ev.type}`)}</p>
          {ev.isDemo && <DemoTag />}
        </div>
        <h3 className="font-display text-xl font-bold uppercase leading-tight">{l(ev.title)}</h3>
        <p className="text-sm font-medium">
          {date(ev.date, { weekday: "short", month: "short", day: "numeric" })} · {ev.startTime}
        </p>
        <p className="flex-1 text-sm text-silver">{l(ev.summary)}</p>
        <div className="flex items-center justify-between gap-2 text-sm">
          <DifficultyBadge level={ev.level} />
          <span className="font-semibold">{ev.priceHKD === null || ev.priceHKD === 0 ? t("home.ev.free") : money(ev.priceHKD)}</span>
        </div>
      </Link>
    </li>
  );
}

export function EventsCarousel() {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const [events] = useEvents();
  const track = useRef<HTMLUListElement>(null);

  const upcoming = hydrated ? events.filter((e) => e.published && e.date >= hkToday()).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).slice(0, 8) : [];

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="border-y border-graphite-800 bg-graphite-950" aria-label={t("home.ev.title")}>
      <div className="container section-pad">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow={t("home.ev.eyebrow")} title={t("home.ev.title")} />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" aria-label={t("home.ev.prev")} onClick={() => scroll(-1)}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </Button>
            <Button variant="secondary" size="icon" aria-label={t("home.ev.next")} onClick={() => scroll(1)}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Button>
            <Link href="/events" className={buttonVariants({ variant: "silver" })}>
              {t("home.ev.all")}
            </Link>
          </div>
        </div>

        <div aria-roledescription="carousel" aria-label={t("home.ev.label")} className="mt-10">
          {!hydrated ? (
            <div className="flex gap-4 overflow-hidden">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-56 w-[80%] shrink-0 sm:w-[45%] lg:w-[31%]" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-silver">{t("home.ev.empty")}</p>
          ) : (
            <ul ref={track} tabIndex={0} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:mx-0 md:px-0">
              {upcoming.map((ev, i) => (
                <EventCard key={ev.id} ev={ev} index={i} total={upcoming.length} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
