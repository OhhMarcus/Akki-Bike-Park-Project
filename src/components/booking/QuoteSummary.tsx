"use client";

import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { Quote } from "@/lib/services";
import { Swap } from "@/components/brand/Swap";
import { cn } from "@/lib/utils";

/** Line items + total for any booking. */
export function QuoteSummary({ quote, className, title }: { quote: Quote; className?: string; title?: string }) {
  const { t, fmt } = useI18n();
  return (
    <div className={cn("surface p-4", className)}>
      <p className="mb-3 flex items-center text-sm font-semibold">
        {title ?? t("book.summary")}
        {site.prices.placeholder && <Swap label={t("demo.pricesPlaceholder")} />}
      </p>
      <dl className="space-y-2 text-sm">
        {quote.lines.map((l) => (
          <div key={l.key} className="flex justify-between gap-4">
            <dt className="text-muted">
              {t(`book.line.${l.key}`)}
              {l.qty > 1 && <span className="tabular"> · {t("book.line.qty", { qty: l.qty, unit: fmt.money(l.unit, { zeroAsFree: false }) })}</span>}
            </dt>
            <dd className="tabular">{fmt.money(l.amount, { zeroAsFree: false })}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
        <span className="font-semibold">{t("book.total")}</span>
        <span className="h-display text-3xl tabular">{fmt.money(quote.total)}</span>
      </div>
    </div>
  );
}
