"use client";

import { useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useBookings, useEvents } from "@/lib/store";
import { downloadFile, toCsv } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/common/States";
import { DemoTag } from "@/components/common/DemoTag";
import type { Booking, BookingStatus } from "@/types";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { AdminPageHeader } from "./AdminPageHeader";
import { BookingDetailModal } from "./BookingDetailModal";
import { PaymentStatusBadge } from "./StatusBadge";
import { bookingStatuses, csvName } from "./helpers";

export function BookingsAdmin() {
  const { t, l, date, money } = useI18n();
  const toast = useToast();
  const [bookings, setBookings] = useBookings();
  const [events] = useEvents();
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [day, setDay] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);

  const rows = useMemo(() => bookings.filter((b) => (status === "all" || b.status === status) && (!day || b.date === day)), [bookings, status, day]);
  const detail = bookings.find((b) => b.id === detailId) ?? null;

  const update = (id: string, patch: (b: Booking) => Booking) => setBookings((prev) => prev.map((b) => (b.id === id ? patch(b) : b)));
  const setBookingStatus = (id: string, next: BookingStatus) => {
    update(id, (b) => ({ ...b, status: next }));
    toast(t("admin.bk.statusUpdated", { status: t(`status.${next}`) }), "success");
  };

  const experienceLabel = (b: Booking) => {
    const ev = b.eventId ? events.find((e) => e.id === b.eventId) : undefined;
    return ev ? `${t("exp.event")}: ${l(ev.title)}` : t(`exp.${b.experienceId}`);
  };

  const columns: Column<Booking>[] = [
    {
      key: "ref",
      header: t("admin.bk.ref"),
      sortValue: (b) => b.reference,
      cell: (b) => (
        <div>
          <span className="font-mono text-xs">{b.reference}</span>
          {b.isDemo && <DemoTag className="ml-1.5" />}
          {(b.changeRequest || b.paymentStatus === "refund_requested") && <p className="text-xs text-signal">{t("admin.bk.needsAction")}</p>}
        </div>
      ),
    },
    { key: "rider", header: t("label.rider"), sortValue: (b) => b.contactName, cell: (b) => <span className="font-medium">{b.contactName}</span> },
    { key: "exp", header: t("admin.bk.experience"), sortValue: experienceLabel, cell: (b) => <span className="text-silver">{experienceLabel(b)}</span> },
    { key: "date", header: t("label.date"), sortValue: (b) => `${b.date}${b.period}`, cell: (b) => <span className="whitespace-nowrap">{date(b.date)} · {t(`period.${b.period}`)}</span> },
    { key: "riders", header: t("label.riders"), sortValue: (b) => b.participants.length, cell: (b) => b.participants.length, className: "tabular-nums" },
    {
      key: "status",
      header: t("label.status"),
      sortValue: (b) => b.status,
      cell: (b) => (
        <Select aria-label={`${t("admin.bk.setStatus")}: ${b.reference}`} value={b.status} onChange={(e) => setBookingStatus(b.id, e.target.value as BookingStatus)} className="w-36">
          {bookingStatuses.map((s) => (
            <option key={s} value={s}>{t(`status.${s}`)}</option>
          ))}
        </Select>
      ),
    },
    { key: "pay", header: t("admin.bk.payment"), sortValue: (b) => b.paymentStatus, cell: (b) => <PaymentStatusBadge status={b.paymentStatus} /> },
    { key: "total", header: t("label.total"), sortValue: (b) => b.total, cell: (b) => <span className="whitespace-nowrap tabular-nums">{money(b.total)}</span> },
  ];

  const exportCsv = () => {
    downloadFile(
      csvName("bookings"),
      toCsv(rows.map((b) => ({ reference: b.reference, contact: b.contactName, email: b.contactEmail, phone: b.contactPhone, experience: b.experienceId, date: b.date, period: b.period, riders: b.participants.length, status: b.status, payment: b.paymentStatus, total: b.total, promo: b.promoCode ?? "", waiver: b.waiverAccepted ? "yes" : "no", notes: b.notes ?? "" }))),
      "text/csv",
    );
    toast(t("admin.exported"), "success");
  };

  return (
    <>
      <AdminPageHeader
        title={t("admin.bk.title")}
        description={t("admin.bk.sub")}
        actions={
          <Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" aria-hidden />
            {t("btn.export")}
          </Button>
        }
      />
      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(b) => b.id}
        caption={t("admin.bk.title")}
        searchText={(b) => `${b.reference} ${b.contactName} ${b.contactEmail} ${b.contactPhone}`}
        defaultSort={{ key: "date", dir: "desc" }}
        empty={<EmptyState title={t("admin.bk.empty")} />}
        toolbar={
          <>
            <Field label={t("label.status")} htmlFor="bk-status" className="sm:w-44">
              <Select id="bk-status" value={status} onChange={(e) => setStatus(e.target.value as "all" | BookingStatus)}>
                <option value="all">{t("label.all")}</option>
                {bookingStatuses.map((s) => (
                  <option key={s} value={s}>{t(`status.${s}`)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("label.date")} htmlFor="bk-date" className="sm:w-44">
              <Input id="bk-date" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
            </Field>
            {(status !== "all" || day) && (
              <Button variant="ghost" onClick={() => { setStatus("all"); setDay(""); }}>
                {t("btn.clear")}
              </Button>
            )}
          </>
        }
        actions={(b) => (
          <Button variant="ghost" size="icon" aria-label={`${t("btn.view")}: ${b.reference}`} onClick={() => setDetailId(b.id)}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />
      <BookingDetailModal booking={detail} onClose={() => setDetailId(null)} onUpdate={update} experienceLabel={detail ? experienceLabel(detail) : ""} />
    </>
  );
}
