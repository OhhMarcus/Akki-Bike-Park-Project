"use client";

import { useI18n } from "@/i18n/provider";
import { Badge } from "@/components/ui/badge";
import { Section } from "./Section";
import { frictions } from "./content";

export function FrictionSection() {
  const { t, l } = useI18n();
  return (
    <Section id="friction" eyebrow={t("proposal.friction.eyebrow")} title={t("proposal.friction.title")} body={t("proposal.friction.body")}>
      <ul className="grid gap-px overflow-hidden rounded-lg border border-graphite-700 bg-graphite-700 sm:grid-cols-2 lg:grid-cols-3">
        {frictions.map((f) => (
          <li key={f.title.en} className="bg-graphite-900 p-5 md:p-6 print:break-inside-avoid">
            <f.icon className="h-5 w-5 text-silver" aria-hidden />
            <h3 className="mt-4 font-display text-xl font-bold uppercase">{l(f.title)}</h3>
            <p className="mt-2 text-sm text-silver">{l(f.body)}</p>
            <Badge className="mt-4">{t("proposal.friction.validate")}</Badge>
          </li>
        ))}
      </ul>
    </Section>
  );
}
