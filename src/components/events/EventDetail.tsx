"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Bike, CalendarDays, CloudRain, Droplets, Footprints, HardHat, Hourglass, MapPin, ShieldCheck, Users,
} from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { useAvailability, useEvents, useNowHK, usePublishedEvents } from "@/lib/hooks";
import { useHydrated } from "@/lib/store";
import { fromMin, hkInstant, toMin } from "@/lib/time";
import { SectionTitle } from "@/components/brand/Headline";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";
import { Countdown } from "@/components/common/Countdown";
import { EventTag, eventTone } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CategoryTable } from "./CategoryTable";
import { EventActions } from "./EventActions";
import { EventCard } from "./EventCard";
import { EventPrice, SpotsMeter, SpotsText } from "./parts";
import { RegisterSheet } from "./RegisterSheet";
import { paragraphs, photoSlotFor, titleWrap } from "./utils";

type Icon = typeof Bike;

const bring: [Icon, MessageKey][] = [
  [HardHat, "events.bring.helmet"],
  [Bike, "events.bring.bike"],
  [Footprints, "events.bring.shoes"],
  [Droplets, "events.bring.water"],
];
const know: [Icon, MessageKey][] = [
  [ShieldCheck, "events.know.waiver"],
  [CloudRain, "events.know.weather"],
  [Users, "events.know.spots"],
];

function Notice({ icon: I, title, body }: { icon: Icon; title: string; body: string }) {
  const { t } = useI18n();
  return (
    <div className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <I className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted">{body}</p>
        </div>
      </div>
      <Link href="/events" className={cn(buttonVariants({ variant: "secondary" }), "shrink-0")}>
        {t("events.seeAll")}
      </Link>
    </div>
  );
}

function DetailSkeleton() {
  const { t } = useI18n();
  return (
    <div aria-busy>
      <h1 className="sr-only">{t("nav.events")}</h1>
      <Skeleton className="h-[520px] rounded-none sm:h-[540px] lg:h-[560px]" />
      <div className="container grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-14 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-28" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="hidden h-96 lg:block" />
      </div>
    </div>
  );
}

/**
 * /events/[slug]: looks the event up in the live store, so events created in
 * Admin → Events work too. Seed events render on the server; anything else
 * waits for hydration, then shows the event or a not-found state.
 */
export function EventDetail({ slug }: { slug: string }) {
  const { t, l, fmt } = useI18n();
  const hydrated = useHydrated();
  const now = useNowHK();
  const avail = useAvailability(now);
  const [events] = useEvents();
  const published = usePublishedEvents();
  const event = events.find((e) => e.slug === slug && e.published);
  const [reg, setReg] = useState<{ open: boolean; category?: string; n: number }>({ open: false, n: 0 });
  const hashChecked = useRef(false);
  const opener = useRef<HTMLElement | null>(null);

  const spots = event ? avail.eventSpots(event) : null;
  const canRegister = !!spots && !spots.ended && spots.remaining > 0;
  const openRegister = (category?: string) => {
    opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    setReg((r) => ({ open: true, category, n: r.n + 1 }));
  };
  const onSheetChange = (open: boolean) => {
    setReg((r) => ({ ...r, open }));
    // the sheet has no Radix trigger to return to, so hand focus back to whatever opened it
    if (!open) setTimeout(() => opener.current?.focus(), 0);
  };

  // "Register" links elsewhere point at #register: open the sheet once the clock is known
  useEffect(() => {
    if (hashChecked.current || !now || !event) return;
    hashChecked.current = true;
    if (window.location.hash !== "#register") return;
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    if (canRegister) setReg((r) => ({ open: true, n: r.n + 1 }));
  }, [now, event, canRegister]);

  if (!event || !spots) {
    if (!hydrated) return <DetailSkeleton />;
    return (
      <section className="container py-16 sm:py-24">
        <h1 className="sr-only">{t("events.notFound.title")}</h1>
        <EmptyState
          title={t("events.notFound.title")}
          body={t("events.notFound.body")}
          action={
            <Link href="/events" className={buttonVariants({ size: "lg" })}>
              {t("events.seeAll")}
            </Link>
          }
        />
      </section>
    );
  }

  const tone = eventTone[event.type];
  const full = !spots.ended && spots.remaining <= 0;
  // eventSpots lists categories in the event's order
  const rows = event.categories.map((category, i) => ({ category, spots: spots.categories[i] }));
  const more = published
    .filter((e) => e.id !== event.id)
    .map((e) => ({ event: e, spots: avail.eventSpots(e) }))
    .filter((x) => !x.spots.ended)
    .slice(0, 3);
  const day = [
    { time: fromMin(Math.max(0, toMin(event.start) - 15)), title: t("events.day.arrive"), body: t("book.done.arrive") },
    { time: event.start, title: t("events.day.start"), body: t("events.day.startBody") },
    { time: event.end, title: t("events.day.end"), body: t("events.day.endBody") },
  ];
  const registerLabel = canRegister ? t("btn.register") : t("status.full");

  return (
    <div>
      <Photo
        slot={photoSlotFor(event)}
        alt={t(`events.photo.${event.type}.alt`)}
        what={t(`events.photo.${event.type}.what`)}
        fade="full"
        rounded={false}
        priority
        className="flex min-h-[520px] flex-col border-b border-line sm:min-h-[540px] lg:min-h-[560px]"
      >
        <div className="container flex flex-1 flex-col justify-end gap-6 pb-8 pt-14 sm:pb-10 lg:pb-12">
          <Link href="/events" className="-ml-1 inline-flex min-h-11 w-fit items-center gap-2 rounded-md px-1 text-sm font-semibold text-fg/80 hover:text-fg">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("events.back")}
          </Link>
          <div className="space-y-4">
            <EventTag type={event.type} />
            <h1 className={cn("h1 max-w-4xl", titleWrap)}>{l(event.title)}</h1>
            <p className="max-w-2xl text-base leading-relaxed text-fg/85 sm:text-lg">{l(event.summary)}</p>
          </div>
          <dl className="grid gap-3 text-[15px] sm:flex sm:flex-wrap sm:gap-x-8">
            <div className="flex items-start gap-2.5">
              <dt>
                <CalendarDays className="mt-0.5 h-5 w-5 text-muted" aria-hidden />
                <span className="sr-only">{t("book.done.when")}</span>
              </dt>
              <dd>
                <span className="font-semibold">{fmt.dateWeekday(event.date)}</span>
                <span className="text-muted"> · </span>
                <span className="tabular">{fmt.timeRange(event.start, event.end)}</span>
              </dd>
            </div>
            <div className="flex items-start gap-2.5">
              <dt>
                <MapPin className="mt-0.5 h-5 w-5 text-muted" aria-hidden />
                <span className="sr-only">{t("book.done.where")}</span>
              </dt>
              <dd>
                {l(site.location.area)}
                {site.location.placeholder && <Swap />}
                <Link href="/visit" className="relative -my-3 ml-3 inline-block py-3 font-semibold underline decoration-fg/30 underline-offset-4 hover:decoration-fg">
                  {t("events.getThere")}
                </Link>
              </dd>
            </div>
          </dl>
          <div className="grid max-w-3xl gap-6 sm:grid-cols-2 sm:items-end">
            {event.type === "race" && !spots.ended && (
              <div>
                <p className="eyebrow mb-2 text-xs">{t("events.startsIn")}</p>
                <Countdown to={hkInstant(event.date, event.start)} />
              </div>
            )}
            <SpotsMeter spots={spots} aside={<span className="text-xs text-muted">{t("spots.max", { n: spots.capacity })}</span>} />
          </div>
        </div>
      </Photo>

      <div className="container grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 lg:py-14 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-14">
          {spots.ended && <Notice icon={Hourglass} title={t("events.ended.title")} body={t("events.ended.body")} />}
          {full && <Notice icon={Users} title={t("events.full.title")} body={t("events.full.body")} />}

          <section aria-labelledby="event-about">
            <h2 id="event-about" className="h3">{t("events.about")}</h2>
            <div className="mt-4 max-w-2xl space-y-4 text-base leading-relaxed text-fg/85 sm:text-[17px]">
              {paragraphs(l(event.body)).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section id="categories" aria-labelledby="event-categories" className="scroll-mt-24">
            <div className="flex flex-wrap items-center">
              <h2 id="event-categories" className="h3">{t("events.categories")}</h2>
              {site.prices.placeholder && <Swap label={t("demo.pricesPlaceholder")} />}
            </div>
            <p className="mt-2 text-sm text-muted">{t("events.categoriesLead")}</p>
            <CategoryTable className="mt-5" rows={rows} ended={spots.ended} onRegister={openRegister} />
          </section>

          <div className="grid gap-12 md:grid-cols-2 md:gap-8">
            <section aria-labelledby="event-day">
              <h2 id="event-day" className="h3">{t("events.onTheDay")}</h2>
              <ol className="mt-5 space-y-5 border-l border-line-strong">
                {day.map((s) => (
                  <li key={s.title} className="relative pl-5">
                    <span aria-hidden className={cn("absolute -left-[5px] top-1 h-2.5 w-2.5 rotate-45", tone.dot)} />
                    <p className="font-display text-lg font-extrabold italic leading-none tabular [font-synthesis:none]">{fmt.time(s.time)}</p>
                    <p className="mt-1.5 font-semibold">{s.title}</p>
                    <p className="text-sm text-muted">{s.body}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section aria-labelledby="event-bring">
              <h2 id="event-bring" className="h3">{t("events.bring")}</h2>
              <ul className="mt-5 space-y-3">
                {bring.map(([I, key]) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-card">
                      <I className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="pt-1.5 text-[15px] text-fg/85">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="event-know" className="surface p-5 sm:p-6">
            <h2 id="event-know" className="h3">{t("events.know")}</h2>
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {know.map(([I, key]) => (
                <li key={key} className="flex items-start gap-3 text-sm leading-relaxed text-fg/85">
                  <I className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                  {t(key)}
                </li>
              ))}
            </ul>
          </section>

          <EventActions event={event} calendar={!spots.ended} className="lg:hidden" />
        </div>

        <aside className="hidden lg:block">
          <div className="surface sticky top-24 space-y-5 p-5 xl:p-6">
            <div>
              <p className="text-xs font-semibold text-muted">{t("label.price")}</p>
              <EventPrice event={event} amountClassName="text-4xl" className="mt-1" />
            </div>
            <SpotsMeter spots={spots} aside={<span className="text-xs text-muted">{t("spots.max", { n: spots.capacity })}</span>} />
            {!spots.ended && (
              <Button size="lg" variant={canRegister ? "primary" : "secondary"} className="w-full" disabled={!canRegister} onClick={() => openRegister()}>
                {registerLabel}
              </Button>
            )}
            <EventActions event={event} calendar={!spots.ended} className="border-t border-line pt-5" />
          </div>
        </aside>
      </div>

      {!spots.ended && (
        <div className="sticky bottom-[calc(57px_+_max(0.75rem,env(safe-area-inset-bottom)))] z-30 border-t border-line bg-ink/95 backdrop-blur md:bottom-0 lg:hidden">
          <div className="container flex items-center gap-3 py-2.5 pr-[88px] md:pr-[104px]">
            <div className="min-w-0 flex-1">
              <EventPrice event={event} amountClassName="text-xl" />
              <SpotsText spots={spots} className="block text-xs" />
            </div>
            <Button variant={canRegister ? "primary" : "secondary"} disabled={!canRegister} onClick={() => openRegister()}>
              {registerLabel}
            </Button>
          </div>
        </div>
      )}

      {more.length > 0 && (
        <section className="container pt-14 lg:pt-20">
          <SectionTitle
            title={t("events.more.title")}
            action={
              <Link href="/events" className={cn(buttonVariants({ variant: "secondary" }), "self-start sm:self-auto")}>
                {t("events.seeAll")}
              </Link>
            }
          />
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {more.map((x) => (
              <li key={x.event.id}>
                <EventCard event={x.event} spots={x.spots} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <RegisterSheet
        key={reg.n}
        event={event}
        spots={spots}
        open={reg.open}
        onOpenChange={onSheetChange}
        initialCategory={reg.category}
      />
    </div>
  );
}
