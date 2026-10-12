"use client";

import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { BikeSize, Rentals } from "@/types";
import { BIKE_SIZES, rentalBikeCount } from "@/lib/sizing";
import { NumberStepper } from "@/components/ui/stepper";
import { Swap } from "@/components/brand/Swap";
import { cn } from "@/lib/utils";

/**
 * Bikes by size + helmets. Total bikes and helmets never exceed the number of riders.
 * `suggested` highlights the size that fits the rider's height.
 */
export function RentalPicker({
  value, onChange, riders, suggested, sizes = BIKE_SIZES, className,
}: {
  value: Rentals; onChange: (r: Rentals) => void; riders: number; suggested?: BikeSize | null; sizes?: BikeSize[]; className?: string;
}) {
  const { t, fmt } = useI18n();
  const total = rentalBikeCount(value);
  const setSize = (s: BikeSize, n: number) => {
    const bikes = { ...value.bikes, [s]: n };
    if (!n) delete bikes[s];
    onChange({ ...value, bikes });
  };
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium">{t("book.rent.bike")}</p>
          <p className="text-xs text-muted">
            {t("book.rent.perBike", { price: fmt.money(site.prices.bikeRental) })}
            {site.prices.placeholder && <Swap />}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {sizes.map((s) => {
            const n = value.bikes[s] ?? 0;
            return (
              <div key={s} className={cn("flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2", s === suggested ? "border-fg/50" : "border-line")}>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{t(`size.${s}`)}</span>
                  {s === suggested && <span className="block text-[11px] font-semibold text-brand-sky">{t("book.rent.suggested", { size: t(`size.${s}`) })}</span>}
                </span>
                <NumberStepper size="sm" value={n} min={0} max={n + Math.max(0, riders - total)} onChange={(v) => setSize(s, v)} label={`${t("label.bike")} ${t(`size.${s}`)}`} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card px-3 py-2">
        <span>
          <span className="block text-sm font-semibold">{t("book.rent.helmet")}</span>
          <span className="block text-xs text-muted">{t("book.rent.perHelmet", { price: fmt.money(site.prices.helmetRental) })}</span>
        </span>
        <NumberStepper size="sm" value={value.helmets} min={0} max={riders} onChange={(helmets) => onChange({ ...value, helmets })} label={t("label.helmet")} />
      </div>
    </div>
  );
}
