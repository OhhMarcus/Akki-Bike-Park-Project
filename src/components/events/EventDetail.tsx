"use client";

import { eventImg } from "@/content/images";
import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { JsonLd } from "@/components/common/JsonLd";
import { PhotoPlaceholder } from "@/components/common/PhotoPlaceholder";
import { EmptyState } from "@/components/common/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FAQAccordion } from "@/components/ui/accordion";
import { siteConfig } from "@/config/site";
import { getSeedEvents } from "@/content/events";
import { useI18n } from "@/i18n/provider";
import { eventJsonLd } from "@/lib/jsonld";
import { useEvents, useRegistrations } from "@/lib/store";
import { CapacityBar } from "./CapacityBar";
import { RegisterAction } from "./EventCard";
import { EventActions } from "./EventActions";
import { EventCountdown } from "./EventCountdown";
import { ageText, priceText } from "./eventText";
import { eventState, registerHref, sortByDate, useToday, withRegistrations } from "./eventUtils";
import { MoreEvents } from "./MoreEvents";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-graphite-800 py-3 text-sm last:border-0">
      <dt className="shrink-0 text-silver-dim">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export function EventDetail({ slug }: { slug: string }) {
  const { t, l, date, money, locale } = useI18n();
  const today = useToday();
  const [stored] = useEvents();
  const [regs] = useRegistrations();

  const event = useMemo(() => {
    const found = stored.find((e) => e.slug === slug) ?? getSeedEvents().find((e) => e.slug === slug);
    return found && found.published ? withRegistrations(found, regs) : null;
  }, [stored, regs, slug]);

  const others = useMemo(
    () => sortByDate(stored.filter((e) => e.published && e.slug !== slug).map((e) => withRegistrations(e, regs))).filter((e) => !today || e.date >= today).slice(0, 3),
    [stored, regs, slug, today],
  );

  if (!event) {
    return (
      <div className="container py-24">
        <EmptyState
          title={t("events.detail.notFoundTitle")}
          body={t("events.detail.notFoundBody")}
          action={<Button asChild><Link href="/events">{t("events.detail.back")}</Link></Button>}
        />
      </div>
    );
  }

  const state = eventState(event, today);
  const jsonLd = eventJsonLd(event, locale);
  const stateNote =
    state === "full" ? t("events.detail.registerFull") : state === "closed" ? t("events.detail.registerClosed") : state === "ended" ? t("events.detail.registerEnded") : null;
  const registerLabel = state === "full" ? t("events.waitlist") : t("btn.register");

  return (
    <div className="pb-40 md:pb-20">
      {jsonLd && <JsonLd data={jsonLd} />}
      <div className="container pt-8 md:pt-12">
        <Link href="/events" className="inline-flex min-h-11 items-center gap-2 text-sm text-silver hover:text-bone">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("events.detail.back")}
        </Link>

        <header className="mt-4 grid gap-8 lg:grid-cols-2">
          <PhotoPlaceholder src={eventImg(event)} alt={l(event.title)} className="aspect-[16/10] rounded-lg" priority />
          <div className="flex flex-col justify-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="silver">{t(`evtype.${event.type}`)}</Badge>
              {event.isDemo && <DemoTag />}
            </div>
            <h1 className="h-section">{l(event.title)}</h1>
            <p className="text-silver">{l(event.summary)}</p>
            <p className="text-lg font-semibold">
              {date(event.date, { weekday: "long", month: "long", day: "numeric" })}
              <span className="text-silver"> · {event.startTime} – {event.endTime}</span>
            </p>
            <EventCountdown event={event} />
          </div>
        </header>

        {event.isDemo && (
          <p role="note" className="mt-8 rounded-lg border border-signal/40 bg-signal/5 px-4 py-3 text-sm text-signal">
            {t("events.detail.demoBanner")}
          </p>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-12">
            <section aria-labelledby="ev-about">
              <h2 id="ev-about" className="h-section mb-4">{t("events.detail.about")}</h2>
              <p className="max-w-prose leading-relaxed text-silver">{l(event.description)}</p>
            </section>

            <section aria-labelledby="ev-schedule">
              <h2 id="ev-schedule" className="h-section mb-4">{t("events.detail.schedule")}</h2>
              <ol className="space-y-0 border-l border-graphite-600">
                {event.schedule.map((s, i) => (
                  <li key={i} className="relative pb-6 pl-6 last:pb-0">
                    <span aria-hidden className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-bone" />
                    <p className="font-display text-lg font-bold tabular-nums">{s.time}</p>
                    <p className="text-sm text-silver">{l(s.item)}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="ev-org">
              <h2 id="ev-org" className="h-section mb-4">{t("events.detail.organiser")}</h2>
              <div className="rounded-lg border border-graphite-700 bg-graphite-900 p-5">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {l(event.organizer.name)}
                  {event.isDemo && <DemoTag label={t("demo.placeholder")} />}
                </p>
                <p className="mt-1 text-sm text-silver">{l(event.organizer.role)}</p>
              </div>
            </section>

            <section aria-labelledby="ev-gear">
              <h2 id="ev-gear" className="h-section mb-4">{t("events.detail.gear")}</h2>
              <ul className="space-y-2">
                {event.requiredEquipment.map((g, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-silver">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-trail-green" aria-hidden />
                    {l(g)}
                  </li>
                ))}
              </ul>
            </section>

            {event.faq.length > 0 && (
              <section aria-labelledby="ev-faq">
                <h2 id="ev-faq" className="h-section mb-4">{t("events.detail.faq")}</h2>
                <FAQAccordion items={event.faq.map((f) => ({ q: l(f.q), a: l(f.a) }))} />
              </section>
            )}

            <EventActions event={event} />
          </div>

          <aside aria-labelledby="ev-facts" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-graphite-700 bg-graphite-900 p-5">
              <h2 id="ev-facts" className="eyebrow mb-2">{t("events.detail.facts")}</h2>
              <dl>
                <Fact label={t("label.date")}>{date(event.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</Fact>
                <Fact label={t("label.time")}>{event.startTime} – {event.endTime}</Fact>
                <Fact label={t("label.level")}><DifficultyBadge level={event.level} className="justify-end" /></Fact>
                <Fact label={t("label.age")}>{ageText(event, t)}</Fact>
                <Fact label={t("label.price")}>
                  {priceText(event, t, money)}
                  {event.isDemo && event.priceHKD != null && <DemoTag className="ml-2 align-middle" />}
                </Fact>
                <Fact label={t("events.detail.deadline")}>{date(event.registrationDeadline, { weekday: undefined, year: "numeric" })}</Fact>
                <Fact label={t("events.detail.location")}>
                  <span className="block max-w-[14rem] text-sm">{siteConfig.address[locale]}</span>
                </Fact>
              </dl>
              <CapacityBar event={event} className="mt-4" />
              <div className="mt-5 hidden md:block">
                <RegisterAction event={event} today={today} size="lg" className="w-full" />
                {stateNote && <p className="mt-3 text-xs text-silver">{stateNote}</p>}
              </div>
            </div>
          </aside>
        </div>

        {others.length > 0 && <MoreEvents events={others} today={today} />}
      </div>

      {/* Sticky register bar (mobile), sits above the global Book bar */}
      <div className="no-print fixed inset-x-0 bottom-[4.5rem] z-30 border-t border-graphite-700 bg-ink/95 p-3 backdrop-blur md:hidden">
        {stateNote && <p className="mb-2 text-xs text-silver">{stateNote}</p>}
        {state === "open" || state === "full" ? (
          <Button asChild size="lg" variant={state === "full" ? "secondary" : "primary"} className="w-full">
            <Link href={registerHref(event, state)}>{registerLabel}</Link>
          </Button>
        ) : (
          <Button disabled size="lg" className="w-full">{state === "ended" ? t("events.ended") : t("events.closed")}</Button>
        )}
      </div>
    </div>
  );
}
