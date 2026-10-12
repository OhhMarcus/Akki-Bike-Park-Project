"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import type { Booking, ISODate, Rentals } from "@/types";
import { useAvailability, useSavedRider, type Availability } from "@/lib/hooks";
import { createBooking, quote, type BookingError } from "@/lib/services";
import { parseTargetId, type SlotView } from "@/lib/schedule";
import { normalizeHKPhone } from "@/lib/phone";
import { emptyRentals, rentalBikeCount } from "@/lib/sizing";
import { addDays, toMin, type HKNow } from "@/lib/time";
import { validate } from "@/lib/validation";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Field, Input, PhoneInput, describedBy } from "@/components/ui/field";
import { NumberStepper } from "@/components/ui/stepper";
import { StatusBadge } from "@/components/ui/badge";
import { RentalPicker } from "@/components/booking/RentalPicker";
import { WaiverQuick } from "@/components/booking/Waiver";
import { QuoteSummary } from "@/components/booking/QuoteSummary";
import { PaymentPicker } from "@/components/booking/PaymentPicker";
import { ConfirmationPanel } from "@/components/booking/ConfirmationPanel";
import { Swap } from "@/components/brand/Swap";
import { cn } from "@/lib/utils";
import { GroupLink } from "./parts";
import { MAX_ONLINE, WINDOW_DAYS, fitRentals, isBookable } from "./lib";

/** Which slot the sheet is booking. `key` changes per open (fresh form); switching slots keeps it. */
export type SheetTarget = { id: string; openedAt: number; key: number };
type FieldKey = "name" | "phone" | "waiver";
type FieldErrors = Partial<Record<FieldKey, MessageKey>>;

/** Saved "+852 9123 4567" → "9123 4567" for the +852 input. */
const localPhone = (p?: string) => (p ? (normalizeHKPhone(p)?.slice(5) ?? p) : "");

/** Nearest open slot with room for this group: same day first, then the following days. */
function alternativeFor(avail: Availability, from: SlotView, riders: number, lastDay: ISODate) {
  const fits = (s: SlotView) => s.id !== from.id && isBookable(s) && s.remaining >= riders;
  const gap = (s: SlotView) => Math.abs(toMin(s.start) - toMin(from.start));
  const sameDay = avail.pumpSlots(from.date).filter(fits).sort((a, b) => gap(a) - gap(b));
  if (sameDay[0]) return sameDay[0];
  for (let d = addDays(from.date, 1); d <= lastDay; d = addDays(d, 1)) {
    const s = avail.pumpSlots(d).find(fits);
    if (s) return s;
  }
  return null;
}

export function BookingSheet({
  target, now, onClose, onSwitch,
}: {
  target: SheetTarget | null;
  now: HKNow | null;
  onClose: () => void;
  onSwitch: (slot: SlotView) => void;
}) {
  if (!target || !now) return null;
  return <SheetBody key={target.key} target={target} now={now} onClose={onClose} onSwitch={onSwitch} />;
}

function SheetBody({ target, now, onClose, onSwitch }: { target: SheetTarget; now: HKNow; onClose: () => void; onSwitch: (slot: SlotView) => void }) {
  const { t, tn, fmt } = useI18n();
  const avail = useAvailability(now);
  const [saved, setSaved] = useSavedRider();
  const ref = parseTargetId(target.id);
  const slot = ref?.kind === "pump" ? avail.pumpSlots(ref.date).find((s) => s.id === target.id) : undefined;

  const [riders, setRiders] = useState(1);
  const [rentals, setRentals] = useState<Rentals>(emptyRentals);
  const [showRentals, setShowRentals] = useState(false);
  const [name, setName] = useState(saved?.name ?? "");
  const [phone, setPhone] = useState(() => localPhone(saved?.phone));
  const [waiver, setWaiver] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState<"details" | "pay">("details");
  const [failure, setFailure] = useState<{ id: string; error: BookingError } | null>(null);
  const [done, setDone] = useState<{ booking: Booking; seconds: number } | null>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  // PaymentPicker calls back after a short delay; ignore it if the sheet was closed meanwhile.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Live capacity: if spots drop below the chosen group size, clamp and say so.
  const remaining = slot?.remaining ?? 0;
  const cap = Math.max(1, Math.min(remaining, MAX_ONLINE));
  const ridersNow = Math.min(riders, cap);
  const rentalsNow = fitRentals(rentals, ridersNow);
  const total = quote({ kind: "pump", riders: ridersNow, rentals: rentalsNow });
  const squeezed = remaining > 0 && riders > remaining;
  const blocked: BookingError | null = !slot ? "not_found" : slot.status === "closed" ? "closed" : slot.past ? "past" : remaining <= 0 ? "full" : null;
  const problem = done ? null : failure?.id === target.id ? failure.error : blocked;

  const focusStep = () => requestAnimationFrame(() => stepHeading.current?.focus());
  const clearError = (k: FieldKey) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  const onRiders = (n: number) => {
    setRiders(n);
    setRentals((r) => fitRentals(r, n));
  };

  const toPay = () => {
    const e: FieldErrors = { name: validate.name(name), phone: validate.phone(phone), waiver: waiver ? undefined : "val.consent" };
    setErrors(e);
    const bad = (["name", "phone", "waiver"] as const).find((k) => e[k]);
    if (bad) {
      document.getElementById(`pump-${bad}`)?.focus();
      return;
    }
    setStep("pay");
    focusStep();
  };

  const back = () => {
    setStep("details");
    focusStep();
  };

  const pay = () => {
    if (!alive.current || !slot) return;
    const res = createBooking({
      targetId: slot.id, riders: ridersNow, rentals: rentalsNow, name, phone, source: "website", payment: "paid", waiverSigned: true,
    });
    if (res.ok) {
      setSaved({ name: res.booking.riderName, phone: res.booking.phone });
      // ceil: the 900ms mock payment alone means every booking takes over a second
      setDone({ booking: res.booking, seconds: Math.max(2, Math.ceil((Date.now() - target.openedAt) / 1000)) });
      return;
    }
    if (res.error === "invalid_phone" || res.error === "invalid") {
      setErrors({ name: validate.name(name), phone: res.error === "invalid_phone" ? "val.phone" : validate.phone(phone) });
      back();
    } else if (res.error === "not_enough_spots") {
      back(); // the live notice shows how many are left
    } else {
      setFailure({ id: slot.id, error: res.error });
    }
  };

  const forget = () => {
    setSaved(null);
    setName("");
    setPhone("");
  };

  const title = slot ? <When date={slot.date} start={slot.start} end={slot.end} /> : ref ? <When date={ref.date} start={ref.start} /> : t("book.line.pump");
  const description = slot && !done && !problem ? t("pump.sheet.desc", { left: t("spots.ofLeft", { n: remaining, cap: slot.capacity }) }) : t("book.line.pump");

  const bikes = rentalBikeCount(rentalsNow);
  const rentalSummary =
    bikes || rentalsNow.helmets
      ? [bikes ? tn("bikes.count", bikes) : null, rentalsNow.helmets ? tn("helmets.count", rentalsNow.helmets) : null].filter(Boolean).join(" · ")
      : t("book.rent.own");
  const phoneHint = saved ? undefined : t("book.saved");
  const err = (k: FieldKey) => (errors[k] ? t(errors[k]) : undefined);

  let body: React.ReactNode;
  let footer: React.ReactNode;

  if (done) {
    body = (
      <ConfirmationPanel
        booking={done.booking}
        title={t("book.line.pump")}
        seconds={done.seconds}
        actions={
          <Button size="lg" className="w-full" onClick={onClose}>
            {t("btn.done")}
          </Button>
        }
      />
    );
  } else if (problem) {
    const alt = slot && problem !== "not_found" ? alternativeFor(avail, slot, riders, addDays(now.date, WINDOW_DAYS - 1)) : null;
    body = (
      <div className="space-y-4">
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-state-closed/50 bg-state-closed/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-state-closed" aria-hidden />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold">{t(`err.${problem}`, { n: remaining })}</p>
            {slot?.status === "closed" && <p className="text-sm text-muted">{t(`reason.${slot.closedReason ?? "other"}`)}</p>}
            {slot && problem === "full" && <p className="text-sm text-muted tabular">{t("spots.ofLeft", { n: 0, cap: slot.capacity })}</p>}
          </div>
        </div>
        {alt && (
          <div className="surface space-y-3 p-4">
            <p className="text-xs font-semibold text-muted">{t("pump.fail.alt")}</p>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="h-display text-2xl">
                <When date={alt.date} start={alt.start} end={alt.end} />
              </p>
              <span className="flex items-center gap-2 text-xs text-muted tabular">
                <StatusBadge status={alt.status} />· {t("spots.ofLeft", { n: alt.remaining, cap: alt.capacity })}
              </span>
            </div>
            <Button size="lg" className="w-full" onClick={() => onSwitch(alt)}>
              {t("pump.fail.switch")}
            </Button>
          </div>
        )}
        <Button variant="secondary" size="lg" className="w-full" onClick={onClose}>
          {t("pump.fail.pick")}
        </Button>
      </div>
    );
  } else if (step === "details") {
    body = (
      <div className="space-y-5">
        <StepHead n={1} label={t("pump.step.details")} headingRef={stepHeading} />

        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold">{t("label.riders")}</p>
              <p className="text-xs text-muted">
                {t("pump.perRider", { price: fmt.money(site.prices.pumpPerRider) })}
                {site.prices.placeholder && <Swap />}
              </p>
            </div>
            <NumberStepper value={ridersNow} min={1} max={cap} onChange={onRiders} label={t("label.riders")} />
          </div>
          {ridersNow >= cap &&
            (cap === MAX_ONLINE ? (
              <GroupLink date={slot?.date ?? now.date} className="mt-1 justify-end" />
            ) : (
              <p className="mt-2 text-right text-xs font-semibold text-brand-amber">{tn("spots.left", remaining)}</p>
            ))}
        </div>

        <div className="border-t border-line pt-4">
          <button
            type="button"
            aria-expanded={showRentals}
            aria-controls="pump-rentals"
            onClick={() => setShowRentals((v) => !v)}
            className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
          >
            <span className="min-w-0">
              <span className="block font-semibold">{t("label.rentals")}</span>
              <span className="block text-xs text-muted">{rentalSummary}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-fg/25 px-3 py-2 text-sm font-semibold hover:border-fg">
              {showRentals ? t("pump.rent.hide") : t("pump.rent.add")}
              <ChevronDown className={cn("h-4 w-4", showRentals && "rotate-180")} aria-hidden />
            </span>
          </button>
          <div id="pump-rentals" hidden={!showRentals} className="pt-3">
            <RentalPicker value={rentalsNow} onChange={setRentals} riders={ridersNow} />
          </div>
        </div>

        <div role="group" aria-labelledby="pump-details-label" className="space-y-4 border-t border-line pt-4">
          <div className="flex min-h-6 items-center justify-between gap-3">
            <p id="pump-details-label" className="font-semibold">{t("pump.details")}</p>
            {saved && (name || phone) && (
              <button type="button" onClick={forget} className="-my-2.5 min-h-11 px-1 text-xs font-semibold text-muted underline decoration-fg/20 underline-offset-4 hover:text-fg">
                {t("pump.clearDetails")}
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("label.name")} htmlFor="pump-name" error={err("name")}>
              <Input
                id="pump-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                {...describedBy("pump-name", err("name"))}
              />
            </Field>
            <Field label={t("label.phone")} htmlFor="pump-phone" error={err("phone")} hint={phoneHint}>
              <PhoneInput
                id="pump-phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError("phone");
                }}
                placeholder="9123 4567"
                enterKeyHint="done"
                {...describedBy("pump-phone", err("phone"), phoneHint)}
              />
            </Field>
          </div>
          <WaiverQuick
            id="pump-waiver"
            checked={waiver}
            onChange={(v) => {
              setWaiver(v);
              clearError("waiver");
            }}
            error={err("waiver")}
          />
        </div>

        <QuoteSummary quote={total} />
      </div>
    );
    // The footer is always on screen, so a live capacity drop is seen wherever the form is scrolled.
    footer = (
      <div className="space-y-3">
        {squeezed && <CapacityNotice text={t("err.not_enough_spots", { n: remaining })} />}
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted">{t("book.total")}</p>
            <p className="h-display text-3xl tabular">{fmt.money(total.total)}</p>
          </div>
          <Button size="lg" className="flex-1" onClick={toPay}>
            {t("btn.continue")}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <StepHead n={2} label={t("pump.step.pay")} headingRef={stepHeading} />
          <button type="button" onClick={back} className="-my-1 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-muted hover:bg-white/5 hover:text-fg">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("pump.edit")}
          </button>
        </div>
        {squeezed && <CapacityNotice text={t("err.not_enough_spots", { n: remaining })} />}
        <p className="truncate text-sm">
          <span className="font-semibold">{name.trim()}</span>
          <span className="text-muted tabular"> · {normalizeHKPhone(phone)} · {tn("riders.count", ridersNow)}</span>
        </p>
        <PaymentPicker amount={total.total} onPay={pay} seed={target.id} />
      </div>
    );
  }

  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={title}
      description={description}
      footer={footer}
      // wide: the rental sizes grid and the confirmation's three buttons need the room on sm+
      wide
      // centred on sm+: a transform-based entrance animation would cancel the -50% centring translate
      className="sm:data-[state=open]:animate-none"
    >
      {body}
    </Sheet>
  );
}

/** "Mon 12 Oct · 4:00–5:00pm" with each half kept whole, so a narrow sheet wraps between them. */
function When({ date, start, end }: { date: ISODate; start: string; end?: string }) {
  const { fmt } = useI18n();
  return (
    <>
      <span className="whitespace-nowrap">{fmt.dateWeekday(date)}</span> · <span className="whitespace-nowrap">{end ? fmt.timeRange(start, end) : fmt.time(start)}</span>
    </>
  );
}

function StepHead({ n, label, headingRef }: { n: 1 | 2; label: string; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const { t } = useI18n();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="flex shrink-0 gap-1">
        {[1, 2].map((i) => (
          <span key={i} className={cn("h-1 w-6 rounded-sm", i <= n ? "bg-fg" : "bg-line-strong")} />
        ))}
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="min-w-0 text-xs font-semibold text-muted">
        {t("pump.step", { n, label })}
      </h3>
    </div>
  );
}

function CapacityNotice({ text }: { text: string }) {
  return (
    <p role="alert" className="flex items-center gap-2 rounded-md border border-brand-amber/50 bg-brand-amber/10 px-3 py-2 text-sm font-semibold text-brand-amber">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      {text}
    </p>
  );
}
