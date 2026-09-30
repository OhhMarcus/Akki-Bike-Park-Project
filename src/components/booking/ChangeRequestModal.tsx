"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { isFreeCancellation } from "@/lib/pricing";
import { sanitizeText } from "@/lib/sanitize";
import { useBookings } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";

const noteSchema = z.string().transform((s) => sanitizeText(s, 500));

export function ChangeRequestModal({ booking, open, onOpenChange }: { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useI18n();
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("booking.change.title")} description={`${booking.reference}`}>
      <Body booking={booking} onDone={() => onOpenChange(false)} />
    </Modal>
  );
}

function Body({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [, setBookings] = useBookings();
  const [type, setType] = useState<"cancel" | "change">("change");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const free = isFreeCancellation(booking.date, siteConfig.cancellationWindowHours);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = noteSchema.parse(note);
    if (type === "change" && clean.length < 5) return setError(t("booking.change.noteRequired"));
    setError(null);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              changeRequest: { type, note: clean, requestedAt: new Date().toISOString() },
              paymentStatus: type === "cancel" && b.paymentStatus === "paid_demo" ? "refund_requested" : b.paymentStatus,
            }
          : b,
      ),
    );
    toast(t(type === "cancel" ? "booking.change.doneCancel" : "booking.change.doneChange"));
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div role="radiogroup" aria-label={t("booking.change.type")} className="grid grid-cols-2 gap-2">
        {(["change", "cancel"] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={type === k} onClick={() => setType(k)} className={cn("min-h-11 rounded-md border px-3 text-sm font-semibold", type === k ? "border-bone bg-graphite-800" : "border-graphite-600 hover:bg-graphite-800")}>
            {t(k === "change" ? "booking.change.optChange" : "booking.change.optCancel")}
          </button>
        ))}
      </div>
      {type === "cancel" && (
        <p role="status" className={cn("rounded-md border p-3 text-sm", free ? "border-trail-green/40 text-trail-green" : "border-signal/40 text-signal")}>
          {free ? t("booking.change.free", { hours: siteConfig.cancellationWindowHours }) : t("booking.change.notFree", { hours: siteConfig.cancellationWindowHours })}
        </p>
      )}
      <Field label={t("booking.change.note")} htmlFor="cr-note" error={error ?? undefined} hint={t("booking.change.noteHint")}>
        <Textarea id="cr-note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "cr-note-error" : undefined} />
      </Field>
      <p className="text-xs text-silver-dim">{t("booking.change.demoNote")}</p>
      <Button type="submit" variant={type === "cancel" ? "danger" : "primary"} className="w-full">{t(type === "cancel" ? "booking.change.submitCancel" : "booking.change.submitChange")}</Button>
    </form>
  );
}
