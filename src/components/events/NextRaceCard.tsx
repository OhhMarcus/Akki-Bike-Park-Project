"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { ParkEvent } from "@/types";
import { hkInstant } from "@/lib/time";
import { Countdown } from "@/components/common/Countdown";
import { eventTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventPrice, EventWhen, SpotsMeter } from "./parts";
import { eventPath, titleWrap, type EventSpots } from "./utils";

/** Hero banner: the next published race with a live countdown. */
export function NextRaceCard({ event, spots }: { event: ParkEvent; spots: EventSpots }) {
  const { t, l } = useI18n();
  const href = eventPath(event);
  const open = spots.remaining > 0;
  return (
    <div className="surface relative animate-fade-up overflow-hidden bg-card/95 p-5 shadow-lift sm:p-6">
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px]", eventTone.race.dot)} />
      <p className="eyebrow flex items-center gap-2 text-brand-amber">
        <span aria-hidden className="h-2 w-2 rotate-45 bg-brand-amber" />
        {t("events.next.eyebrow")}
      </p>
      <h2 className={cn("h3 mt-3", titleWrap)}>
        <Link href={href} className="rounded-sm hover:text-fg/90">
          {l(event.title)}
        </Link>
      </h2>
      <EventWhen event={event} className="mt-3" />
      <p className="eyebrow mb-2 mt-5 text-xs">{t("events.startsIn")}</p>
      <Countdown to={hkInstant(event.date, event.start)} />
      <SpotsMeter spots={spots} className="mt-5" aside={<EventPrice event={event} amountClassName="text-xl" />} />
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={open ? `${href}#register` : href} className={cn(buttonVariants({ size: "lg" }), "flex-1")}>
          {open ? t("events.next.cta") : t("btn.details")}
        </Link>
        {open && (
          <Link href={href} className={buttonVariants({ variant: "secondary", size: "lg" })}>
            {t("btn.details")}
          </Link>
        )}
      </div>
    </div>
  );
}
