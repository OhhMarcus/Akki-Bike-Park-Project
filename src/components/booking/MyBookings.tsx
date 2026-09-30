"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { EmptyState } from "@/components/common/States";
import { DemoTag } from "@/components/common/DemoTag";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getExperience } from "@/config/pricing";
import { useI18n } from "@/i18n/provider";
import { hkToday } from "@/lib/dates";
import { useBookings, useEvents, useHydrated, useMyBookingRefs } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";
import { CalendarActions } from "./CalendarActions";
import { ChangeRequestModal } from "./ChangeRequestModal";
import { sessionTimes } from "./booking-utils";

const statusTone: Record<BookingStatus, "green" | "amber" | "red" | "neutral" | "silver"> = {
  pending: "amber", confirmed: "green", checked_in: "silver", completed: "neutral", cancelled: "red", no_show: "red",
};

function BookingCard({ booking }: { booking: Booking }) {
  const { t, l, date: fmt, money } = useI18n();
  const [events] = useEvents();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const ev = booking.eventId ? events.find((e) => e.id === booking.eventId) : undefined;
  const exp = getExperience(booking.experienceId);
  const name = ev ? l(ev.title) : exp ? l(exp.name) : "";
  const times = sessionTimes(booking, events);
  const active = booking.status === "confirmed" || booking.status === "pending";
  const canChange = active && booking.date >= hkToday() && !booking.changeRequest;
  const detailsId = `bk-${booking.id}`;

  return (
    <li className="surface space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-bold uppercase leading-tight">{name}</p>
          <p className="text-sm text-silver-dim">{booking.reference}{booking.isDemo && <> <DemoTag /></>}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone[booking.status]}>{t(`status.${booking.status}`)}</Badge>
          <Badge tone={booking.paymentStatus === "unpaid" ? "amber" : "neutral"}>{t(`pay.${booking.paymentStatus}`)}</Badge>
          {booking.changeRequest && <Badge tone="amber">{t(booking.changeRequest.type === "cancel" ? "booking.my.cancelRequested" : "booking.my.changeRequested")}</Badge>}
        </div>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-4">
        <div><dt className="text-silver-dim">{t("label.date")}</dt><dd className="font-medium">{fmt(booking.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</dd></div>
        <div><dt className="text-silver-dim">{t("label.time")}</dt><dd className="font-medium">{t(`period.${booking.period}`)} {times.start}–{times.end}</dd></div>
        <div><dt className="text-silver-dim">{t("label.riders")}</dt><dd className="font-medium">{booking.participants.length}</dd></div>
        <div><dt className="text-silver-dim">{t("label.total")}</dt><dd className="font-medium">{money(booking.total)}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen((v) => !v)}>
          {t("booking.my.details")}
          <ChevronDown className={cn("h-4 w-4", open && "rotate-180")} aria-hidden />
        </Button>
        {active && <CalendarActions booking={booking} size="sm" />}
        {canChange && <Button variant="ghost" size="sm" onClick={() => setModal(true)}>{t("booking.my.requestChange")}</Button>}
      </div>
      {open && (
        <div id={detailsId} className="space-y-3 border-t border-graphite-700 pt-4 text-sm">
          <ul className="space-y-1">
            {booking.participants.map((p) => <li key={p.id}>{p.name} <span className="text-silver-dim">· {p.age} · {t(`level.${p.level}`)} · {t(p.bike === "own" ? "booking.bikeOwnShort" : "booking.bikeRentalShort")}</span></li>)}
          </ul>
          <p className="break-words text-silver">{booking.contactName} · {booking.contactEmail} · {booking.contactPhone}</p>
          {booking.discount > 0 && <p className="text-silver">{t("booking.discount")}: −{money(booking.discount)}{booking.promoCode ? ` (${booking.promoCode})` : ""}</p>}
          {booking.changeRequest && (
            <p className="rounded-md border border-signal/40 bg-signal/5 p-3 text-silver">
              {t(booking.changeRequest.type === "cancel" ? "booking.my.cancelRequested" : "booking.my.changeRequested")}
              {booking.changeRequest.note ? `: ${booking.changeRequest.note}` : ""}
            </p>
          )}
        </div>
      )}
      <ChangeRequestModal booking={booking} open={modal} onOpenChange={setModal} />
    </li>
  );
}

export function MyBookings() {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const [bookings] = useBookings();
  const [refs] = useMyBookingRefs();
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [foundRef, setFoundRef] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<{ ref?: string; email?: string }>({});

  const mine = bookings.filter((b) => refs.includes(b.reference));
  const found = foundRef ? bookings.find((b) => b.reference === foundRef) : undefined;

  function lookup(e: React.FormEvent) {
    e.preventDefault();
    const errs: { ref?: string; email?: string } = {};
    if (!ref.trim()) errs.ref = t("val.required");
    if (!email.trim()) errs.email = t("val.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = t("val.email");
    setErrors(errs);
    if (errs.ref || errs.email) return;
    const hit = bookings.find((b) => b.reference.toUpperCase() === ref.trim().toUpperCase() && b.contactEmail.toLowerCase() === email.trim().toLowerCase());
    setFoundRef(hit ? hit.reference : null);
    setNotFound(!hit);
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="mine-title" className="space-y-4">
        <h2 id="mine-title" className="font-display text-2xl font-bold uppercase">{t("booking.my.yours")}</h2>
        {!hydrated ? (
          <div aria-busy="true" className="space-y-4"><Skeleton className="h-44" /><Skeleton className="h-44" /></div>
        ) : mine.length === 0 ? (
          <EmptyState title={t("booking.my.emptyTitle")} body={t("booking.my.emptyBody")} action={<Link href="/booking" className={buttonVariants()}>{t("cta.bookNow")}</Link>} />
        ) : (
          <ul className="space-y-4">{mine.map((b) => <BookingCard key={b.id} booking={b} />)}</ul>
        )}
      </section>

      <section aria-labelledby="find-title" className="space-y-4">
        <h2 id="find-title" className="font-display text-2xl font-bold uppercase">{t("booking.my.findTitle")}</h2>
        <form onSubmit={lookup} noValidate className="surface grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
          <Field label={t("booking.reference")} htmlFor="find-ref" error={errors.ref}>
            <Input id="find-ref" autoCapitalize="characters" autoComplete="off" value={ref} onChange={(e) => setRef(e.target.value)} aria-invalid={!!errors.ref} placeholder="AKKI-XXXXXX" />
          </Field>
          <Field label={t("label.email")} htmlFor="find-email" error={errors.email}>
            <Input id="find-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
          </Field>
          <Button type="submit" className="sm:mt-[1.625rem]"><Search className="h-4 w-4" aria-hidden />{t("btn.search")}</Button>
          <p className="text-xs text-silver-dim sm:col-span-3">{t("booking.my.demoHint")} <DemoTag /></p>
        </form>
        {notFound && <p role="alert" className="text-sm text-danger">{t("booking.my.notFound")}</p>}
        {found && <ul><BookingCard booking={found} /></ul>}
      </section>
    </div>
  );
}
