"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/provider";
import type { BookingStatus, PaymentStatus } from "@/types";

type Tone = "neutral" | "green" | "blue" | "amber" | "red" | "silver";

const bookingTone: Record<BookingStatus, Tone> = { pending: "amber", confirmed: "blue", checked_in: "green", completed: "silver", cancelled: "red", no_show: "red" };
const paymentTone: Record<PaymentStatus, Tone> = { unpaid: "amber", paid_demo: "green", refund_requested: "amber", refunded_demo: "silver" };

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return <Badge tone={tone}>{label}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useI18n();
  return <StatusBadge label={t(`status.${status}`)} tone={bookingTone[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useI18n();
  return <StatusBadge label={t(`pay.${status}`)} tone={paymentTone[status]} />;
}
