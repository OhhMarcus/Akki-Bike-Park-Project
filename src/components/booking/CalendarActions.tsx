"use client";

import { CalendarPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getExperience } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { buildIcs, downloadFile, googleCalendarUrl } from "@/lib/dates";
import { useEvents } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";
import { ARRIVAL_MINUTES, bookingLocation, minusMinutes, sessionTimes } from "./booking-utils";

/** .ics download + Google Calendar link for a booking. */
export function CalendarActions({ booking, size = "default", className }: { booking: Booking; size?: "default" | "sm"; className?: string }) {
  const { t, l, locale } = useI18n();
  const [events] = useEvents();
  const times = sessionTimes(booking, events);
  const ev = booking.eventId ? events.find((e) => e.id === booking.eventId) : undefined;
  const exp = getExperience(booking.experienceId);
  const name = ev ? l(ev.title) : exp ? l(exp.name) : booking.experienceId;
  const title = `${siteConfig.name[locale]}: ${name}`;
  const location = bookingLocation(locale);
  const description = t("booking.calDescription", { ref: booking.reference, arrive: minusMinutes(times.start, ARRIVAL_MINUTES) });
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant="secondary"
        size={size}
        onClick={() => downloadFile(`${booking.reference}.ics`, buildIcs({ title, date: booking.date, start: times.start, end: times.end, location, description, uid: booking.id }), "text/calendar")}
      >
        <CalendarPlus className="h-4 w-4" aria-hidden />
        {t("booking.downloadIcs")}
      </Button>
      <a
        href={googleCalendarUrl({ title, date: booking.date, start: times.start, end: times.end, location, details: description })}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "secondary", size }))}
      >
        {t("booking.googleCalendar")}
      </a>
    </div>
  );
}
