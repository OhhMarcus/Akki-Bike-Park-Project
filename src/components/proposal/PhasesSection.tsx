"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { phaseTimelines } from "@/config/proposal";
import { Badge } from "@/components/ui/badge";
import { Section } from "./Section";
import { phases } from "./content";

export function PhasesSection() {
  const { t, l } = useI18n();
  return (
    <Section id="phases" eyebrow={t("proposal.phases.eyebrow")} title={t("proposal.phases.title")} body={t("proposal.phases.body")}>
      <ol className="space-y-4">
        {phases.map((p, i) => {
          const weeks = phaseTimelines[p.id].weeks;
          return (
            <li key={p.id} className="surface grid gap-6 p-5 md:p-6 lg:grid-cols-[1fr_1.2fr_1fr] print:break-inside-avoid">
              <div>
                <p className="eyebrow">{t("proposal.phases.phase", { n: i + 1 })}</p>
                <h3 className="mt-2 font-display text-2xl font-bold uppercase">{l(p.title)}</h3>
                <Badge className="mt-4" tone={weeks === null ? "amber" : "neutral"}>
                  {t("proposal.phases.timeline")}: {weeks === null ? t("proposal.phases.weeksTbc") : t("proposal.phases.weeks", { n: weeks })}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-bone">{t("proposal.phases.deliverables")}</p>
                <ul className="mt-3 space-y-2 text-sm text-silver">
                  {p.deliverables.map((d) => (
                    <li key={d.en} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-trail-green" aria-hidden />
                      {l(d)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-bone">{t("proposal.phases.provides")}</p>
                <ul className="mt-3 space-y-2 text-sm text-silver">
                  {p.provides.map((d) => (
                    <li key={d.en} className="flex gap-2">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-silver-dim" />
                      {l(d)}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
