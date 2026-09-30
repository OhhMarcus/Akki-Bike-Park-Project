"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import type { ParkEvent } from "@/types";
import { EventCard } from "./EventCard";

export function MoreEvents({ events, today }: { events: ParkEvent[]; today: string | null }) {
  const { t } = useI18n();
  return (
    <section aria-labelledby="ev-more" className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="ev-more" className="h-section">{t("events.detail.more")}</h2>
        <Button asChild variant="ghost">
          <Link href="/events">{t("btn.viewAll")}</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e.id} event={e} today={today} />
        ))}
      </div>
    </section>
  );
}
