"use client";

import { useI18n } from "@/i18n/provider";
import { Section } from "./Section";
import { roadmap } from "./content";

export function RoadmapSection() {
  const { t, l } = useI18n();
  return (
    <Section id="roadmap" eyebrow={t("proposal.roadmap.eyebrow")} title={t("proposal.roadmap.title")}>
      <div className="grid gap-px overflow-hidden rounded-lg border border-graphite-700 bg-graphite-700 md:grid-cols-3">
        {roadmap.map((c) => (
          <div key={c.key} className="bg-graphite-900 p-5 md:p-6 print:break-inside-avoid">
            <h3 className="font-display text-2xl font-bold uppercase">{t(`proposal.roadmap.${c.key}`)}</h3>
            <ul className="mt-4 space-y-2 text-silver">
              {c.items.map((i) => (
                <li key={i.en} className="border-t border-graphite-700 pt-2">{l(i)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
