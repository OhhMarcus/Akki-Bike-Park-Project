"use client";

import { Pencil } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { Quote } from "@/lib/services";
import { PaymentPicker, type PayMethod } from "@/components/booking/PaymentPicker";
import { QuoteSummary } from "@/components/booking/QuoteSummary";
import { BookingDetails, type SummaryProps } from "./BookingSummary";
import { InlineAlert } from "./bits";

/** Review + quote (phones/tablets; the side column has them on desktop) + mock checkout. */
export function StepPay({
  details, quote, error, seed, onPay, onEditClass, onEditRider,
}: {
  details: SummaryProps;
  quote: Quote;
  error: string | null;
  seed: string;
  onPay: (method: PayMethod) => void;
  onEditClass: () => void;
  onEditRider: () => void;
}) {
  const { t } = useI18n();
  const edit = "inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted underline decoration-fg/20 underline-offset-4 hover:text-fg hover:decoration-fg";
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4 lg:hidden">
        <BookingDetails {...details} />
        <QuoteSummary quote={quote} />
      </div>
      <div className="-mt-2 flex flex-wrap gap-x-6">
        <button type="button" onClick={onEditClass} className={edit}>
          <Pencil aria-hidden className="h-3.5 w-3.5" />
          {t("lessons.pay.editClass")}
        </button>
        <button type="button" onClick={onEditRider} className={edit}>
          <Pencil aria-hidden className="h-3.5 w-3.5" />
          {t("lessons.pay.editRider")}
        </button>
      </div>
      {error && <InlineAlert title={t("lessons.pay.errorTitle")}>{error}</InlineAlert>}
      <PaymentPicker amount={quote.total} onPay={onPay} seed={seed} />
    </div>
  );
}
