"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarPlus, Check, Download, LayoutDashboard } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { Booking } from "@/types";
import { buildIcs, downloadFile, googleCalendarUrl } from "@/lib/calendar-links";
import { waLink } from "@/lib/phone";
import { rentalBikeCount } from "@/lib/sizing";
import { buttonVariants } from "@/components/ui/button";
import { BrushUnderline } from "@/components/brand/Brush";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { cn } from "@/lib/utils";

/**
 * Booking confirmation: ref, when/where/who, add-to-calendar (.ics + Google),
 * WhatsApp the park with the booking prefilled, and (demo) a link that opens
 * the same booking in the staff dashboard.
 */
export function ConfirmationPanel({
  booking, title, seconds, actions, className,
}: {
  booking: Booking;
  /** e.g. "Foundation Class" or "Pump Track session" */
  title: string;
  seconds?: number;
  actions?: React.ReactNode;
  className?: string;
}) {
  const { t, tn, l, fmt } = useI18n();
  const when = t("fmt.dateTime", { date: fmt.dateWeekday(booking.date), time: fmt.timeRange(booking.start, booking.end) });
  const where = `${site.name.en} · ${l(site.location.area)}`;
  const calTitle = `${title} · ${site.name.en}`;
  const details = t("book.calDetails", { ref: booking.ref });
  const bikes = rentalBikeCount(booking.rentals);
  const wa = waLink(site.whatsapp.display, t("wa.bookingPrefill", { name: booking.riderName, ref: booking.ref, when }));

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-grad text-ink">
          <Check className="h-7 w-7" strokeWidth={3} aria-hidden />
        </span>
        <div>
          <p className="h-display text-4xl" role="status">{t("book.done.title")}</p>
          <BrushUnderline className="mt-2 w-32" />
          {seconds ? <p className="mt-2 text-sm font-semibold text-brand-sky">{t("book.done.seconds", { n: seconds })}</p> : null}
        </div>
      </div>

      <div className="surface divide-y divide-line">
        <div className="flex items-center justify-between gap-4 p-4">
          <span className="text-sm text-muted">{t("book.done.ref")}</span>
          <span className="font-display text-2xl font-extrabold italic tracking-wider [font-synthesis:none]">{booking.ref}</span>
        </div>
        <dl className="grid gap-3 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">{t("book.done.when")}</dt>
            <dd className="font-semibold">{title}</dd>
            <dd>{when}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("book.done.where")}</dt>
            <dd>{l(site.location.area)}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("book.done.who")}</dt>
            <dd>
              {booking.riderName} · {tn("riders.count", booking.riders)}
            </dd>
            <dd className="tabular text-muted">{booking.phone}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("label.rentals")}</dt>
            <dd>
              {bikes || booking.rentals.helmets
                ? [bikes ? tn("bikes.count", bikes) : null, booking.rentals.helmets ? tn("helmets.count", booking.rentals.helmets) : null].filter(Boolean).join(" · ")
                : t("book.rent.own")}
            </dd>
            <dd className="font-semibold tabular">{fmt.money(booking.priceHKD)}</dd>
          </div>
        </dl>
        <p className="p-4 text-sm text-muted">{t("book.done.arrive")} {t("book.done.sent", { phone: booking.phone })}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          className={buttonVariants({ variant: "secondary", font: "sans" })}
          onClick={() =>
            downloadFile(
              `akki-${booking.ref}.ics`,
              buildIcs({ uid: booking.id, title: calTitle, date: booking.date, start: booking.start, end: booking.end, location: where, description: details }),
              "text/calendar",
            )
          }
        >
          <Download className="h-4 w-4" aria-hidden />
          {t("book.done.ics")}
        </button>
        <a
          className={buttonVariants({ variant: "secondary", font: "sans" })}
          target="_blank"
          rel="noopener noreferrer"
          href={googleCalendarUrl({ title: calTitle, date: booking.date, start: booking.start, end: booking.end, location: where, details })}
        >
          <CalendarPlus className="h-4 w-4" aria-hidden />
          {t("book.done.google")}
        </a>
        <a className={cn(buttonVariants({ variant: "secondary", font: "sans" }), "border-[#25D366]/50 text-[#5EDC8C] hover:border-[#25D366]")} target="_blank" rel="noopener noreferrer" href={wa}>
          <WhatsAppIcon className="h-4 w-4" />
          {t("book.done.whatsapp")}
        </a>
      </div>
      <Link
        href={`/admin/bookings?q=${encodeURIComponent(booking.ref)}`}
        target="_blank"
        className="group flex items-center gap-3 rounded-lg border border-dashed border-brand-amber/60 bg-brand-amber/10 p-3 text-brand-amber transition-colors hover:bg-brand-amber/15"
      >
        <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{t("book.done.admin")}</span>
          <span className="block text-xs text-brand-amber/80">{t("book.done.adminNote")}</span>
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </Link>
      {actions}
    </div>
  );
}
