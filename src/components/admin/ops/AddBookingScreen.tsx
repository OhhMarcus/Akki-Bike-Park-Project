"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CircleCheck, LayoutList, Search, UserCheck, UserPlus, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { coachById, lessons } from "@/content/catalogue";
import { useAvailability, useNowHK, useRiders } from "@/lib/hooks";
import { normalizeHKPhone } from "@/lib/phone";
import { createBooking, quote } from "@/lib/services";
import { emptyRentals } from "@/lib/sizing";
import { dateRange, toMin } from "@/lib/time";
import { hasErrors, validate } from "@/lib/validation";
import type { Booking, HHmm, Rentals, Rider } from "@/types";
import { Swap } from "@/components/brand/Swap";
import { QuoteSummary } from "@/components/booking/QuoteSummary";
import { RentalPicker } from "@/components/booking/RentalPicker";
import { DateStrip } from "@/components/calendar/DateStrip";
import { AdminPageHeader } from "@/components/layout/AdminShell";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { SourceTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, PhoneInput, Textarea, describedBy } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { NumberStepper } from "@/components/ui/stepper";
import { useToast } from "@/components/ui/toast";
import { SlotPicker, type SlotOption } from "./SlotPicker";
import { PaymentBadge, bookingErrorText, clampRentals, localPhone, whenText } from "./shared";
import { cn } from "@/lib/utils";

type Source = "whatsapp" | "klook" | "walkin";
type Kind = "lesson" | "pump";

/** Klook is prepaid and walk-ins pay at the desk; WhatsApp bookings usually pay later. */
const defaultPayment = (s: Source) => (s === "whatsapp" ? "unpaid" : "paid");

/** Last 8 digits of a phone, so "9123 4567", "91234567" and "+852 9123 4567" all match. */
const phoneMatch = (stored: string, query: string) => {
  const local = localPhone(stored).replace(/\D/g, "");
  const digits = query.replace(/\D/g, "");
  const q = digits.length > 8 && digits.startsWith("852") ? digits.slice(3) : digits;
  return q.length >= 3 && local.includes(q);
};

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  const id = `ab-step-${n}`;
  return (
    <section aria-labelledby={id} className="surface p-4 sm:p-5">
      <h2 id={id} className="mb-4 flex items-center gap-2.5 font-semibold">
        <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-line-strong text-xs tabular text-muted">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function SumRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  );
}

/**
 * Staff entry for WhatsApp, Klook and walk-in bookings. Uses the same
 * availability and createBooking() as the website, so nothing double-books.
 */
export function AddBookingScreen() {
  const { t, tn, l, fmt } = useI18n();
  const toast = useToast();
  const now = useNowHK();
  const avail = useAvailability(now);
  const [people] = useRiders();

  const [source, setSource] = useState<Source>("whatsapp");
  const [kind, setKind] = useState<Kind>("lesson");
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [find, setFind] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rentals, setRentals] = useState<Rentals>(emptyRentals);
  const [payment, setPayment] = useState<"paid" | "unpaid">("unpaid");
  const [klookRef, setKlookRef] = useState("");
  const [notes, setNotes] = useState("");
  const [tried, setTried] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [last, setLast] = useState<Booking | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const today = now?.date;
  const dates = useMemo(() => (today ? dateRange(today, 14) : []), [today]);
  const allowRunning = source === "walkin";
  const dayState = kind === "pump" ? avail.dayPump : (d: string) => avail.dayLessons(d);
  // Until staff pick a day: walk-ins land on today, everything else on the first day with room.
  const date =
    pickedDate ??
    (allowRunning ? today : dates.find((d) => ["available", "almost"].includes(dayState(d)))) ??
    today;

  const options = useMemo<SlotOption[]>(() => {
    if (!date || !now) return [];
    const running = (start: HHmm, end: HHmm) => date === now.date && toMin(start) <= now.minutes && now.minutes < toMin(end);
    if (kind === "pump") return avail.pumpSlots(date).map((s) => ({ ...s, title: t("kind.pump"), running: running(s.start, s.end) }));
    return avail.sessions(date).map((s) => {
      const coach = coachById(s.coachId);
      return {
        ...s,
        title: `${l(lessons[s.lessonId].name)} · ${t(`tlang.${s.language}`)}`,
        detail: coach ? (
          <span className="mt-0.5 block text-xs text-muted">
            {t("adminOps.coach", { name: l(coach.name) })}
            <Swap />
          </span>
        ) : undefined,
        running: running(s.start, s.end),
      };
    });
  }, [date, now, kind, avail, t, l]);

  const slot = options.find((o) => o.id === slotId) ?? null;
  const maxRiders = slot?.capacity ?? (kind === "pump" ? avail.settings.slotCapacity : Math.max(1, ...avail.settings.lessonTemplates.map((x) => x.capacity)));

  // Live re-check of the picked slot (another tab or the website may have filled it).
  let problem: string | null = null;
  if (slot) {
    if (slot.status === "closed") problem = t("err.closed");
    else if (slot.past && !(allowRunning && slot.running)) problem = t("err.past");
    else if (slot.remaining <= 0) problem = t("err.full");
    else if (count > slot.remaining) problem = t("adminOps.add.overbook", { n: slot.remaining });
  }

  const kept = clampRentals(rentals, count);
  const q = quote({ kind, riders: count, rentals: kept, lessonId: slot?.lessonId });
  const priced = kind === "pump" || !!slot;

  const matches = useMemo(() => {
    const needle = find.trim().toLowerCase();
    if (needle.length < 2) return [];
    return people.filter((r) => r.name.toLowerCase().includes(needle) || phoneMatch(r.phone, find)).slice(0, 6);
  }, [find, people]);
  const normalized = normalizeHKPhone(phone);
  const existing = normalized ? people.find((r) => r.phone === normalized) : undefined;

  const errs: Record<"slot" | "name" | "phone", MessageKey | undefined> = {
    slot: slot ? undefined : "val.pickTime",
    name: validate.name(name),
    phone: validate.phone(phone),
  };
  const err = (k: keyof typeof errs) => {
    const key = errs[k];
    return tried && key ? t(key) : undefined;
  };

  const changeSource = (s: Source) => {
    setSource(s);
    setPayment(defaultPayment(s));
    setFormError(null);
  };
  const changeKind = (k: Kind) => {
    setKind(k);
    setSlotId(null);
    setFormError(null);
  };
  const changeDate = (d: string) => {
    setPickedDate(d);
    setSlotId(null);
    setFormError(null);
  };
  const changeCount = (n: number) => {
    setCount(n);
    setRentals((r) => clampRentals(r, n));
    setFormError(null);
  };
  const choose = (r: Rider) => {
    setName(r.name);
    setPhone(localPhone(r.phone));
    setFind("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    setFormError(null);
    if (!slot || problem) {
      document.querySelector<HTMLInputElement>('input[name="ab-slot"]:not(:disabled)')?.focus();
      if (!slot) document.getElementById("ab-step-2")?.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    if (hasErrors(errs)) {
      document.getElementById(errs.name ? "ab-name" : "ab-phone")?.focus();
      return;
    }
    const res = createBooking({
      targetId: slot.id,
      riders: count,
      rentals: kept,
      name,
      phone,
      source,
      payment,
      externalRef: source === "klook" ? klookRef : undefined,
      notes,
      allowPast: allowRunning,
    });
    if (!res.ok) {
      setFormError(bookingErrorText(res, t));
      return;
    }
    toast(t("adminOps.add.toast", { ref: res.booking.ref }));
    setLast(res.booking);
    // Ready for the next entry: keep source, type and date, clear the rest.
    setSlotId(null);
    setCount(1);
    setFind("");
    setName("");
    setPhone("");
    setRentals(emptyRentals());
    setKlookRef("");
    setNotes("");
    setTried(false);
    setPayment(defaultPayment(source));
    requestAnimationFrame(() => {
      doneRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <>
      <AdminPageHeader
        title={t("admin.nav.add")}
        lead={t("adminOps.add.lead")}
        actions={
          <Button asChild variant="subtle" size="sm" font="sans">
            <Link href="/admin/bookings">
              <LayoutList className="h-4 w-4" aria-hidden />
              {t("admin.nav.bookings")}
            </Link>
          </Button>
        }
      />

      {last && (
        <div
          ref={doneRef}
          tabIndex={-1}
          className="mb-6 flex flex-col gap-3 rounded-lg border border-brand-sky/40 bg-brand-sky/[.07] p-4 outline-none sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-sky" aria-hidden />
            <div>
              <p className="font-semibold">{t("adminOps.add.toast", { ref: last.ref })}</p>
              <p className="mt-0.5 text-sm text-muted">
                {t("adminOps.add.doneBody", { name: last.riderName, when: whenText(last, { t, fmt }) })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button asChild variant="secondary" size="sm" font="sans">
              <Link href={`/admin/bookings?q=${encodeURIComponent(last.ref)}`}>{t("adminOps.add.view")}</Link>
            </Button>
            <Button variant="ghost" size="iconSm" font="sans" onClick={() => setLast(null)} aria-label={t("btn.close")}>
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={submit} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <Step n={1} title={t("adminOps.add.step.booking")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium">{t("adminOps.add.source")}</p>
                <Segmented
                  label={t("adminOps.add.source")}
                  value={source}
                  onChange={changeSource}
                  className="w-full"
                  options={[
                    {
                      value: "whatsapp",
                      label: (
                        <span className="inline-flex items-center gap-1.5">
                          <WhatsAppIcon className="h-3.5 w-3.5" />
                          {t("source.whatsapp")}
                        </span>
                      ),
                    },
                    { value: "klook", label: t("source.klook") },
                    { value: "walkin", label: t("source.walkin") },
                  ]}
                />
              </div>
              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium">{t("adminOps.filter.kind")}</p>
                <Segmented
                  label={t("adminOps.filter.kind")}
                  value={kind}
                  onChange={changeKind}
                  className="w-full"
                  options={[
                    { value: "lesson", label: t("kind.lesson") },
                    { value: "pump", label: t("kind.pump") },
                  ]}
                />
              </div>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">{t("label.riders")}</p>
              <NumberStepper value={count} onChange={changeCount} min={1} max={Math.max(count, maxRiders)} label={t("label.riders")} />
            </div>
          </Step>

          <Step n={2} title={t("adminOps.add.step.when")}>
            {now && date ? (
              <>
                <DateStrip dates={dates} value={date} onChange={changeDate} dayState={dayState} today={now.date} />
                <p aria-hidden className="mb-2 mt-5 text-sm font-medium">
                  {t("adminOps.add.times", { date: fmt.dateWeekday(date) })}
                </p>
                <SlotPicker
                  name="ab-slot"
                  label={t("adminOps.add.times", { date: fmt.dateWeekday(date) })}
                  options={options}
                  value={slotId}
                  onChange={(id) => {
                    setSlotId(id);
                    setPickedDate(date);
                    setFormError(null);
                  }}
                  riders={count}
                  allowRunning={allowRunning}
                />
                {err("slot") && (
                  <p role="alert" className="mt-2 text-xs font-medium text-state-closed">
                    {err("slot")}
                  </p>
                )}
              </>
            ) : (
              <div aria-hidden className="space-y-4">
                <div className="flex gap-2 overflow-hidden">
                  {Array.from({ length: 7 }, (_, i) => (
                    <Skeleton key={i} className="h-[86px] w-16 shrink-0" />
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-28" />
                  ))}
                </div>
              </div>
            )}
          </Step>

          <Step n={3} title={t("adminOps.add.step.rider")}>
            <Field label={t("adminOps.add.find")} htmlFor="ab-find">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <Input
                  id="ab-find"
                  type="search"
                  value={find}
                  onChange={(e) => setFind(e.target.value)}
                  placeholder={t("adminOps.add.findPh")}
                  className="pl-9"
                  autoComplete="off"
                  aria-controls="ab-find-results"
                />
              </div>
            </Field>
            <div id="ab-find-results" aria-live="polite">
              {find.trim().length >= 2 &&
                (matches.length ? (
                  <ul aria-label={t("adminOps.add.results")} className="mt-2 divide-y divide-line overflow-hidden rounded-md border border-line">
                    {matches.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => choose(r)}
                          className="flex min-h-11 w-full flex-wrap items-center justify-between gap-x-3 px-3 py-2 text-left text-sm hover:bg-white/[.04]"
                        >
                          <span className="font-medium">{r.name}</span>
                          <span className="tabular text-muted">{r.phone}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted">{t("adminOps.add.noMatch")}</p>
                ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("label.name")} htmlFor="ab-name" error={err("name")}>
                <Input id="ab-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" {...describedBy("ab-name", err("name"))} />
              </Field>
              <Field label={t("label.phone")} htmlFor="ab-phone" error={err("phone")} hint={t("label.phoneHint")}>
                <PhoneInput
                  id="ab-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="off"
                  {...describedBy("ab-phone", err("phone"), t("label.phoneHint"))}
                />
              </Field>
            </div>
            {normalized && (
              <p className={cn("mt-3 flex items-center gap-1.5 text-xs", existing ? "text-brand-sky" : "text-muted")}>
                {existing ? <UserCheck className="h-4 w-4 shrink-0" aria-hidden /> : <UserPlus className="h-4 w-4 shrink-0" aria-hidden />}
                {existing ? t("adminOps.add.existing", { name: existing.name }) : t("adminOps.add.newRider")}
              </p>
            )}
          </Step>

          <Step n={4} title={t("adminOps.add.step.extras")}>
            <RentalPicker value={rentals} onChange={setRentals} riders={count} />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium">{t("book.pay.title")}</p>
                <Segmented
                  label={t("book.pay.title")}
                  value={payment}
                  onChange={setPayment}
                  className="w-full"
                  options={[
                    { value: "unpaid", label: t("pay.unpaid") },
                    { value: "paid", label: t("pay.paid") },
                  ]}
                />
              </div>
              {source === "klook" && (
                <Field label={t("adminOps.sheet.klookRef")} htmlFor="ab-klook" optional={t("label.optional")} hint={t("adminOps.add.klookHint")}>
                  <Input
                    id="ab-klook"
                    value={klookRef}
                    onChange={(e) => setKlookRef(e.target.value)}
                    placeholder={t("adminOps.add.klookPh")}
                    autoComplete="off"
                    {...describedBy("ab-klook", undefined, t("adminOps.add.klookHint"))}
                  />
                </Field>
              )}
            </div>
            <Field className="mt-4" label={t("label.notes")} htmlFor="ab-notes" optional={t("label.optional")}>
              <Textarea id="ab-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="min-h-20" placeholder={t("adminOps.add.notesPh")} />
            </Field>
          </Step>
        </div>

        <aside aria-labelledby="ab-summary" className="grid gap-3 md:grid-cols-2 md:items-start xl:sticky xl:top-24 xl:grid-cols-1">
          <div className="surface p-4">
            <h2 id="ab-summary" className="font-semibold">
              {t("book.summary")}
            </h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <SumRow label={t("adminOps.add.source")}>
                <SourceTag source={source} />
              </SumRow>
              <SumRow label={t("adminOps.col.what")}>{slot?.title ?? t(`kind.${kind}`)}</SumRow>
              <SumRow label={t("adminOps.col.when")}>
                {slot && date ? (
                  <>
                    {fmt.dateWeekday(date)}
                    <span className="block text-xs tabular text-muted">{fmt.timeRange(slot.start, slot.end)}</span>
                  </>
                ) : (
                  <span className="text-muted">{t("val.pickTime")}</span>
                )}
              </SumRow>
              <SumRow label={t("adminOps.col.rider")}>
                {name.trim() || <span className="text-muted">–</span>}
                {normalized && <span className="block text-xs tabular text-muted">{normalized}</span>}
              </SumRow>
              <SumRow label={t("label.riders")}>{tn("riders.count", count)}</SumRow>
              <SumRow label={t("adminOps.col.payment")}>
                <PaymentBadge payment={payment} />
              </SumRow>
            </dl>
          </div>
          {priced ? <QuoteSummary quote={q} title={t("label.price")} /> : <p className="surface p-4 text-sm text-muted">{t("adminOps.add.pickFirst")}</p>}
          {problem && (
            <p role="alert" className="flex items-start gap-2 rounded-md border border-brand-amber/50 bg-brand-amber/10 px-3 py-2 text-sm font-medium text-brand-amber md:col-span-2 xl:col-span-1">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {problem}
            </p>
          )}
          {formError && formError !== problem && (
            <p role="alert" className="rounded-md border border-state-closed/50 bg-state-closed/10 px-3 py-2 text-sm font-medium text-state-closed md:col-span-2 xl:col-span-1">
              {formError}
            </p>
          )}
          <Button type="submit" size="lg" font="sans" className="w-full md:col-span-2 xl:col-span-1" disabled={!!problem}>
            {t("admin.nav.add")}
            {priced && ` · ${fmt.money(q.total)}`}
          </Button>
        </aside>
      </form>
    </>
  );
}
