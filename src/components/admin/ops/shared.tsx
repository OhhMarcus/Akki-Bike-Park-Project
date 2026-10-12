"use client";

import { Check, CloudLightning, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { coachById } from "@/content/catalogue";
import type { BookingResult } from "@/lib/services";
import { setAttendance, setPayment } from "@/lib/services";
import { parseTargetId } from "@/lib/schedule";
import { BIKE_SIZES, addRentals, emptyRentals, rentalBikeCount } from "@/lib/sizing";
import { weekdayOf } from "@/lib/time";
import type { Booking, Rentals, ScheduleSettings } from "@/types";
import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type I18n = ReturnType<typeof useI18n>;

/** "M ×2 · Kids 24" ×1 · 3 helmets", or null when nothing is rented. */
export function rentalsText(r: Rentals, { t, tn }: Pick<I18n, "t" | "tn">): string | null {
  const parts = BIKE_SIZES.filter((s) => r.bikes[s]).map((s) => t("adminOps.sizeQty", { size: t(`size.${s}`), n: r.bikes[s] ?? 0 }));
  if (r.helmets) parts.push(tn("helmets.count", r.helmets));
  return parts.length ? parts.join(" · ") : null;
}

export function sumRentals(bookings: Booking[]): Rentals {
  return bookings.reduce((acc, b) => addRentals(acc, b.rentals), emptyRentals());
}

/** Keep bikes and helmets within the headcount (drops the biggest sizes first). */
export function clampRentals(r: Rentals, riders: number): Rentals {
  let over = rentalBikeCount(r) - riders;
  const bikes = { ...r.bikes };
  for (const s of [...BIKE_SIZES].reverse()) {
    if (over <= 0) break;
    const n = bikes[s] ?? 0;
    const cut = Math.min(n, over);
    if (!cut) continue;
    if (n - cut) bikes[s] = n - cut;
    else delete bikes[s];
    over -= cut;
  }
  return { bikes, helmets: Math.min(r.helmets, riders) };
}

/** "Wed 14 Oct, 3:00–4:00pm" · "10月14日（三） 下午3:00–4:00" */
export function whenText(b: Pick<Booking, "date" | "start" | "end">, { t, fmt }: Pick<I18n, "t" | "fmt">) {
  return t("adminOps.when", { date: fmt.dateWeekday(b.date), time: fmt.timeRange(b.start, b.end) });
}

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

/** Local 8-digit part of a stored "+852 9123 4567" number, for the +852 input. */
export const localPhone = (phone: string) => phone.replace(/^\+852\s?/, "");

/** Booking-engine error → translated sentence (err.* keys). */
export function bookingErrorText(res: Extract<BookingResult, { ok: false }>, t: I18n["t"]) {
  return t(`err.${res.error}`, { n: res.remaining ?? 0 });
}

/** Language and coach of the lesson session a booking points at (from the weekly template). */
export function lessonMeta(b: Pick<Booking, "targetId">, settings: ScheduleSettings) {
  const ref = parseTargetId(b.targetId);
  if (ref?.kind !== "lesson") return null;
  const tpl = settings.lessonTemplates.find((x) => x.lessonId === ref.lessonId && x.weekday === weekdayOf(ref.date) && x.start === ref.start);
  return tpl ? { language: tpl.language, coach: coachById(tpl.coachId) } : null;
}

export function PaymentBadge({ payment, className }: { payment: Booking["payment"]; className?: string }) {
  const { t } = useI18n();
  const tone = { paid: "green", unpaid: "amber", refunded: "neutral" } as const;
  return (
    <Chip tone={tone[payment]} className={className}>
      {payment === "paid" && <Check className="h-3 w-3" aria-hidden />}
      {t(`pay.${payment}`)}
    </Chip>
  );
}

export function AttendanceBadge({ attendance, className }: { attendance: Booking["attendance"]; className?: string }) {
  const { t } = useI18n();
  const tone = { pending: "neutral", attended: "sky", no_show: "red" } as const;
  return (
    <Chip tone={tone[attendance]} className={className}>
      {attendance === "attended" && <Check className="h-3 w-3" aria-hidden />}
      {attendance === "no_show" && <X className="h-3 w-3" aria-hidden />}
      {t(`att.${attendance}`)}
    </Chip>
  );
}

export function FlagChip({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Chip tone="red" className={className}>
      <CloudLightning className="h-3 w-3" aria-hidden />
      {t("booking.flagged")}
    </Chip>
  );
}

/** One-tap paid/unpaid switch. */
export function PayButton({ booking, className }: { booking: Booking; className?: string }) {
  const { t } = useI18n();
  const toast = useToast();
  if (booking.payment === "refunded") return null;
  const next = booking.payment === "paid" ? "unpaid" : "paid";
  return (
    <Button
      variant="subtle"
      size="sm"
      font="sans"
      className={cn("min-h-10", className)}
      onClick={() => {
        setPayment(booking.id, next);
        toast(t(next === "paid" ? "adminOps.toast.paid" : "adminOps.toast.unpaid", { name: booking.riderName }));
      }}
    >
      {t(next === "paid" ? "adminOps.markPaid" : "adminOps.markUnpaid")}
    </Button>
  );
}

/** Attended / No-show toggles. Tapping the active one sets the rider back to expected. */
export function AttendanceToggle({ booking, className }: { booking: Booking; className?: string }) {
  const { t } = useI18n();
  const toast = useToast();
  const choose = (a: "attended" | "no_show") => {
    const next = booking.attendance === a ? "pending" : a;
    setAttendance(booking.id, next);
    const key = next === "attended" ? "adminOps.toast.attended" : next === "no_show" ? "adminOps.toast.noShow" : "adminOps.toast.pending";
    toast(t(key, { name: booking.riderName }), next === "pending" ? "info" : "success");
  };
  const base = "inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors";
  const on = booking.attendance;
  return (
    <div role="group" aria-label={t("adminOps.col.attendance")} className={cn("inline-flex gap-1.5", className)}>
      <button
        type="button"
        aria-pressed={on === "attended"}
        title={on === "attended" ? t("adminOps.undoHint") : undefined}
        onClick={() => choose("attended")}
        className={cn(base, on === "attended" ? "border-brand-sky/60 bg-brand-sky/15 text-brand-sky" : "border-line bg-card-2 text-fg hover:border-line-strong")}
      >
        <Check className="h-4 w-4" aria-hidden />
        {t("att.attended")}
      </button>
      <button
        type="button"
        aria-pressed={on === "no_show"}
        title={on === "no_show" ? t("adminOps.undoHint") : undefined}
        onClick={() => choose("no_show")}
        className={cn(base, on === "no_show" ? "border-state-closed/60 bg-state-closed/15 text-state-closed" : "border-line bg-card-2 text-muted hover:border-line-strong hover:text-fg")}
      >
        <X className="h-4 w-4" aria-hidden />
        {t("att.no_show")}
      </button>
    </div>
  );
}
