"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightLeft, Ban, CloudLightning, Pencil, Phone } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { lessons } from "@/content/catalogue";
import { useAvailability, useBookings, useEvents, useSettings } from "@/lib/hooks";
import { bookingTitle } from "@/lib/labels";
import { waLink } from "@/lib/phone";
import { parseTargetId } from "@/lib/schedule";
import { cancelBooking, editBooking, moveBooking, quote } from "@/lib/services";
import { dateRange, hkNow, type HKNow } from "@/lib/time";
import { hasErrors, validate } from "@/lib/validation";
import type { Booking, Rentals } from "@/types";
import { Swap } from "@/components/brand/Swap";
import { RentalPicker } from "@/components/booking/RentalPicker";
import { DateStrip } from "@/components/calendar/DateStrip";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { Chip, SourceTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, PhoneInput, Textarea, describedBy } from "@/components/ui/field";
import { ConfirmDialog, Sheet } from "@/components/ui/sheet";
import { NumberStepper } from "@/components/ui/stepper";
import { useToast } from "@/components/ui/toast";
import { SlotPicker, type SlotOption } from "./SlotPicker";
import {
  AttendanceBadge, AttendanceToggle, PayButton, PaymentBadge, bookingErrorText, clampRentals, lessonMeta, localPhone, rentalsText, telHref, whenText,
} from "./shared";

type Mode = "view" | "edit" | "move";

/** Wide sheet with everything about one booking, plus pay / attend / edit / move / cancel. */
export function BookingSheet({ bookingId, onClose, now }: { bookingId: string | null; onClose: () => void; now: HKNow }) {
  const [bookings] = useBookings();
  const booking = bookingId ? bookings.find((b) => b.id === bookingId) : undefined;
  if (!booking) return null;
  return <SheetBody key={booking.id} b={booking} onClose={onClose} now={now} />;
}

function SheetBody({ b, onClose, now }: { b: Booking; onClose: () => void; now: HKNow }) {
  const { t, l, fmt } = useI18n();
  const toast = useToast();
  const [events] = useEvents();
  const [mode, setMode] = useState<Mode>("view");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const title = l(bookingTitle(b, events));
  const when = whenText(b, { t, fmt });
  const back = () => setMode("view");

  const footer =
    mode !== "view" ? (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" font="sans" className="min-h-10" onClick={back}>
          {t("btn.back")}
        </Button>
        <Button type="submit" form={mode === "edit" ? "bk-edit" : "bk-move"} size="sm" font="sans" className="min-h-10">
          {mode === "edit" ? t("adminOps.edit.save") : t("adminOps.move.confirm")}
        </Button>
      </div>
    ) : b.status === "confirmed" ? (
      <div className="flex flex-wrap items-center gap-2">
        <PayButton booking={b} />
        <AttendanceToggle booking={b} />
        <div className="flex w-full flex-wrap gap-2 md:ml-auto md:w-auto">
          <Button variant="subtle" size="sm" font="sans" className="min-h-10" onClick={() => setMode("edit")}>
            <Pencil className="h-4 w-4" aria-hidden />
            {t("btn.edit")}
          </Button>
          {b.kind !== "event" && (
            <Button variant="subtle" size="sm" font="sans" className="min-h-10" onClick={() => setMode("move")}>
              <ArrowRightLeft className="h-4 w-4" aria-hidden />
              {t("adminOps.sheet.move")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            font="sans"
            className="min-h-10 text-state-closed hover:bg-state-closed/10 hover:text-state-closed"
            onClick={() => setConfirmCancel(true)}
          >
            <Ban className="h-4 w-4" aria-hidden />
            {t("adminOps.sheet.cancel")}
          </Button>
        </div>
      </div>
    ) : (
      <p className="text-sm text-muted">{t("adminOps.sheet.cancelledNote")}</p>
    );

  return (
    <>
      <Sheet
        open
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
        wide
        title={mode === "edit" ? t("adminOps.edit.title") : mode === "move" ? t("adminOps.move.title") : b.riderName}
        description={`${b.ref} · ${title} · ${when}`}
        footer={footer}
      >
        {mode === "view" && <Details b={b} title={title} />}
        {mode === "edit" && <EditForm b={b} now={now} onDone={back} />}
        {mode === "move" && <MoveForm b={b} now={now} onDone={back} />}
      </Sheet>
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t("adminOps.sheet.cancelTitle")}
        body={t("adminOps.sheet.cancelBody", { name: b.riderName, when })}
        confirmLabel={t("adminOps.sheet.cancel")}
        danger
        onConfirm={() => {
          cancelBooking(b.id);
          toast(t("adminOps.toast.cancelled", { ref: b.ref }));
        }}
      />
    </>
  );
}

/** Error line that scrolls itself into view inside the sheet body (the Save button sits in the fixed footer). */
function FormError({ text }: { text: string | null }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (text) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [text]);
  if (!text) return null;
  return (
    <p ref={ref} role="alert" className="rounded-md border border-state-closed/50 bg-state-closed/10 px-3 py-2 text-sm font-medium text-state-closed">
      {text}
    </p>
  );
}

function Item({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function Details({ b, title }: { b: Booking; title: string }) {
  const { t, tn, l, fmt } = useI18n();
  const [settings] = useSettings();
  const [events] = useEvents();
  const meta = lessonMeta(b, settings);
  const cat = b.kind === "event" ? events.find((e) => e.id === b.targetId)?.categories.find((c) => c.id === b.eventCategoryId) : undefined;
  const rentals = rentalsText(b.rentals, { t, tn });
  const created = Date.parse(b.createdAt);
  const bookedOn = Number.isFinite(created) ? hkNow(created).date : b.date;

  return (
    <div className="space-y-5">
      {b.flag && (
        <div className="flex gap-3 rounded-lg border border-state-closed/60 bg-state-closed/10 p-3">
          <CloudLightning className="mt-0.5 h-5 w-5 shrink-0 text-state-closed" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold text-state-closed">{t("adminOps.sheet.flagTitle", { warning: t(`warning.${b.flag.reason}`) })}</p>
            <p className="mt-0.5">
              {t("adminOps.sheet.flagBody")} {b.flag.notified ? t("adminOps.sheet.flagSent") : t("adminOps.sheet.flagNotSent")}
            </p>
            <Link href="/admin/weather" className="mt-1.5 inline-block text-xs font-semibold underline decoration-fg/30 underline-offset-4 hover:decoration-fg">
              {t("adminOps.closure.open")}
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <Chip tone={b.status === "cancelled" ? "neutral" : "sky"}>{t(b.status === "cancelled" ? "booking.cancelled" : "booking.confirmed")}</Chip>
        <PaymentBadge payment={b.payment} />
        {b.status === "confirmed" && <AttendanceBadge attendance={b.attendance} />}
        <SourceTag source={b.source} />
      </div>

      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Item label={t("adminOps.col.when")}>
          {fmt.dateLong(b.date)}
          <span className="block tabular text-muted">{fmt.timeRange(b.start, b.end)}</span>
        </Item>
        <Item label={t("adminOps.col.what")}>
          {title}
          {meta && (
            <span className="block text-muted">
              {t(`tlang.${meta.language}`)}
              {meta.coach && (
                <>
                  {" · "}
                  {l(meta.coach.name)}
                  <Swap />
                </>
              )}
            </span>
          )}
          {cat && <span className="block text-muted">{l(cat.name)}</span>}
        </Item>
        <Item label={t("label.riders")}>{tn("riders.count", b.riders)}</Item>
        <Item label={t("label.rentals")}>{rentals ?? t("adminOps.none")}</Item>
        <Item label={t("label.price")}>
          <span className="inline-flex items-center gap-2">
            <span className="tabular">{fmt.money(b.priceHKD)}</span>
            {b.usedPack && <Chip>{t("adminOps.sheet.pack")}</Chip>}
          </span>
        </Item>
        <Item label={t("adminOps.sheet.contact")}>
          <span className="tabular">{b.phone}</span>
          <span className="mt-2 flex flex-wrap gap-2">
            <Button asChild variant="subtle" size="sm" font="sans">
              <a href={telHref(b.phone)}>
                <Phone className="h-4 w-4" aria-hidden />
                {t("adminOps.sheet.call")}
              </a>
            </Button>
            <Button asChild variant="subtle" size="sm" font="sans">
              <a href={waLink(b.phone)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="h-4 w-4" />
                {t("source.whatsapp")}
              </a>
            </Button>
          </span>
        </Item>
        <Item label={t("book.done.ref")}>
          <span className="font-mono">{b.ref}</span>
        </Item>
        {b.externalRef && (
          <Item label={b.source === "klook" ? t("adminOps.sheet.klookRef") : t("adminOps.csv.extRef")}>
            <span className="font-mono">{b.externalRef}</span>
          </Item>
        )}
        <Item label={t("adminOps.sheet.booked")}>{t("adminOps.sheet.bookedVia", { date: fmt.date(bookedOn), source: t(`source.${b.source}`) })}</Item>
        <Item label={t("book.waiver.title")}>{b.waiverSigned ? t("book.sign.signed") : t("adminOps.sheet.waiverMissing")}</Item>
        {b.notes && (
          <Item label={t("label.notes")} className="sm:col-span-2">
            <span className="whitespace-pre-line">{b.notes}</span>
          </Item>
        )}
      </dl>
    </div>
  );
}

function EditForm({ b, now, onDone }: { b: Booking; now: HKNow; onDone: () => void }) {
  const { t, tn, fmt } = useI18n();
  const toast = useToast();
  const avail = useAvailability(now);
  const [events] = useEvents();
  const [riders, setRiders] = useState(b.riders);
  const [rentals, setRentals] = useState<Rentals>(b.rentals);
  const [name, setName] = useState(b.riderName);
  const [phone, setPhone] = useState(localPhone(b.phone));
  const [extRef, setExtRef] = useState(b.externalRef ?? "");
  const [notes, setNotes] = useState(b.notes ?? "");
  const [errors, setErrors] = useState<{ name?: MessageKey; phone?: MessageKey }>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Live room in this booking's session; its own riders already count as booked.
  const event = b.kind === "event" ? events.find((e) => e.id === b.targetId) : undefined;
  const target =
    b.kind === "pump"
      ? avail.pumpSlots(b.date).find((s) => s.id === b.targetId)
      : b.kind === "lesson"
        ? avail.sessions(b.date).find((s) => s.id === b.targetId)
        : event
          ? avail.eventSpots(event).categories.find((c) => c.categoryId === b.eventCategoryId)
          : undefined;
  const free = target?.remaining ?? 0;
  const checked = !!target && b.status === "confirmed";
  const overbook = checked && riders > b.riders + free;

  const ref = parseTargetId(b.targetId);
  const lessonId = ref?.kind === "lesson" ? ref.lessonId : undefined;
  const eventPrice = event?.categories.find((c) => c.id === b.eventCategoryId)?.priceHKD;
  const kept = clampRentals(rentals, riders);
  const price =
    b.usedPack && riders === 1
      ? quote({ kind: b.kind, riders, rentals: kept, lessonId, usePack: true }).total
      : quote({ kind: b.kind, riders, rentals: kept, lessonId, eventPrice }).total;

  const changeRiders = (n: number) => {
    setRiders(n);
    setRentals((r) => clampRentals(r, n));
    setFormError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { name: validate.name(name), phone: validate.phone(phone) };
    setErrors(errs);
    setFormError(null);
    if (hasErrors(errs)) return;
    const res = editBooking(b.id, { riders, rentals: kept, riderName: name, phone, notes, externalRef: extRef });
    if (!res.ok) {
      setFormError(bookingErrorText(res, t));
      return;
    }
    toast(t("adminOps.toast.saved", { ref: b.ref }));
    onDone();
  };

  const nameErr = errors.name && t(errors.name);
  const phoneErr = errors.phone && t(errors.phone);

  return (
    <form id="bk-edit" onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("label.name")} htmlFor="ed-name" error={nameErr}>
          <Input id="ed-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" {...describedBy("ed-name", nameErr)} />
        </Field>
        <Field label={t("label.phone")} htmlFor="ed-phone" error={phoneErr} hint={t("label.phoneHint")}>
          <PhoneInput id="ed-phone" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off" {...describedBy("ed-phone", phoneErr, t("label.phoneHint"))} />
        </Field>
      </div>

      <div>
        <p id="ed-riders" className="text-sm font-medium">
          {t("label.riders")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <NumberStepper value={riders} onChange={changeRiders} min={1} max={Math.max(b.riders, target?.capacity ?? b.riders)} label={t("label.riders")} />
          {checked && !overbook && <span className="text-xs text-muted">{tn("adminOps.edit.free", Math.max(0, b.riders + free - riders))}</span>}
        </div>
        {overbook && !formError && (
          <p role="alert" className="mt-2 text-xs font-semibold text-brand-amber">
            {t("adminOps.edit.overbook", { n: free })}
          </p>
        )}
      </div>

      <RentalPicker value={rentals} onChange={setRentals} riders={riders} />

      {(b.source === "klook" || b.externalRef) && (
        <Field label={t("adminOps.sheet.klookRef")} htmlFor="ed-ext" optional={t("label.optional")}>
          <Input id="ed-ext" value={extRef} onChange={(e) => setExtRef(e.target.value)} placeholder={t("adminOps.add.klookPh")} autoComplete="off" />
        </Field>
      )}

      <Field label={t("label.notes")} htmlFor="ed-notes" optional={t("label.optional")}>
        <Textarea id="ed-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="min-h-20" />
      </Field>

      <div className="flex items-baseline justify-between gap-3 rounded-lg border border-line bg-card-2 px-4 py-3">
        <span className="text-sm font-semibold">{t("adminOps.edit.price")}</span>
        <span className="flex items-baseline gap-2">
          {price !== b.priceHKD && <span className="text-sm tabular text-muted line-through">{fmt.money(b.priceHKD)}</span>}
          <span className="h-display text-2xl tabular">{fmt.money(price)}</span>
        </span>
      </div>

      <FormError text={formError} />
    </form>
  );
}

function MoveForm({ b, now, onDone }: { b: Booking; now: HKNow; onDone: () => void }) {
  const { t, tn, l, fmt } = useI18n();
  const toast = useToast();
  const avail = useAvailability(now);
  const today = now.date;
  const dates = useMemo(() => dateRange(today, 28), [today]);
  const ref = parseTargetId(b.targetId);
  const lessonId = ref?.kind === "lesson" ? ref.lessonId : undefined;
  const [date, setDate] = useState(dates.includes(b.date) ? b.date : today);
  const [target, setTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options: SlotOption[] =
    b.kind === "pump"
      ? avail.pumpSlots(date).map((s) => ({ ...s, title: t("kind.pump"), current: s.id === b.targetId }))
      : avail.sessions(date, lessonId).map((s) => ({ ...s, title: `${l(lessons[s.lessonId].name)} · ${t(`tlang.${s.language}`)}`, current: s.id === b.targetId }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) {
      setError(t("val.pickTime"));
      return;
    }
    const res = moveBooking(b.id, target);
    if (!res.ok) {
      setError(bookingErrorText(res, t));
      return;
    }
    toast(t("adminOps.toast.moved", { when: whenText(res.booking, { t, fmt }) }));
    onDone();
  };

  return (
    <form id="bk-move" onSubmit={submit} noValidate className="space-y-4">
      <p className="text-sm text-muted">{t("adminOps.move.lead", { riders: tn("riders.count", b.riders) })}</p>
      <DateStrip
        dates={dates}
        value={date}
        onChange={(d) => {
          setDate(d);
          setTarget(null);
          setError(null);
        }}
        dayState={b.kind === "pump" ? avail.dayPump : (d) => avail.dayLessons(d, lessonId)}
        today={today}
      />
      <SlotPicker
        name="move-slot"
        label={fmt.dateLong(date)}
        options={options}
        value={target}
        onChange={(id) => {
          setTarget(id);
          setError(null);
        }}
        riders={b.riders}
      />
      <FormError text={error} />
    </form>
  );
}
