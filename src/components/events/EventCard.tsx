"use client";

import { eventImg } from "@/content/images";
import Link from "next/link";
import { CalendarDays, Clock, Users } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { PhotoPlaceholder } from "@/components/common/PhotoPlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import type { ParkEvent } from "@/types";
import { CapacityBar } from "./CapacityBar";
import { ageText, priceText } from "./eventText";
import { eventState, registerHref } from "./eventUtils";

export function RegisterAction({ event, today, size = "default", className }: { event: ParkEvent; today: string | null; size?: "default" | "lg"; className?: string }) {
  const { t } = useI18n();
  const state = eventState(event, today);
  if (state === "open") {
    return (
      <Button asChild size={size} className={className}>
        <Link href={registerHref(event, state)}>{t("btn.register")}</Link>
      </Button>
    );
  }
  if (state === "full") {
    return (
      <Button asChild variant="secondary" size={size} className={className}>
        <Link href={registerHref(event, state)}>{t("events.waitlist")}</Link>
      </Button>
    );
  }
  return (
    <Button disabled size={size} className={className}>
      {state === "ended" ? t("events.ended") : t("events.closed")}
    </Button>
  );
}

export function EventCard({ event, today }: { event: ParkEvent; today: string | null }) {
  const { t, l, date, money } = useI18n();
  const state = eventState(event, today);
  return (
    <article className="surface flex h-full flex-col overflow-hidden rounded-lg border border-graphite-700 bg-graphite-900">
      <PhotoPlaceholder src={eventImg(event)} alt={l(event.title)} className="aspect-[16/9]">
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="silver" className="bg-ink/70">{t(`evtype.${event.type}`)}</Badge>
          {event.isDemo && <DemoTag className="bg-ink/70" />}
        </div>
      </PhotoPlaceholder>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-xl font-bold uppercase leading-tight">
            <Link href={`/events/${event.slug}`} className="hover:text-silver focus-visible:underline">
              {l(event.title)}
            </Link>
          </h3>
          <p className="mt-1.5 text-sm text-silver">{l(event.summary)}</p>
        </div>
        <ul className="space-y-1.5 text-sm text-silver">
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-silver-dim" aria-hidden />
            {date(event.date, { weekday: "short", month: "short", day: "numeric" })}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-silver-dim" aria-hidden />
            {event.startTime} – {event.endTime}
          </li>
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-silver-dim" aria-hidden />
            <span className="flex flex-wrap items-center gap-x-3">
              <DifficultyBadge level={event.level} />
              <span>{ageText(event, t)}</span>
            </span>
          </li>
        </ul>
        <CapacityBar event={event} />
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-sm font-semibold">
            {priceText(event, t, money)}
            {event.isDemo && event.priceHKD != null && <DemoTag className="ml-2 align-middle" />}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href={`/events/${event.slug}`}>{t("btn.view")}</Link>
            </Button>
            <RegisterAction event={event} today={today} />
          </div>
        </div>
        {state === "closed" && <p className="text-xs text-silver-dim">{t("events.deadline", { date: date(event.registrationDeadline) })}</p>}
      </div>
    </article>
  );
}
