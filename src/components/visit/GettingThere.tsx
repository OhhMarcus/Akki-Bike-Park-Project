"use client";

import { useRef, useState } from "react";
import { Car, CarTaxiFront, ExternalLink, TrainFront } from "lucide-react";
import { site } from "@/config/site";
import type { MessageKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/provider";
import { Swap } from "@/components/brand/Swap";
import { mapsLinks } from "@/components/home/status";
import { cn } from "@/lib/utils";

type Mode = "mtr" | "taxi" | "car";
const MODES: { id: Mode; icon: typeof Car; label: MessageKey }[] = [
  { id: "mtr", icon: TrainFront, label: "visit.go.mtr" },
  { id: "taxi", icon: CarTaxiFront, label: "visit.go.taxi" },
  { id: "car", icon: Car, label: "visit.go.car" },
];

/** MTR / Taxi / Car tabs (WAI-ARIA tabs: arrow keys, Home/End). Route specifics stay marked as placeholders. */
export function GettingThere() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("mtr");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = MODES.findIndex((m) => m.id === mode);
  const go = (n: number) => {
    const i = (n + MODES.length) % MODES.length;
    setMode(MODES[i].id);
    refs.current[i]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={t("visit.go.tabs")} className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-[#0E0D0D] p-1">
        {MODES.map((m, i) => {
          const active = m.id === mode;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`go-tab-${m.id}`}
              aria-selected={active}
              aria-controls={`go-panel-${m.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setMode(m.id)}
              onKeyDown={(e) => {
                const keys: Record<string, number> = { ArrowRight: idx + 1, ArrowLeft: idx - 1, Home: 0, End: MODES.length - 1 };
                if (e.key in keys) {
                  e.preventDefault();
                  go(keys[e.key]);
                }
              }}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors",
                active ? "bg-fg text-ink" : "text-muted hover:bg-white/5 hover:text-fg",
              )}
            >
              <Icon aria-hidden className="h-4 w-4 shrink-0" />
              {t(m.label)}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`go-panel-${mode}`} aria-labelledby={`go-tab-${mode}`} tabIndex={0} className="surface mt-4 p-5 sm:p-7">
        {mode === "mtr" ? <MtrPanel /> : mode === "taxi" ? <TaxiPanel /> : <CarPanel />}
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-card-2 font-display text-lg font-extrabold italic leading-none [font-synthesis:none]">
        {n}
      </span>
      <span className="pt-1 text-[15px] leading-relaxed sm:text-base">{children}</span>
    </li>
  );
}

function OutLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-fg/25 px-4 text-sm font-semibold transition-colors hover:border-fg hover:bg-white/5"
    >
      {children}
      <ExternalLink aria-hidden className="h-3.5 w-3.5 text-muted" />
      <span className="sr-only">{t("visit.newTab")}</span>
    </a>
  );
}

function MtrPanel() {
  const { t, l } = useI18n();
  return (
    <>
      <ol className="space-y-4">
        <Step n={1}>
          {t("visit.go.mtr.step1", { station: l(site.location.station) })}
          {site.location.placeholder && <Swap />}
        </Step>
        <Step n={2}>{t("visit.go.mtr.step2")}</Step>
      </ol>
      <p className="mt-5 text-sm text-muted">
        {t("visit.go.mtr.tbc")}
        <Swap />
      </p>
      <OutLink href={mapsLinks(site.location.mapQuery).transit}>{t("visit.go.transit")}</OutLink>
    </>
  );
}

function TaxiPanel() {
  const { t } = useI18n();
  return (
    <>
      <p className="eyebrow">{t("visit.go.taxi.show")}</p>
      {/* Always in Chinese: it's for the driver. */}
      <div lang="zh-Hant-HK" className="mt-3 rounded-lg border border-line bg-card-2 p-5 sm:p-6">
        <p className="text-2xl font-black leading-snug sm:text-3xl">{site.name.zh}</p>
        <p className="mt-2 text-lg font-semibold">
          {site.location.address.zh}
          {site.location.placeholder && <Swap />}
        </p>
        <p className="mt-1 text-fg/70">{site.location.area.zh}</p>
      </div>
      <p className="mt-4 text-sm text-muted">
        {t("visit.go.taxi.tip")}
        {site.location.placeholder && <Swap />}
      </p>
    </>
  );
}

function CarPanel() {
  const { t, l } = useI18n();
  return (
    <>
      <dl className="grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="eyebrow">{t("visit.address")}</dt>
          <dd className="mt-1.5 font-semibold">
            {l(site.location.address)}
            {site.location.placeholder && <Swap />}
          </dd>
          <dd className="text-sm text-muted">{l(site.location.area)}</dd>
        </div>
        <div>
          <dt className="eyebrow">{t("visit.go.car.parking")}</dt>
          <dd className="mt-1.5">
            {t("visit.go.car.tbc")}
            <Swap />
          </dd>
        </div>
      </dl>
      <OutLink href={mapsLinks(site.location.mapQuery).driving}>{t("visit.go.drive")}</OutLink>
    </>
  );
}
