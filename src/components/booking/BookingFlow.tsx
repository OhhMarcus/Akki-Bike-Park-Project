"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { getExperience } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { getSlot } from "@/lib/availability";
import { hkToday } from "@/lib/dates";
import { calcPrice, validatePromo } from "@/lib/pricing";
import { saveBooking, useBookings, useDraft, useEvents, useHydrated, useOverrides, usePromos, useRegistrations } from "@/lib/store";
import { appendToCollection } from "@/lib/store";
import { bookingReference, uid } from "@/lib/utils";
import { bookingSchema } from "@/lib/validation";
import type { Booking, DayPeriod, ExperienceId, ParticipantInput, PaymentMethodId } from "@/types";
import { BookingStepper } from "./BookingStepper";
import { ConfirmationView } from "./ConfirmationView";
import { PaymentPanel, type PayState } from "./PaymentPanel";
import { StepDateTime } from "./StepDateTime";
import { StepExperience } from "./StepExperience";
import { StepParticipants } from "./StepParticipants";
import { StepReview } from "./StepReview";
import { participantFieldId } from "./ParticipantForm";
import {
  STEP_COUNT, cleanParticipant, eventOpen, eventPeriod, eventRemaining, fitParticipants, focusFirstError, fromDraft,
  initialState, toDraft, validateContact, validateParticipants, type FlowInit, type FlowState,
} from "./booking-utils";

const leads = ["booking.lead.1", "booking.lead.2", "booking.lead.3", "booking.lead.4", "booking.lead.5"] as const;
const titles = ["booking.step.experience", "booking.step.datetime", "booking.step.riders", "booking.step.review", "booking.step.payment"] as const;

export function BookingFlow({ init }: { init: FlowInit }) {
  const { t, money } = useI18n();
  const toast = useToast();
  const hydrated = useHydrated();
  const [bookings] = useBookings();
  const [overrides] = useOverrides();
  const [events] = useEvents();
  const [registrations] = useRegistrations();
  const [promos, setPromos] = usePromos();
  const [draft, setDraft] = useDraft();

  const [s, setS] = useState<FlowState>(() => initialState(init));
  const [dirty, setDirty] = useState(false);
  const [bannerHidden, setBannerHidden] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [waitlistMode, setWaitlistMode] = useState(!!init.waitlist && !!init.event);
  const [payState, setPayState] = useState<PayState>("idle");
  const [simulateFail, setSimulateFail] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const doneRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const patch = useCallback((p: Partial<FlowState>) => {
    setS((prev) => ({ ...prev, ...p }));
    setDirty(true);
  }, []);

  // ---------- derived ----------
  const today = hydrated ? hkToday() : "";
  const exp = s.experienceId ? getExperience(s.experienceId) : undefined;
  const event = s.experienceId === "event" ? events.find((e) => e.id === s.eventId && e.published) : undefined;
  const selectableEvents = useMemo(() => events.filter((e) => e.published && (!today || e.date >= today)).sort((a, b) => a.date.localeCompare(b.date)), [events, today]);
  const date = event ? event.date : s.date;
  const period: DayPeriod | undefined = event ? eventPeriod(event) : s.period;
  const slot = !event && date && period ? getSlot(date, period, bookings, overrides) : undefined;
  const remaining = event ? eventRemaining(event, registrations) : slot ? slot.remaining : Infinity;
  const promoResult = s.promoCode ? validatePromo(s.promoCode, promos) : null;
  const promo = promoResult && promoResult.ok ? promoResult.promo : null;
  const price = useMemo(
    () => calcPrice({ experienceId: s.experienceId ?? "entry", participants: s.participants, eventPrice: event?.priceHKD ?? null, promo }),
    [s.experienceId, s.participants, event, promo],
  );
  const min = exp?.minParticipants ?? 1;
  const max = exp?.maxParticipants ?? 40;

  // ---------- validation ----------
  const validate = useCallback((step: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!s.experienceId) e.experience = "booking.err.experience";
      else if (s.experienceId === "event") {
        if (!s.eventId) e.experience = "booking.err.event";
        else if (!event) e.experience = "booking.eventMissing";
      }
    } else if (step === 2) {
      if (event) {
        if (!eventOpen(event, hkToday())) e.slot = "booking.eventClosed";
        else if (waitlistMode || remaining <= 0) e.slot = "booking.err.eventFull";
        else if (remaining < min) e.slot = "booking.err.slotFull";
      } else if (!date) e.slot = "booking.err.date";
      else if (!period || !slot) e.slot = "booking.err.slot";
      else if (slot.status === "full" || slot.status === "closed" || slot.remaining < min) e.slot = "booking.err.slotFull";
    } else if (step === 3) {
      Object.assign(e, validateContact(s));
      Object.assign(e, validateParticipants(s.participants));
      if (s.participants.length < min) e.count = "booking.err.min";
      else if (s.participants.length > remaining) e.count = "booking.err.capacity";
    } else if (step === 4) {
      if (!s.terms) e.terms = "val.terms";
      if (!s.waiver) e.waiver = "val.waiver";
    }
    return e;
  }, [s, event, waitlistMode, remaining, min, date, period, slot]);

  const errors = useMemo(() => (attempted ? validate(s.step) : {}), [attempted, validate, s.step]);

  const focusErrors = (e: Record<string, string>) => {
    const ids = Object.keys(e).map((k) => {
      if (k === "count") return "riders-count";
      if (/^\d+\./.test(k)) {
        const i = Number(k.split(".")[0]);
        return participantFieldId(i, k.slice(String(i).length + 1));
      }
      return k;
    });
    requestAnimationFrame(() => focusFirstError(ids));
  };

  // ---------- navigation ----------
  const goTo = useCallback((step: number) => {
    setS((prev) => ({ ...prev, step }));
    setAttempted(false);
    setDirty(true);
  }, []);

  function next() {
    const e = validate(s.step);
    if (Object.keys(e).length) {
      setAttempted(true);
      focusErrors(e);
      return;
    }
    goTo(s.step + 1);
  }
  const back = () => goTo(Math.max(1, s.step - 1));

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const heading = rootRef.current?.querySelector<HTMLElement>("[data-step-heading]");
    rootRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    heading?.focus({ preventScroll: true });
  }, [s.step, confirmed]);

  // ---------- draft autosave ----------
  useEffect(() => {
    if (!dirty || confirmed || doneRef.current) return;
    const timer = setTimeout(() => {
      if (!doneRef.current) setDraft(toDraft(s));
    }, 400);
    return () => clearTimeout(timer);
  }, [s, dirty, confirmed, setDraft]);

  const showBanner = hydrated && !!draft && draft.step > 0 && !bannerHidden && !dirty && !confirmed;
  function resume() {
    if (!draft) return;
    setS((prev) => fromDraft(draft, prev));
    setWaitlistMode(false);
    setDirty(true);
    setBannerHidden(true);
  }
  function startOver() {
    setDraft(null);
    setS(initialState({ ...init, waitlist: false }));
    setBannerHidden(true);
  }

  // ---------- handlers ----------
  function selectExperience(id: ExperienceId) {
    setS((prev) => {
      const keepPeriod = prev.period && getExperience(id)?.periods.includes(prev.period) ? prev.period : undefined;
      return { ...prev, experienceId: id, eventId: id === "event" ? prev.eventId : undefined, period: keepPeriod, participants: fitParticipants(prev.participants, id) };
    });
    setWaitlistMode(false);
    setDirty(true);
  }

  // ---------- payment ----------
  async function pay() {
    if (payState === "processing" || !s.experienceId || !date || !period) return;
    const e3 = { ...validate(3), ...validate(4) };
    if (Object.keys(e3).length) {
      const step = Object.keys(validate(3)).length ? 3 : 4;
      toast(t("booking.err.fix"), "error");
      setAttempted(true);
      setS((prev) => ({ ...prev, step }));
      focusErrors(e3);
      return;
    }
    setPayState("processing");
    setDraft(toDraft(s));
    if (simulateFail) {
      await new Promise((r) => setTimeout(r, 1200));
      setPayState("failed");
      return;
    }
    const parsed = bookingSchema.safeParse({
      experienceId: s.experienceId,
      eventId: event?.id,
      date,
      period,
      participants: s.participants.map(cleanParticipant),
      contactName: s.contactName,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      promoCode: promo?.code,
      paymentMethod: s.paymentMethod,
      termsAccepted: s.terms,
      waiverAccepted: s.waiver,
      marketingConsent: s.marketingConsent,
    });
    if (!parsed.success) {
      setPayState("idle");
      toast(t("booking.err.fix"), "error");
      setAttempted(true);
      goTo(3);
      return;
    }
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      if (res.status === 429) {
        setPayState("idle");
        toast(t("state.rateLimited"), "error");
        return;
      }
      if (res.status === 422) {
        setPayState("idle");
        toast(t("booking.err.fix"), "error");
        goTo(3);
        return;
      }
      if (!res.ok) throw new Error("booking");
      const body = (await res.json()) as { reference?: string };
      const d = parsed.data;
      const booking: Booking = {
        id: uid("bk"),
        reference: body.reference ?? bookingReference(),
        experienceId: d.experienceId,
        eventId: d.eventId,
        date: d.date,
        period: d.period,
        participants: d.participants as ParticipantInput[],
        contactName: d.contactName,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        status: "confirmed",
        paymentStatus: "paid_demo",
        paymentMethod: d.paymentMethod,
        subtotal: price.subtotal,
        discount: price.discount,
        total: price.total,
        promoCode: promo?.code,
        waiverAccepted: true,
        waiverId: siteConfig.waiverVersion,
        termsAccepted: true,
        marketingConsent: d.marketingConsent,
        createdAt: new Date().toISOString(),
        isDemo: true,
      };
      doneRef.current = true;
      saveBooking(booking);
      if (promo) setPromos((prev) => prev.map((p) => (p.id === promo.id ? { ...p, used: p.used + 1 } : p)));
      if (booking.eventId) {
        for (const p of booking.participants) {
          appendToCollection("registrations", [], { id: uid("reg"), eventId: booking.eventId, bookingId: booking.id, riderName: p.name, email: booking.contactEmail, createdAt: booking.createdAt });
        }
      }
      setDraft(null);
      setConfirmed(booking);
      setPayState("idle");
      setS((prev) => ({ ...prev, step: 6 }));
    } catch {
      setPayState("failed");
    }
  }

  // ---------- render ----------
  const step = confirmed ? 6 : s.step;
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey, { n: Number.isFinite(remaining) ? remaining : max, min }) : undefined);
  const showTotal = step >= 2 && step <= 5 && !!s.experienceId;
  const processing = payState === "processing";

  if (!hydrated) {
    return (
      <div aria-busy="true" className="space-y-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="scroll-mt-24 space-y-6">
      <div className="no-print">
        <BookingStepper step={step} onGo={(n) => !confirmed && !processing && goTo(n)} />
      </div>

      {showBanner && (
        <div role="region" aria-label={t("booking.resume.title")} className="no-print flex flex-col gap-3 rounded-lg border border-graphite-600 bg-graphite-900 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{t("booking.resume.title")}</p>
            <p className="text-sm text-silver">{t("booking.resume.body")}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resume}>{t("booking.resume.resume")}</Button>
            <Button variant="secondary" onClick={startOver}><RotateCcw className="h-4 w-4" aria-hidden />{t("booking.resume.startOver")}</Button>
            <Button variant="ghost" onClick={() => setBannerHidden(true)}>{t("btn.close")}</Button>
          </div>
        </div>
      )}

      {step <= 5 && (
        <section aria-labelledby="step-title" className="space-y-5">
          <div>
            <h2 id="step-title" tabIndex={-1} data-step-heading className="font-display text-3xl font-bold uppercase">{t(titles[step - 1])}</h2>
            <p className="mt-1 text-sm text-silver">{t(leads[step - 1])}</p>
          </div>

          {step === 1 && (
            <StepExperience experienceId={s.experienceId} eventId={s.eventId} events={selectableEvents} error={err("experience")} onSelect={selectExperience} onEvent={(id) => patch({ eventId: id || undefined })} />
          )}
          {step === 2 && s.experienceId && (
            <StepDateTime
              experienceId={s.experienceId}
              event={event}
              date={s.date}
              period={s.period}
              partySize={s.participants.length}
              waitlistMode={waitlistMode}
              contact={{ name: s.contactName, email: s.contactEmail, phone: s.contactPhone }}
              error={err("slot")}
              onDate={(d) => patch({ date: d, period: undefined })}
              onPeriod={(p) => patch({ period: p })}
              onWaitlistMode={setWaitlistMode}
            />
          )}
          {step === 3 && s.experienceId && (
            <StepParticipants
              experienceId={s.experienceId}
              participants={s.participants}
              minParticipants={min}
              maxParticipants={max}
              remaining={remaining}
              contact={s}
              errors={errors}
              onParticipants={(list) => patch({ participants: list })}
              onContact={(p) => patch(p)}
            />
          )}
          {step === 4 && s.experienceId && date && period && (
            <StepReview
              experienceId={s.experienceId}
              event={event}
              date={date}
              period={period}
              participants={s.participants}
              contact={s}
              price={price}
              promoCode={s.promoCode}
              promoPrefill={init.promo ?? ""}
              terms={s.terms}
              waiver={s.waiver}
              errors={errors}
              onPromo={(c) => patch({ promoCode: c })}
              onTerms={(v) => patch({ terms: v })}
              onWaiver={(v) => patch({ waiver: v })}
              onEdit={goTo}
            />
          )}
          {step === 5 && (
            <PaymentPanel
              method={s.paymentMethod}
              onMethod={(m: PaymentMethodId) => patch({ paymentMethod: m })}
              totalLabel={money(price.total)}
              simulateFail={simulateFail}
              onSimulate={setSimulateFail}
              state={payState}
              onRetry={() => void pay()}
              onChooseOther={() => setPayState("idle")}
            />
          )}
        </section>
      )}

      {step === 6 && confirmed && <ConfirmationView booking={confirmed} />}

      {step <= 5 && (
        <div className="no-print sticky bottom-0 z-30 -mx-1 border-t border-graphite-700 bg-ink/95 px-1 py-3 backdrop-blur" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={back} disabled={step === 1 || processing}>{t("btn.back")}</Button>
            <div className="min-w-0 flex-1 text-right" aria-live="polite">
              {showTotal && (
                <>
                  <p className="text-xs text-silver-dim">{t("booking.runningTotal")}</p>
                  <p className="truncate font-bold tabular-nums">{money(price.total)}</p>
                </>
              )}
            </div>
            {step < 5 ? (
              <Button onClick={next}>{t("btn.next")}</Button>
            ) : (
              <Button onClick={() => void pay()} disabled={processing}>{processing ? t("booking.processing") : t("booking.payButton", { total: money(price.total) })}</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
