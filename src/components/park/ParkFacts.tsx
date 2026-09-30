"use client";

import { Layers, Maximize2, ShieldCheck, Waves, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";

const facts: { icon: LucideIcon; value: MessageKey; label: MessageKey }[] = [
  { icon: Maximize2, value: "park.facts.size", label: "park.facts.sizeLabel" },
  { icon: Waves, value: "park.facts.pump", label: "park.facts.pumpLabel" },
  { icon: Layers, value: "park.facts.features", label: "park.facts.featuresLabel" },
  { icon: ShieldCheck, value: "park.facts.safety", label: "park.facts.safetyLabel" },
];

/** Facts sourced from AKKI's public information (see research pack). Keep wording attributed. */
export function ParkFacts() {
  const { t } = useI18n();
  return (
    <div>
      <p className="max-w-2xl text-silver">{t("park.facts.lead")}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(({ icon: Icon, value, label }) => (
          <li key={value} className="surface space-y-2 p-5">
            <Icon className="h-5 w-5 text-silver" aria-hidden />
            <p className="font-display text-2xl font-bold uppercase leading-tight">{t(value)}</p>
            <p className="text-sm text-silver">{t(label)}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-silver-dim">
        {t("park.facts.note")}{" "}
        <a href={siteConfig.officialSite} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-bone">akkigroup.co</a>
      </p>
    </div>
  );
}
