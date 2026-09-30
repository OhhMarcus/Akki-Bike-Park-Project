"use client";

import Link from "next/link";
import { CheckCircle2, Download, Mail, MapPin, Printer } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { getExperience } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { downloadFile } from "@/lib/dates";
import { useEvents } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";
import { CalendarActions } from "./CalendarActions";
import { ARRIVAL_MINUTES, minusMinutes, sessionTimes } from "./booking-utils";

export function ConfirmationView({ booking }: { booking: Booking }) {
  const { t, l, locale, date: fmt, money } = useI18n();
  const [events] = useEvents();
  const times = sessionTimes(booking, events);
  const arrive = minusMinutes(times.start, ARRIVAL_MINUTES);
  const ev = booking.eventId ? events.find((e) => e.id === booking.eventId) : undefined;
  const exp = getExperience(booking.experienceId);
  const name = ev ? l(ev.title) : exp ? l(exp.name) : "";
  const dateLong = fmt(booking.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const bring = ["booking.bring.helmet", "booking.bring.shoes", "booking.bring.water", "booking.bring.id", "booking.bring.waiver"] as const;

  function download() {
    const lines = [
      `${siteConfig.name[locale]}: ${t("booking.confirmedTitle")} (${t("demo.tag")})`,
      `${t("booking.reference")}: ${booking.reference}`,
      `${t("booking.experience")}: ${name}`,
      `${t("label.date")}: ${dateLong}`,
      `${t("booking.session")}: ${times.start}-${times.end} (${t("demo.tag")})`,
      `${t("booking.arriveBy")}: ${arrive}`,
      `${t("label.riders")}: ${booking.participants.map((p) => p.name).join(", ")}`,
      `${t("label.total")}: ${money(booking.total)} (${t("booking.demoNoCharge")})`,
      `${t("booking.cancelPolicy", { hours: siteConfig.cancellationWindowHours })}`,
    ];
    downloadFile(`${booking.reference}.txt`, lines.join("\n"));
  }

  return (
    <div className="space-y-6">
      <section className="surface space-y-5 p-5 md:p-6" aria-labelledby="confirmed-title">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-trail-green" aria-hidden />
          <div>
            <h2 id="confirmed-title" tabIndex={-1} data-step-heading className="font-display text-3xl font-bold uppercase">{t("booking.confirmedTitle")}</h2>
            <p className="text-sm text-silver">{t("booking.confirmedBody")}</p>
          </div>
        </div>
        <div className="rounded-lg border border-graphite-600 bg-graphite-950 p-4 text-center">
          <p className="eyebrow">{t("booking.reference")}</p>
          <p className="mt-1 font-display text-4xl font-extrabold tracking-wider" data-testid="booking-reference">{booking.reference}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-signal"><DemoTag />{t("booking.demoNoCharge")}</p>
        </div>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-silver-dim">{t("booking.experience")}</dt><dd className="font-medium">{name}</dd></div>
          <div><dt className="text-silver-dim">{t("label.date")}</dt><dd className="font-medium">{dateLong}</dd></div>
          <div><dt className="text-silver-dim">{t("booking.session")}</dt><dd className="flex flex-wrap items-center gap-2 font-medium">{t(`period.${booking.period}`)} · {times.start}–{times.end} <DemoTag /></dd></div>
          <div><dt className="text-silver-dim">{t("booking.arriveBy")}</dt><dd className="flex flex-wrap items-center gap-2 font-medium">{arrive} <DemoTag /></dd><dd className="text-xs text-silver-dim">{t("booking.arriveNote", { n: ARRIVAL_MINUTES })}</dd></div>
          <div className="sm:col-span-2">
            <dt className="text-silver-dim">{t("label.riders")}</dt>
            <dd><ul className="mt-1 space-y-0.5 font-medium">{booking.participants.map((p) => <li key={p.id}>{p.name} <span className="font-normal text-silver-dim">· {p.age} · {t(`level.${p.level}`)}</span></li>)}</ul></dd>
          </div>
          <div><dt className="text-silver-dim">{t("label.total")}</dt><dd className="font-medium">{money(booking.total)} <span className="text-xs font-normal text-silver-dim">({t("pay.paid_demo")})</span></dd></div>
        </dl>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="surface p-5" aria-labelledby="bring-title">
          <h3 id="bring-title" className="mb-3 font-display text-xl font-bold uppercase">{t("booking.bringTitle")}</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-silver">{bring.map((k) => <li key={k}>{t(k)}</li>)}</ul>
        </section>
        <section className="surface space-y-2 p-5" aria-labelledby="dir-title">
          <h3 id="dir-title" className="font-display text-xl font-bold uppercase">{t("booking.directionsTitle")}</h3>
          <p className="flex items-start gap-2 text-sm text-silver"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><span>{siteConfig.address[locale]} {!siteConfig.address.verified && <DemoTag label={t("demo.placeholder")} />}</span></p>
          <Link href="/visit" className="inline-block min-h-11 py-2 text-sm underline hover:text-bone">{t("booking.directionsLink")}</Link>
        </section>
      </div>

      <section className="surface space-y-3 p-5" aria-labelledby="email-title">
        <div className="flex items-center justify-between gap-2">
          <h3 id="email-title" className="flex items-center gap-2 font-display text-xl font-bold uppercase"><Mail className="h-5 w-5" aria-hidden />{t("booking.emailTitle")}</h3>
          <DemoTag />
        </div>
        <div className="space-y-2 rounded-md border border-graphite-600 bg-graphite-950 p-4 text-sm">
          <p className="break-words text-silver-dim">{t("booking.emailTo")}: <span className="text-bone">{booking.contactEmail}</span></p>
          <p className="text-silver-dim">{t("booking.emailSubject")}: <span className="text-bone">{t("booking.emailSubjectText", { ref: booking.reference })}</span></p>
          <hr className="border-graphite-700" />
          <p>{t("booking.emailHello", { name: booking.contactName })}</p>
          <p className="text-silver">{t("booking.emailBody", { exp: name, date: dateLong, arrive })}</p>
          <p className="text-xs text-silver-dim">{t("booking.emailFoot")}</p>
        </div>
      </section>

      <div className="no-print space-y-4">
        <CalendarActions booking={booking} />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={download}><Download className="h-4 w-4" aria-hidden />{t("booking.downloadConfirmation")}</Button>
          <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden />{t("btn.print")}</Button>
          <WhatsAppButton text={t("booking.waRef", { ref: booking.reference })} label={t("btn.whatsapp")} />
        </div>
        <Link href="/my-bookings" className={cn(buttonVariants(), "w-full sm:w-auto")}>{t("booking.viewMyBookings")}</Link>
      </div>
    </div>
  );
}
