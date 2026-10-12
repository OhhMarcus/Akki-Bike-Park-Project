"use client";

import Link from "next/link";
import { ArrowRight, Ticket, Timer, Users } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { Availability } from "@/lib/hooks";
import type { SlotView } from "@/lib/schedule";
import { addDays, type HKNow } from "@/lib/time";
import { SectionTitle } from "@/components/brand/Headline";
import { Swap } from "@/components/brand/Swap";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CapacityBar } from "@/components/ui/capacity";
import { EmptyState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** The next few sessions that haven't started yet (today first, then the following days). */
function upcomingSlots(avail: Availability, now: HKNow, count: number) {
  const out: SlotView[] = [];
  for (let i = 0; i < 7 && out.length < count; i++) {
    for (const s of avail.pumpSlots(addDays(now.date, i))) {
      if (s.past) continue;
      out.push(s);
      if (out.length === count) break;
    }
  }
  return out;
}

export function PumpTeaser({ now, avail }: { now: HKNow | null; avail: Availability }) {
  const { t, fmt } = useI18n();
  const slots = now ? upcomingSlots(avail, now, 4) : null;

  return (
    <section className="container pb-12 pt-16 sm:pb-14 sm:pt-20">
      <SectionTitle eyebrow={t("nav.pump")} title={t("home.pump.title")} lead={t("home.pump.lead")} />

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg/85">
        <li className="inline-flex items-center gap-2">
          <Timer aria-hidden className="h-4 w-4 text-muted" />
          {t("home.pump.length", { d: t("fmt.minutes", { n: avail.settings.slotMinutes }) })}
          <Swap />
        </li>
        <li className="inline-flex items-center gap-2">
          <Users aria-hidden className="h-4 w-4 text-muted" />
          {t("spots.max", { n: avail.settings.slotCapacity })}
          <Swap />
        </li>
        <li className="inline-flex items-center gap-2">
          <Ticket aria-hidden className="h-4 w-4 text-muted" />
          {fmt.money(site.prices.pumpPerRider)} {t("unit.perRider")}
          {site.prices.placeholder && <Swap />}
        </li>
      </ul>

      {!slots || !now ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[150px]" />
          ))}
        </div>
      ) : slots.length ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {slots.map((s) => {
            const dim = s.status === "full" || s.status === "closed";
            return (
              <li key={s.id}>
                <Link
                  href={`/pump-track?date=${s.date}`}
                  className={cn(
                    "surface group flex h-full flex-col p-4 transition-colors hover:border-line-strong hover:bg-card-2",
                    dim && "bg-card/50",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-fg/80">{fmt.relDay(s.date, now.date)}</span>
                    <StatusBadge status={s.status} />
                  </span>
                  <span className={cn("mt-2 block font-display text-3xl font-extrabold uppercase italic leading-none tabular [font-synthesis:none]", dim && "text-fg/60")}>
                    {fmt.timeRange(s.start, s.end)}
                  </span>
                  <CapacityBar className="mt-5" booked={s.booked} capacity={s.capacity} status={s.status} />
                  <span className="mt-2.5 flex items-center justify-between gap-2 text-sm">
                    <span className={cn(s.status === "almost" ? "text-brand-amber" : dim ? "text-muted" : "text-fg/85")}>
                      {s.status === "closed" ? t(`reason.${s.closedReason ?? "other"}`) : t("spots.ofLeft", { n: s.remaining, cap: s.capacity })}
                    </span>
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState className="mt-8" title={t("home.pump.emptyTitle")} body={t("home.pump.emptyBody")} />
      )}

      <div className="mt-8">
        <Link href="/pump-track" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
          {t("cta.bookPump")}
        </Link>
      </div>
    </section>
  );
}
