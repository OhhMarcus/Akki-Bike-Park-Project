"use client";

import Link from "next/link";
import { RotateCcw, Ticket } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { Booking, PackHolding } from "@/types";
import { ConfirmationPanel } from "@/components/booking/ConfirmationPanel";
import { Button, buttonVariants } from "@/components/ui/button";

/** Confirmation, pack balance (when a pack was bought or used), book another, pump track. */
export function StepDone({
  booking, title, seconds, pack, onAnother,
}: {
  booking: Booking;
  title: string;
  seconds?: number;
  pack?: PackHolding;
  onAnother: () => void;
}) {
  const { t, tn, fmt } = useI18n();
  return (
    <div className="max-w-3xl">
      <ConfirmationPanel
        booking={booking}
        title={title}
        seconds={seconds}
        actions={
          <div className="space-y-6 border-t border-line pt-6">
            {pack && (
              <div className="flex items-start gap-3 rounded-lg border border-fg/30 bg-card p-4">
                <Ticket aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">{tn("lessons.done.packLeft", pack.remaining)}</p>
                  <p className="mt-0.5 text-sm text-muted">{t("lessons.done.packUse", { date: fmt.date(pack.expiresOn) })}</p>
                </div>
              </div>
            )}
            <div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" size="lg" onClick={onAnother}>
                  <RotateCcw aria-hidden className="h-4 w-4" />
                  {t("book.done.another")}
                </Button>
                <Link href="/pump-track" className={buttonVariants({ size: "lg" })}>
                  {t("cta.bookPump")}
                </Link>
              </div>
              <p className="mt-3 text-sm text-muted">{t("lessons.done.pumpLead")}</p>
            </div>
          </div>
        }
      />
    </div>
  );
}
