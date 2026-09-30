"use client";

import { DemoTag } from "@/components/common/DemoTag";
import { useI18n } from "@/i18n/provider";
import type { PriceLine } from "@/lib/pricing";

export function PriceSummary({ lines, subtotal, discount, total, promoCode, priceTbc }: { lines: PriceLine[]; subtotal: number; discount: number; total: number; promoCode?: string; priceTbc?: boolean }) {
  const { t, l, money } = useI18n();
  return (
    <section aria-labelledby="price-summary-title" className="surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 id="price-summary-title" className="font-display text-xl font-bold uppercase">{t("booking.priceSummary")}</h3>
        <DemoTag label={t("booking.demoPrices")} />
      </div>
      <dl className="space-y-2 text-sm">
        {lines.map((line) => (
          <div key={line.key} className="flex justify-between gap-3">
            <dt className="text-silver">{l(line.label)} <span className="text-silver-dim">× {line.qty}</span></dt>
            <dd className="shrink-0 tabular-nums">{money(line.amount * line.qty)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-graphite-700 pt-2">
          <dt className="text-silver">{t("booking.subtotal")}</dt>
          <dd className="tabular-nums">{money(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between gap-3 text-trail-green">
            <dt>{t("booking.discount")}{promoCode ? ` (${promoCode})` : ""}</dt>
            <dd className="tabular-nums">−{money(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-graphite-700 pt-3 text-base font-bold">
          <dt>{t("label.total")}</dt>
          <dd className="tabular-nums" data-testid="price-total">{money(total)}</dd>
        </div>
      </dl>
      {priceTbc && <p className="mt-3 text-xs text-silver-dim">{t("booking.eventPriceTbc")}</p>}
    </section>
  );
}
