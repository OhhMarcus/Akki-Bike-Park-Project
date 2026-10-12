"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { Booking, ParkEvent } from "@/types";
import { useSavedRider } from "@/lib/hooks";
import { normalizeHKPhone } from "@/lib/phone";
import { createBooking, quote } from "@/lib/services";
import { emptyRentals } from "@/lib/sizing";
import { validate } from "@/lib/validation";
import { ConfirmationPanel } from "@/components/booking/ConfirmationPanel";
import { PaymentPicker } from "@/components/booking/PaymentPicker";
import { QuoteSummary } from "@/components/booking/QuoteSummary";
import { WaiverQuick } from "@/components/booking/Waiver";
import { Button } from "@/components/ui/button";
import { Field, Input, OptionCards, PhoneInput, describedBy } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { ShareButton } from "./EventActions";
import { SpotsText } from "./parts";
import { agesNote, whenText, type EventSpots } from "./utils";

type Step = "details" | "pay" | "done";
type ErrorKey = "category" | "name" | "phone" | "age" | "waiver";
type Errors = Partial<Record<ErrorKey, string>>;
const AGE = { min: 4, max: 90 };
const ERROR_ORDER: ErrorKey[] = ["category", "name", "phone", "age", "waiver"];
/** OptionCards and PaymentPicker hide their radios (sr-only), so show keyboard focus as a ring on the card itself. */
const cardFocus = "[&_label:has(>input.sr-only:focus-visible)]:shadow-[0_0_0_2px_#080808,0_0_0_4px_#EBB04A]";

/**
 * Event registration in a sheet: category, rider, waiver → price + demo payment → confirmation.
 * Capacity is re-checked by createBooking, so a category that fills up meanwhile is caught.
 * Mount with a fresh `key` per opening so every registration starts clean.
 */
export function RegisterSheet({
  event, spots, open, onOpenChange, initialCategory,
}: {
  event: ParkEvent;
  spots: EventSpots;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: string;
}) {
  const { t, l, fmt } = useI18n();
  const [saved, setSaved] = useSavedRider();
  const spotsOf = (id?: string) => spots.categories.find((c) => c.categoryId === id);
  const isOpen = (id?: string) => (spotsOf(id)?.remaining ?? 0) > 0;
  const openCats = event.categories.filter((c) => isOpen(c.id));

  const [step, setStep] = useState<Step>("details");
  const [categoryId, setCategoryId] = useState<string | undefined>(() =>
    initialCategory && isOpen(initialCategory) ? initialCategory : openCats.length === 1 ? openCats[0].id : undefined,
  );
  const [name, setName] = useState(saved?.name ?? "");
  const [phone, setPhone] = useState(saved ? saved.phone.replace(/^\+?852\s?/, "") : "");
  const [age, setAge] = useState("");
  const [waiver, setWaiver] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  // where focus should go after the next render: the top of the step, or the first field to fix
  const [focusRequest, setFocusRequest] = useState<{ target: "step" | ErrorKey } | null>(null);
  const stepRef = useRef<HTMLElement | null>(null);

  const cat = event.categories.find((c) => c.id === categoryId);
  const q = quote({ kind: "event", riders: 1, rentals: emptyRentals(), eventPrice: cat?.priceHKD ?? 0 });
  const minor = age !== "" && Number(age) < 18;
  const ageHint = cat ? t("events.reg.ageHint", { ages: l(cat.ages) }) : undefined;

  const check = {
    name: (v: string) => {
      const k = validate.name(v);
      return k && t(k);
    },
    phone: (v: string) => {
      const k = validate.phone(v);
      return k && t(k);
    },
    age: (v: string) => {
      const k = validate.age(v, AGE.min, AGE.max);
      return k && t(k, AGE);
    },
  };
  /** Once a field shows an error, re-check it as the rider types so the message goes away when it's fixed. */
  const edit = (key: keyof typeof check, value: string, set: (v: string) => void) => {
    set(value);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: check[key](value) }));
  };

  useEffect(() => {
    if (!focusRequest) return;
    const { target } = focusRequest;
    if (target === "step") {
      // a new step starts at its top (the sheet body keeps its scroll position otherwise)
      stepRef.current?.focus({ preventScroll: true });
      stepRef.current?.scrollIntoView({ block: "start" });
      return;
    }
    const el = target === "category" ? document.querySelector<HTMLInputElement>('input[name="reg-category"]:not(:disabled)') : document.getElementById(`reg-${target}`);
    el?.focus();
  }, [focusRequest]);

  const goTo = (next: Step) => {
    setStep(next);
    setFocusRequest({ target: "step" });
  };

  const fail = (e: Errors) => {
    setErrors(e);
    const first = ERROR_ORDER.find((k) => e[k]);
    if (first) setFocusRequest({ target: first });
  };

  const toPayment = () => {
    const e: Errors = {
      category: cat && isOpen(cat.id) ? undefined : t("val.pickCategory"),
      name: check.name(name),
      phone: check.phone(phone),
      age: check.age(age),
      waiver: waiver ? undefined : t("val.consent"),
    };
    if (ERROR_ORDER.some((k) => e[k])) return fail(e);
    setErrors({});
    setSubmitError(null);
    goTo("pay");
  };

  const pay = () => {
    if (!cat) return;
    const res = createBooking({
      targetId: event.id,
      eventCategoryId: cat.id,
      riders: 1,
      rentals: emptyRentals(),
      name,
      phone,
      source: "website",
      payment: "paid",
      rider: { age: Number(age) },
      waiverSigned: true,
    });
    if (res.ok) {
      setSaved({ name: res.booking.riderName, phone: res.booking.phone });
      setBooking(res.booking);
      goTo("done");
    } else if (res.error === "full" || res.error === "not_enough_spots") {
      setCategoryId(undefined);
      setStep("details");
      fail({ category: t("events.err.full") });
    } else if (res.error === "invalid_phone" || res.error === "invalid") {
      setStep("details");
      fail(res.error === "invalid_phone" ? { phone: t("err.invalid_phone") } : { name: t("err.invalid") });
    } else {
      setSubmitError(t(`err.${res.error}`, { n: res.remaining ?? 0 }));
    }
  };

  const stepLabel = (n: 1 | 2) => (
    <p className="eyebrow scroll-mt-5 text-xs outline-none" ref={(el) => { stepRef.current = el; }} tabIndex={-1}>
      {t("events.reg.step", { n })}
    </p>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      wide
      title={t("btn.register")}
      description={`${l(event.title)} · ${whenText(t, fmt, event)}`}
      footer={
        step === "details" ? (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted">{t("book.total")}</p>
              <p className="h-display text-2xl tabular">{cat ? fmt.money(cat.priceHKD) : "–"}</p>
            </div>
            <Button size="lg" onClick={toPayment}>
              {t("btn.continue")}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className={cardFocus}>
        {step === "details" && (
          <div className="space-y-7">
            {stepLabel(1)}
            <div>
              <OptionCards
                name="reg-category"
                legend={t("events.reg.pick")}
                value={categoryId}
                onChange={(v) => {
                  setCategoryId(v);
                  setErrors((e) => ({ ...e, category: undefined }));
                }}
                columns={2}
                options={event.categories.map((c) => {
                  const s = spotsOf(c.id);
                  return {
                    value: c.id,
                    disabled: !s || s.remaining <= 0,
                    title: (
                      <span className="flex items-baseline justify-between gap-3">
                        <span>{l(c.name)}</span>
                        <span className="shrink-0 tabular">{fmt.money(c.priceHKD)}</span>
                      </span>
                    ),
                    detail: (
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        {agesNote(l(c.name), l(c.ages))}
                        {s && <SpotsText spots={{ ...s, ended: spots.ended }} className="ml-auto text-xs" />}
                      </span>
                    ),
                  };
                })}
              />
              {errors.category && (
                <p role="alert" className="mt-2 text-xs font-medium text-state-closed">
                  {errors.category}
                </p>
              )}
            </div>

            <fieldset className="space-y-4">
              <legend className="mb-3 text-sm font-medium">{t("events.reg.rider")}</legend>
              <Field label={t("label.name")} htmlFor="reg-name" error={errors.name}>
                <Input id="reg-name" autoComplete="name" value={name} onChange={(e) => edit("name", e.target.value, setName)} {...describedBy("reg-name", errors.name)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,180px)]">
                <Field label={t("label.phone")} htmlFor="reg-phone" error={errors.phone} hint={t("label.phoneHint")}>
                  <PhoneInput id="reg-phone" value={phone} onChange={(e) => edit("phone", e.target.value, setPhone)} {...describedBy("reg-phone", errors.phone, t("label.phoneHint"))} />
                </Field>
                <Field label={t("label.age")} htmlFor="reg-age" error={errors.age} hint={ageHint}>
                  <Input
                    id="reg-age"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={2}
                    value={age}
                    onChange={(e) => edit("age", e.target.value.replace(/\D/g, ""), setAge)}
                    {...describedBy("reg-age", errors.age, ageHint)}
                  />
                </Field>
              </div>
            </fieldset>

            <div className="space-y-3">
              {minor && (
                <p className="flex items-start gap-2 rounded-md border border-brand-sky/40 bg-brand-sky/10 px-3 py-2 text-sm text-fg/90">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" aria-hidden />
                  {t("events.reg.minor")}
                </p>
              )}
              <WaiverQuick
                id="reg-waiver"
                checked={waiver}
                onChange={(v) => {
                  setWaiver(v);
                  if (v) setErrors((e) => ({ ...e, waiver: undefined }));
                }}
                error={errors.waiver}
              />
            </div>
            <p className="text-xs text-muted">{t("book.saved")}</p>
          </div>
        )}

        {step === "pay" && cat && (
          <div className="space-y-5">
            {stepLabel(2)}
            <div className="surface flex items-start justify-between gap-3 p-4 text-sm">
              <dl className="min-w-0 space-y-1">
                <div>
                  <dt className="sr-only">{t("label.category")}</dt>
                  <dd className="font-semibold">
                    {l(cat.name)}
                    {agesNote(l(cat.name), l(cat.ages)) && <span className="font-normal text-muted"> · {l(cat.ages)}</span>}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">{t("book.done.who")}</dt>
                  <dd className="text-fg/85">
                    {name.trim()} · <span className="tabular">{normalizeHKPhone(phone) ?? phone}</span> · {t("label.age")} {age}
                  </dd>
                </div>
              </dl>
              <Button variant="link" font="sans" className="-my-3 min-h-11 shrink-0" onClick={() => goTo("details")}>
                {t("events.reg.edit")}
              </Button>
            </div>
            <QuoteSummary quote={q} />
            {submitError && (
              <p role="alert" className="rounded-md border border-state-closed/50 bg-state-closed/10 px-3 py-2 text-sm font-medium text-state-closed">
                {submitError}
              </p>
            )}
            <PaymentPicker amount={q.total} onPay={pay} seed={event.id} />
          </div>
        )}

        {step === "done" && booking && cat && (
          <div ref={(el) => { stepRef.current = el; }} tabIndex={-1} className="scroll-mt-5 outline-none">
            <ConfirmationPanel
              booking={booking}
              title={`${l(event.title)} · ${l(cat.name)}`}
              actions={
                <div className="grid gap-2 border-t border-line pt-5 sm:grid-cols-2">
                  <ShareButton event={event} label={t("events.reg.mate")} />
                  <Button onClick={() => onOpenChange(false)}>{t("btn.done")}</Button>
                </div>
              }
            />
          </div>
        )}
      </div>
    </Sheet>
  );
}
