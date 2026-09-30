"use client";

import { Target } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Section } from "./Section";
import { benefits } from "./content";

export function BenefitsSection() {
  const { t, l } = useI18n();
  return (
    <Section id="benefits" eyebrow={t("proposal.benefits.eyebrow")} title={t("proposal.benefits.title")} body={t("proposal.benefits.body")}>
      <ul className="grid gap-4 md:grid-cols-2">
        {benefits.map((b) => (
          <li key={b.title.en} className="surface flex flex-col p-5 md:p-6 print:break-inside-avoid">
            <b.icon className="h-6 w-6 text-bone" aria-hidden />
            <h3 className="mt-4 font-display text-2xl font-bold uppercase">{l(b.title)}</h3>
            <p className="mt-2 text-silver">{l(b.body)}</p>
            {b.goal && (
              <p className="mt-5 flex gap-2 border-t border-graphite-700 pt-4 text-sm">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
                <span>
                  <span className="font-semibold text-bone">{t("proposal.goal")}: </span>
                  <span className="text-silver">{l(b.goal)}</span>
                </span>
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-silver-dim">{t("proposal.baselineNote")}</p>
    </Section>
  );
}
