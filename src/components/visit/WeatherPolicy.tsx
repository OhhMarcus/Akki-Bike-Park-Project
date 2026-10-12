"use client";

import { CloudLightning, CloudRain, ThermometerSun, Wind } from "lucide-react";
import type { MessageKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/provider";
import { useConditions } from "@/lib/hooks";
import type { WarningCode } from "@/types";
import { SectionTitle } from "@/components/brand/Headline";
import { Swap } from "@/components/brand/Swap";
import { PlaceholderNote } from "@/components/home/PlaceholderNote";
import { Chip } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LiveStatus } from "./LiveStatus";

type Outcome = "closed" | "paused" | "open";

/** SAMPLE policy per HK Observatory warning (AKKI confirms the real rules). */
const ROWS: { code: WarningCode; outcome: Outcome; icon: typeof Wind; iconTone: string; detail: MessageKey }[] = [
  { code: "amber_rain", outcome: "paused", icon: CloudRain, iconTone: "text-brand-amber", detail: "visit.weather.amber_rain" },
  { code: "red_rain", outcome: "closed", icon: CloudRain, iconTone: "text-state-closed", detail: "visit.weather.closes" },
  { code: "black_rain", outcome: "closed", icon: CloudRain, iconTone: "text-fg", detail: "visit.weather.closes" },
  { code: "t3", outcome: "paused", icon: Wind, iconTone: "text-brand-amber", detail: "visit.weather.t3" },
  { code: "t8", outcome: "closed", icon: Wind, iconTone: "text-state-closed", detail: "visit.weather.closes" },
  { code: "thunderstorm", outcome: "paused", icon: CloudLightning, iconTone: "text-brand-amber", detail: "visit.weather.thunderstorm" },
  { code: "very_hot", outcome: "open", icon: ThermometerSun, iconTone: "text-brand-amber", detail: "visit.weather.very_hot" },
];

function OutcomeChip({ outcome }: { outcome: Outcome }) {
  const { t } = useI18n();
  if (outcome === "closed") {
    return (
      <Chip tone="red">
        <span aria-hidden className="h-2 w-2 rounded-sm border border-state-closed hatch-closed" />
        {t("visit.weather.outcome.closed")}
      </Chip>
    );
  }
  if (outcome === "paused") {
    return (
      <Chip tone="amber">
        <span aria-hidden className="flex gap-px">
          <span className="h-2 w-[3px] bg-brand-amber" />
          <span className="h-2 w-[3px] bg-brand-amber" />
        </span>
        {t("visit.weather.outcome.paused")}
      </Chip>
    );
  }
  return <Chip>{t("visit.weather.outcome.open")}</Chip>;
}

export function WeatherPolicy() {
  const { t } = useI18n();
  const [conditions] = useConditions();
  const active = conditions.warning;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <SectionTitle eyebrow={t("visit.weather.eyebrow")} title={t("visit.weather.title")} lead={t("visit.weather.lead")} />
        <div>
          <p className="eyebrow mb-2.5">{t("visit.live.label")}</p>
          <LiveStatus />
        </div>
        <PlaceholderNote>{t("visit.weather.sample")}</PlaceholderNote>
      </div>

      <div className="surface self-start overflow-hidden">
        <p id="weather-list-title" className="eyebrow border-b border-line bg-card-2 px-5 py-3 text-fg/80">
          {t("visit.weather.list")}
          <Swap />
        </p>
        <ul aria-labelledby="weather-list-title" className="divide-y divide-line">
          {ROWS.map((r) => {
            const Icon = r.icon;
            const now = r.code === active;
            return (
              <li key={r.code} className={cn("relative grid gap-3 p-4 pl-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6 sm:p-5 sm:pl-6", now && "bg-state-closed/10")}>
                {r.outcome === "closed" && <span aria-hidden className="hatch-closed absolute inset-y-0 left-0 w-1 bg-state-closed/40" />}
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-md border",
                      r.code === "black_rain" ? "border-fg/40 bg-black" : "border-line bg-card-2",
                    )}
                  >
                    <Icon aria-hidden className={cn("h-5 w-5", r.iconTone)} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{t(`warning.${r.code}`)}</p>
                    {now && (
                      <Chip tone="red" className="mt-1">
                        {t("visit.weather.now")}
                      </Chip>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <OutcomeChip outcome={r.outcome} />
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(r.detail)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
