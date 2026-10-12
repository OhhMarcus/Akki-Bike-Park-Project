"use client";

import { CalendarPlus, Download } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { ParkEvent } from "@/types";
import { buildIcs, downloadFile, googleCalendarUrl } from "@/lib/calendar-links";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { eventPath, whenText } from "./utils";

const absoluteUrl = (e: ParkEvent) => `${site.url}${eventPath(e)}`;

/** Share the event to any WhatsApp chat (title, date and link prefilled). */
export function ShareButton({ event, label, className }: { event: ParkEvent; label?: string; className?: string }) {
  const { t, l, fmt } = useI18n();
  const text = t("events.share.text", {
    title: l(event.title),
    when: whenText(t, fmt, event),
    url: absoluteUrl(event),
  });
  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "secondary", font: "sans" }), "border-[#25D366]/50 text-[#5EDC8C] hover:border-[#25D366]", className)}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {label ?? t("events.share.wa")}
    </a>
  );
}

/** Share + add to calendar (.ics for Apple/Outlook, Google Calendar link; left out once an event is over). */
export function EventActions({ event, calendar = true, className }: { event: ParkEvent; calendar?: boolean; className?: string }) {
  const { t, l } = useI18n();
  const title = t("book.calTitle.event", { event: l(event.title) });
  const location = `${site.name.en} · ${l(site.location.area)}`;
  const details = `${l(event.summary)}\n${absoluteUrl(event)}`;
  const secondary = buttonVariants({ variant: "secondary", font: "sans" });
  return (
    <div className={cn("space-y-4", className)}>
      <ShareButton event={event} className="w-full" />
      {calendar && (
        <div>
          <p className="eyebrow mb-2 text-xs">{t("book.done.calendar")}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={cn(secondary, "px-3")}
              onClick={() =>
                downloadFile(
                  `akki-${event.slug}.ics`,
                  buildIcs({ uid: event.id, title, date: event.date, start: event.start, end: event.end, location, description: details }),
                  "text/calendar",
                )
              }
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("book.done.ics")}
            </button>
            <a
              className={cn(secondary, "px-3")}
              target="_blank"
              rel="noopener noreferrer"
              href={googleCalendarUrl({ title, date: event.date, start: event.start, end: event.end, location, details })}
            >
              <CalendarPlus className="h-4 w-4" aria-hidden />
              {t("book.done.google")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
