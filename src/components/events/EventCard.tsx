"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { ParkEvent } from "@/types";
import { EventTag, eventTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventPrice, EventWhen, SpotsMeter } from "./parts";
import { eventPath, titleWrap, type EventSpots } from "./utils";

/** Event card: tag, title, date + time, spots left, price, Register. The whole card opens the event. */
export function EventCard({ event, spots, className }: { event: ParkEvent; spots: EventSpots; className?: string }) {
  const { t, l } = useI18n();
  const href = eventPath(event);
  const title = l(event.title);
  const open = !spots.ended && spots.remaining > 0;
  return (
    <article className={cn("surface relative flex h-full flex-col overflow-hidden transition-colors hover:border-line-strong", className)}>
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", eventTone[event.type].dot)} />
      <div className="flex flex-1 flex-col gap-3 py-4 pl-5 pr-4 sm:py-5 sm:pl-6 sm:pr-5">
        <div className="flex items-start justify-between gap-3">
          <EventTag type={event.type} />
          <EventPrice event={event} amountClassName="text-xl" className="justify-end text-right" />
        </div>
        <h3 className={cn("h-display text-[26px] sm:text-[28px]", titleWrap)}>
          <Link href={href} className="rounded-sm after:absolute after:inset-0 after:content-[''] hover:text-fg/90">
            {title}
          </Link>
        </h3>
        <EventWhen event={event} />
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{l(event.summary)}</p>
        <SpotsMeter
          className="mt-auto pt-1"
          spots={spots}
          aside={
            <Link
              href={open ? `${href}#register` : href}
              aria-label={`${open ? t("btn.register") : t("btn.details")}: ${title}`}
              className={cn(buttonVariants({ variant: "secondary", size: "md" }), "relative z-10")}
            >
              {open ? t("btn.register") : t("btn.details")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
      </div>
    </article>
  );
}
