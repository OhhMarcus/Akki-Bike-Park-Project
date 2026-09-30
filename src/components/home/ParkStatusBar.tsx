"use client";

import { CalendarCheck, Clock, CloudSun, Radio } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { Skeleton } from "@/components/ui/skeleton";
import { getDaySlots } from "@/lib/availability";
import { hkToday } from "@/lib/dates";
import { useBookings, useHydrated, useOverrides, useParkStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

function Cell({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3 bg-ink/80 p-4 backdrop-blur">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-silver" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="eyebrow">{label}</p>
        <div className="text-sm font-medium text-bone">{children}</div>
      </div>
    </div>
  );
}

/** Today's status, hours, weather placeholder and remaining capacity. */
export function ParkStatusBar() {
  const { t, l } = useI18n();
  const hydrated = useHydrated();
  const [status] = useParkStatus();
  const [bookings] = useBookings();
  const [overrides] = useOverrides();

  const remaining = hydrated ? getDaySlots(hkToday(), bookings, overrides).reduce((s, x) => s + (x.status === "closed" ? 0 : x.remaining), 0) : null;
  const bar = <Skeleton className="h-5 w-24" />;

  return (
    <div role="region" aria-label={t("status.today")} className="grid grid-cols-2 gap-px overflow-hidden bg-graphite-700 lg:grid-cols-4">
      <Cell icon={Radio} label={t("status.today")}>
        {hydrated ? (
          <>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className={cn("h-2 w-2 rounded-full", status.open ? "bg-trail-green" : "bg-danger")} />
              {status.open ? t("status.open") : t("status.closed")}
            </span>
            {!status.open && l(status.note) && <p className="mt-1 text-xs font-normal text-silver">{l(status.note)}</p>}
          </>
        ) : (
          bar
        )}
      </Cell>
      <Cell icon={Clock} label={t("status.hours")}>
        <span className="mr-2">{l(siteConfig.hours.summary)}</span>
        {!siteConfig.hours.verified && <DemoTag />}
      </Cell>
      <Cell icon={CloudSun} label={t("status.weather")}>
        <span className="mr-2">{l(siteConfig.weatherPlaceholder)}</span>
        <DemoTag label={t("demo.placeholder")} />
      </Cell>
      <Cell icon={CalendarCheck} label={t("status.capacity")}>
        {remaining === null ? bar : remaining > 0 ? t("status.capacityValue", { n: remaining }) : t("avail.full")}
      </Cell>
    </div>
  );
}
