"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/provider";
import { sanitizeText } from "@/lib/sanitize";
import { hkToday } from "@/lib/dates";
import type { Booking, BookingStatus } from "@/types";
import { PaymentStatusBadge } from "./StatusBadge";
import { bookingStatuses } from "./helpers";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2 py-1.5 text-sm">
      <dt className="text-silver-dim">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

export function BookingDetailModal({ booking, onClose, onUpdate, experienceLabel }: { booking: Booking | null; onClose: () => void; onUpdate: (id: string, fn: (b: Booking) => Booking) => void; experienceLabel: string }) {
  const { t, date, money } = useI18n();
  const toast = useToast();
  const [note, setNote] = useState("");

  const appendNote = (b: Booking, text: string): Booking => ({ ...b, notes: [b.notes, `[${hkToday()}] ${text}`].filter(Boolean).join("\n") });

  return (
    <Modal open={!!booking} onOpenChange={(o) => { if (!o) { onClose(); setNote(""); } }} title={booking ? t("admin.bk.detailTitle", { ref: booking.reference }) : ""} className="max-w-2xl">
      {booking && (
        <div className="space-y-5">
          <dl className="divide-y divide-graphite-800">
            <Row label={t("label.rider")}>{booking.contactName}</Row>
            <Row label={t("label.email")}>{booking.contactEmail}</Row>
            <Row label={t("label.phone")}>{booking.contactPhone}</Row>
            <Row label={t("admin.bk.experience")}>{experienceLabel}</Row>
            <Row label={t("label.date")}>{date(booking.date)} · {t(`period.${booking.period}`)}</Row>
            <Row label={t("label.total")}>
              {money(booking.total)}
              {booking.discount > 0 && <span className="text-silver-dim"> ({t("admin.bk.discount", { amount: money(booking.discount) })}{booking.promoCode ? ` ${booking.promoCode}` : ""})</span>}
            </Row>
            <Row label={t("admin.bk.waiver")}>{booking.waiverAccepted ? t("admin.bk.waiverYes") : t("admin.bk.waiverNo")}</Row>
          </dl>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("label.status")} htmlFor="bkd-status">
              <Select id="bkd-status" value={booking.status} onChange={(e) => { onUpdate(booking.id, (b) => ({ ...b, status: e.target.value as BookingStatus })); toast(t("admin.bk.statusUpdated", { status: t(`status.${e.target.value as BookingStatus}`) }), "success"); }}>
                {bookingStatuses.map((s) => (
                  <option key={s} value={s}>{t(`status.${s}`)}</option>
                ))}
              </Select>
            </Field>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{t("admin.bk.payment")}</p>
              <div className="flex min-h-11 flex-wrap items-center gap-2">
                <PaymentStatusBadge status={booking.paymentStatus} />
                {booking.paymentStatus === "paid_demo" && (
                  <Button variant="secondary" onClick={() => { onUpdate(booking.id, (b) => ({ ...b, paymentStatus: "refund_requested" })); toast(t("admin.bk.refundMarked"), "success"); }}>
                    {t("admin.bk.markRefundRequested")}
                  </Button>
                )}
                {booking.paymentStatus === "refund_requested" && (
                  <Button variant="secondary" onClick={() => { onUpdate(booking.id, (b) => ({ ...b, paymentStatus: "refunded_demo" })); toast(t("admin.bk.refundDone"), "success"); }}>
                    {t("admin.bk.markRefunded")}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {booking.changeRequest && (
            <section className="rounded-lg border border-signal/40 bg-signal/5 p-4" aria-label={t("admin.bk.changeRequest")}>
              <h3 className="font-display text-lg font-bold uppercase">{t("admin.bk.changeRequest")}</h3>
              <p className="mt-1 text-sm">
                <span className="font-semibold">{t(booking.changeRequest.type === "cancel" ? "admin.bk.reqCancel" : "admin.bk.reqChange")}</span>: {booking.changeRequest.note}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    const req = booking.changeRequest;
                    if (!req) return;
                    onUpdate(booking.id, (b) => {
                      const next = appendNote({ ...b, changeRequest: undefined }, t("admin.bk.noteApproved", { type: t(req.type === "cancel" ? "admin.bk.reqCancel" : "admin.bk.reqChange") }));
                      return req.type === "cancel" ? { ...next, status: "cancelled", paymentStatus: b.paymentStatus === "paid_demo" ? "refund_requested" : b.paymentStatus } : next;
                    });
                    toast(t("admin.bk.approved"), "success");
                  }}
                >
                  {t("admin.bk.approve")}
                </Button>
                <Button variant="secondary" onClick={() => { onUpdate(booking.id, (b) => appendNote({ ...b, changeRequest: undefined }, t("admin.bk.noteDeclined"))); toast(t("admin.bk.declined"), "info"); }}>
                  {t("admin.bk.decline")}
                </Button>
              </div>
            </section>
          )}

          <section aria-label={t("admin.bk.participants")}>
            <h3 className="font-display text-lg font-bold uppercase">{t("admin.bk.participants")} ({booking.participants.length})</h3>
            <ul className="mt-2 max-h-48 divide-y divide-graphite-800 overflow-y-auto rounded-md border border-graphite-700 text-sm">
              {booking.participants.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <span className="font-medium">{p.name}{p.age !== "" && <span className="text-silver-dim">, {p.age}</span>}</span>
                  <span className="text-xs text-silver">
                    {t(`level.${p.level}`)} · {t(p.bike === "rental" ? "admin.bk.bikeRental" : "admin.bk.bikeOwn")}
                    {p.guardian && ` · ${t("admin.bk.guardian")}: ${p.guardian.name}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label={t("admin.bk.notes")}>
            <h3 className="font-display text-lg font-bold uppercase">{t("admin.bk.notes")}</h3>
            {booking.notes ? <p className="mt-2 whitespace-pre-wrap rounded-md border border-graphite-700 bg-graphite-950 p-3 text-sm">{booking.notes}</p> : <p className="mt-2 text-sm text-silver-dim">{t("admin.bk.noNotes")}</p>}
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                const clean = sanitizeText(note, 500);
                if (!clean) return;
                onUpdate(booking.id, (b) => appendNote(b, clean));
                setNote("");
                toast(t("admin.bk.noteSaved"), "success");
              }}
            >
              <Field label={t("admin.bk.addNote")} htmlFor="bkd-note">
                <Textarea id="bkd-note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} className="min-h-20" />
              </Field>
              <Button type="submit" variant="secondary" disabled={!sanitizeText(note)}>
                {t("admin.bk.saveNote")}
              </Button>
            </form>
          </section>
        </div>
      )}
    </Modal>
  );
}
