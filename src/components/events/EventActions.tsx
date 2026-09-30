"use client";

import { CalendarPlus, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { buildIcs, downloadFile, googleCalendarUrl } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ParkEvent } from "@/types";

export function EventActions({ event }: { event: ParkEvent }) {
  const { t, l, locale } = useI18n();
  const toast = useToast();
  const title = l(event.title);
  const location = siteConfig.address[locale];
  const url = `${siteConfig.url}/events/${event.slug}`;
  const share = `https://wa.me/?text=${encodeURIComponent(`${t("events.detail.shareText", { title })} ${url}`)}`;
  const google = googleCalendarUrl({ title, date: event.date, start: event.startTime, end: event.endTime, location, details: `${l(event.summary)} ${url}` });

  const ics = () => {
    downloadFile(
      `${event.slug}.ics`,
      buildIcs({ title, date: event.date, start: event.startTime, end: event.endTime, location, description: `${l(event.summary)} ${url}`, uid: event.id }),
      "text/calendar",
    );
    toast(t("events.detail.icsDone"), "success");
  };

  const btn = cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto");
  return (
    <div role="group" aria-label={t("events.detail.actions")} className="flex flex-wrap gap-3">
      <a href={share} target="_blank" rel="noopener noreferrer" className={btn}>
        <MessageCircle className="h-4 w-4" aria-hidden />
        {t("events.detail.share")}
      </a>
      <button type="button" onClick={ics} className={btn}>
        <CalendarPlus className="h-4 w-4" aria-hidden />
        {t("events.detail.ics")}
      </button>
      <a href={google} target="_blank" rel="noopener noreferrer" className={btn}>
        <CalendarPlus className="h-4 w-4" aria-hidden />
        {t("events.detail.google")}
      </a>
    </div>
  );
}
