"use client";

import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { useSettings } from "@/lib/hooks";
import { Headline } from "@/components/brand/Headline";
import { PatternBand } from "@/components/brand/Pattern";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";

/** Compact header: headline, the session facts (live from Admin → Schedule) and a photo slot on desktop. */
export function PumpHero() {
  const { t, tn, fmt } = useI18n();
  const [settings] = useSettings();
  const prices = site.prices;
  // fmt.duration(60) reads "1 hours"; the dictionary has a proper singular.
  const length = settings.slotMinutes === 60 ? t("fmt.hour") : fmt.duration(settings.slotMinutes);
  const facts: { label: string; value: string; sub?: string; swap: boolean }[] = [
    { label: t("pump.fact.length"), value: length, swap: true },
    { label: t("pump.fact.capacity"), value: tn("riders.count", settings.slotCapacity), swap: true },
    { label: t("pump.fact.price"), value: fmt.money(prices.pumpPerRider), swap: prices.placeholder },
    {
      label: t("pump.fact.bike"),
      value: fmt.money(prices.bikeRental),
      sub: t("pump.fact.helmet", { price: fmt.money(prices.helmetRental) }),
      swap: prices.placeholder,
    },
  ];

  return (
    <PatternBand className="border-b border-line">
      <div className="container grid gap-8 pb-6 pt-7 sm:py-12 lg:py-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)] xl:items-center">
        <div className="min-w-0 space-y-4">
          <p className="eyebrow">{t("pump.eyebrow")}</p>
          <Headline text={t("pump.title")} as="h1" className="h1" brush />
          <p className="max-w-xl text-base leading-relaxed text-fg/80 sm:text-lg">{t("pump.lead")}</p>
          {/* phones: one swipeable row so the date strip stays near the top; sm+: four tiles */}
          <dl
            aria-label={t("pump.facts")}
            className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pt-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pt-2"
          >
            {facts.map((f) => (
              <div key={f.label} className="w-[156px] shrink-0 snap-start rounded-lg border border-line bg-ink/75 px-3 py-2.5 sm:w-auto">
                <dt className="text-xs font-semibold text-muted">{f.label}</dt>
                <dd className="mt-1.5 flex flex-wrap items-center">
                  <span className="h-display text-[22px] tabular sm:text-2xl">{f.value}</span>
                  {f.swap && <Swap />}
                </dd>
                {f.sub && <dd className="mt-1 text-xs text-muted tabular">{f.sub}</dd>}
              </div>
            ))}
          </dl>
        </div>
        <Photo
          slot="pump-track"
          alt={t("pump.photo.alt")}
          what={t("pump.photo.what")}
          sizes="400px"
          className="hidden aspect-[4/3] xl:block"
        />
      </div>
    </PatternBand>
  );
}
