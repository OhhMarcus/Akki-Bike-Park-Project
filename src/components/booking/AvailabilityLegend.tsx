"use client";

import { Ban, Check, CircleAlert, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { Availability } from "@/types";

export const availabilityMeta: Record<Availability, { icon: typeof Check; text: string; border: string }> = {
  available: { icon: Check, text: "text-trail-green", border: "border-trail-green/50" },
  limited: { icon: CircleAlert, text: "text-signal", border: "border-signal/50" },
  full: { icon: X, text: "text-danger", border: "border-danger/40" },
  closed: { icon: Ban, text: "text-silver-dim", border: "border-graphite-700" },
};

const order: Availability[] = ["available", "limited", "full", "closed"];

/** Colour + icon + text legend so colour is never the only signal. */
export function AvailabilityLegend({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2 text-xs text-silver", className)} aria-label={t("booking.legend")}>
      {order.map((s) => {
        const meta = availabilityMeta[s];
        const Icon = meta.icon;
        return (
          <li key={s} className="inline-flex items-center gap-1.5">
            <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded border", meta.border, meta.text)}>
              <Icon className="h-3 w-3" aria-hidden />
            </span>
            {t(`avail.${s}`)}
          </li>
        );
      })}
    </ul>
  );
}
