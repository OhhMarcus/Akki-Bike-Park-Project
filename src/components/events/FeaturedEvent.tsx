"use client";

import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { PhotoPlaceholder } from "@/components/common/PhotoPlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import type { ParkEvent } from "@/types";
import { CapacityBar } from "./CapacityBar";
import { RegisterAction } from "./EventCard";
import { EventCountdown } from "./EventCountdown";
import { priceText } from "./eventText";

export function FeaturedEvent({ event, today, isFeatured }: { event: ParkEvent; today: string | null; isFeatured: boolean }) {
  const { t, l, date, money } = useI18n();
  return (
    <section aria-labelledby="featured-title" className="grid overflow-hidden rounded-lg border border-graphite-700 bg-graphite-900 lg:grid-cols-2">
      <PhotoPlaceholder alt={l(event.title)} className="aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]" priority />
      <div className="flex flex-col gap-5 p-6 md:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{isFeatured ? t("events.featured") : t("events.next")}</span>
          <Badge tone="silver">{t(`evtype.${event.type}`)}</Badge>
          {event.isDemo && <DemoTag />}
        </div>
        <h2 id="featured-title" className="h-section">{l(event.title)}</h2>
        <p className="text-silver">{l(event.summary)}</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-silver-dim" aria-hidden />{date(event.date, { weekday: "long", month: "long", day: "numeric" })}</li>
          <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-silver-dim" aria-hidden />{event.startTime} – {event.endTime}</li>
        </ul>
        <EventCountdown event={event} />
        <CapacityBar event={event} />
        <p className="text-lg font-semibold">
          {priceText(event, t, money)}
          {event.isDemo && event.priceHKD != null && <DemoTag className="ml-2 align-middle" />}
        </p>
        <div className="mt-auto flex flex-wrap gap-3">
          <RegisterAction event={event} today={today} size="lg" />
          <Button asChild variant="secondary" size="lg">
            <Link href={`/events/${event.slug}`}>{t("events.viewDetails")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
