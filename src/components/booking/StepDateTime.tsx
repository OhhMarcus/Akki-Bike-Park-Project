"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { Button } from "@/components/ui/button";
import { getExperience } from "@/config/pricing";
import { useI18n } from "@/i18n/provider";
import { dayStatus, getDaySlots } from "@/lib/availability";
import { hkToday } from "@/lib/dates";
import { useBookings, useOverrides, useRegistrations } from "@/lib/store";
import type { Availability, DayPeriod, ExperienceId, ParkEvent, TimeSlot } from "@/types";
import { AvailabilityLegend } from "./AvailabilityLegend";
import { BookingCalendar } from "./BookingCalendar";
import { SlotPicker } from "./SlotPicker";
import { WaitlistForm } from "./WaitlistForm";
import { eventOpen, eventPeriod, eventRemaining } from "./booking-utils";

type Contact = { name: string; email: string; phone: string };

export function StepDateTime({ experienceId, event, date, period, partySize, waitlistMode, contact, error, onDate, onPeriod, onWaitlistMode }: {
  experienceId: ExperienceId;
  event?: ParkEvent;
  date?: string;
  period?: DayPeriod;
  partySize: number;
  waitlistMode: boolean;
  contact: Contact;
  error?: string;
  onDate: (d: string) => void;
  onPeriod: (p: DayPeriod) => void;
  onWaitlistMode: (v: boolean) => void;
}) {
  const { t, l, date: fmt } = useI18n();
  const [bookings] = useBookings();
  const [overrides] = useOverrides();
  const [regs] = useRegistrations();
  const exp = getExperience(experienceId);
  const [wl, setWl] = useState<{ date: string; period: DayPeriod; party: number } | null>(null);

  const allowed = exp?.periods ?? [];
  const min = exp?.minParticipants ?? 1;

  const getStatus = useMemo(
    () => (iso: string): Availability => {
      if (allowed.length === 3) return dayStatus(iso, bookings, overrides);
      const open = getDaySlots(iso, bookings, overrides).filter((s) => allowed.includes(s.period));
      if (open.every((s) => s.status === "closed")) return "closed";
      const live = open.filter((s) => s.status !== "closed");
      if (live.every((s) => s.status === "full" || s.remaining < min)) return "full";
      if (live.some((s) => s.status === "available")) return "available";
      return "limited";
    },
    [allowed, bookings, overrides, min],
  );

  const slots: TimeSlot[] = useMemo(
    () => (date ? getDaySlots(date, bookings, overrides).filter((s) => allowed.includes(s.period)) : []),
    [date, bookings, overrides, allowed],
  );

  // ---- Event registration: use the event's own date, time and capacity ----
  if (experienceId === "event") {
    if (!event) {
      return (
        <div role="alert" className="surface space-y-3 p-5">
          <p className="text-sm text-danger">{error ?? t("booking.eventMissing")}</p>
        </div>
      );
    }
    const remaining = eventRemaining(event, regs);
    const today = hkToday();
    const open = eventOpen(event, today);
    const full = remaining <= 0;
    const evPeriod = eventPeriod(event);
    const showWaitlist = full || waitlistMode;
    return (
      <div className="space-y-4">
        <div className="surface space-y-4 p-5">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-1 h-6 w-6 text-silver" aria-hidden />
            <div>
              <p className="font-display text-2xl font-bold uppercase leading-tight">{l(event.title)}</p>
              <p className="text-sm text-silver">{fmt(event.date, { weekday: "long", month: "long", day: "numeric" })} · {event.startTime}–{event.endTime} <DemoTag /></p>
            </div>
          </div>
          <p className={full ? "text-sm font-medium text-danger" : remaining <= Math.max(3, Math.round(event.capacity * 0.2)) ? "text-sm font-medium text-signal" : "text-sm text-trail-green"}>
            {full ? t("avail.full") : remaining <= Math.max(3, Math.round(event.capacity * 0.2)) ? t("label.spots", { n: remaining }) : t("avail.available")}
          </p>
          {!open && <p role="alert" className="text-sm text-danger">{t("booking.eventClosed")}</p>}
          {open && !full && waitlistMode && <Button variant="secondary" onClick={() => onWaitlistMode(false)}>{t("booking.registerInstead")}</Button>}
          {open && showWaitlist && <Button onClick={() => setWl({ date: event.date, period: evPeriod, party: partySize })}>{t("booking.waitlistCta")}</Button>}
          {open && !full && !waitlistMode && remaining < partySize && <p className="text-sm text-signal">{t("booking.slotTooSmall", { n: remaining, party: partySize })}</p>}
          <Link href={`/events/${event.slug}`} className="inline-block text-sm underline text-silver hover:text-bone">{t("booking.eventDetails")}</Link>
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <WaitlistForm open={wl !== null} onOpenChange={(o) => !o && setWl(null)} experienceId="event" date={event.date} period={evPeriod} partySize={wl?.party ?? 1} defaults={contact} />
        <AutoOpen active={open && waitlistMode && !wl} onOpen={() => setWl({ date: event.date, period: evPeriod, party: partySize })} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <AvailabilityLegend />
        <BookingCalendar value={date} getStatus={getStatus} onSelect={onDate} />
      </div>

      {date ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-bold uppercase">{fmt(date, { weekday: "long", month: "long", day: "numeric" })}</h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-silver-dim">{t("booking.sessionTimes")} <DemoTag /></span>
          </div>
          <SlotPicker slots={slots} value={period} partySize={partySize} minParticipants={min} onChange={onPeriod} onWaitlist={(s) => setWl({ date: s.date, period: s.period, party: partySize })} />
        </div>
      ) : (
        <p className="text-sm text-silver">{t("booking.pickDate")}</p>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {wl && <WaitlistForm open onOpenChange={(o) => !o && setWl(null)} experienceId={experienceId} date={wl.date} period={wl.period} partySize={wl.party} defaults={contact} />}
    </div>
  );
}

/** Opens the waitlist modal once when arriving with ?waitlist=1. */
function AutoOpen({ active, onOpen }: { active: boolean; onOpen: () => void }) {
  const fired = useRef(false);
  useEffect(() => {
    if (active && !fired.current) {
      fired.current = true;
      onOpen();
    }
  }, [active, onOpen]);
  return null;
}
