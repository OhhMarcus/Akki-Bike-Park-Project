"use client";

import { useState } from "react";
import { Bike, Bus, Car, TrainFront } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { cn } from "@/lib/utils";

const steps = ["visit.dir.1", "visit.dir.2", "visit.dir.3", "visit.dir.4"] as const;
const tabs = [
  { id: "car", icon: Car, label: "visit.tab.car", body: "visit.tab.carBody" },
  { id: "taxi", icon: Bus, label: "visit.tab.taxi", body: "visit.tab.taxiBody" },
  { id: "cycling", icon: Bike, label: "visit.tab.cycling", body: "visit.tab.cyclingBody" },
  { id: "transit", icon: TrainFront, label: "visit.tab.transit", body: "visit.tab.transitBody" },
] as const;

export function Directions() {
  const { t } = useI18n();
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("car");
  const current = tabs.find((x) => x.id === active) ?? tabs[0];
  return (
    <div className="space-y-8">
      <div className="surface p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-xl font-bold uppercase">{t("visit.dir.title")}</h3>
          <DemoTag label={t("demo.placeholder")} />
        </div>
        <ol className="mt-4 space-y-3">
          {steps.map((k, i) => (
            <li key={k} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-graphite-600 text-xs text-silver">{i + 1}</span>
              <span className="pt-0.5 text-bone/90">{t(k)}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-silver-dim">{t("visit.dir.note")}</p>
      </div>

      <div>
        <div role="tablist" aria-label={t("visit.tab.label")} className="flex gap-2 overflow-x-auto">
          {tabs.map((x) => {
            const on = x.id === active;
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={on}
                aria-controls="tabpanel-transport"
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(x.id)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  const i = tabs.findIndex((y) => y.id === active);
                  const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
                  setActive(n.id);
                  document.getElementById(`tab-${n.id}`)?.focus();
                }}
                className={cn("inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-md border px-4 text-sm", on ? "border-bone bg-bone text-ink" : "border-graphite-600 text-silver hover:text-bone")}
              >
                <x.icon className="h-4 w-4" aria-hidden />
                {t(x.label)}
              </button>
            );
          })}
        </div>
        <div role="tabpanel" id="tabpanel-transport" aria-labelledby={`tab-${current.id}`} className="surface mt-3 p-5 text-sm leading-relaxed text-silver">
          {t(current.body)}
        </div>
      </div>
    </div>
  );
}
