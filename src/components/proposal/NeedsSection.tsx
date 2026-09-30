"use client";

import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { Section } from "./Section";
import { needs } from "./content";

export function NeedsSection() {
  const { t, l } = useI18n();
  return (
    <Section id="needs" eyebrow={t("proposal.needs.eyebrow")} title={t("proposal.needs.title")} body={t("proposal.needs.body")}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {needs.map((n) => (
          <li key={n.label.en} className="surface flex items-center gap-3 p-4 print:break-inside-avoid">
            <n.icon className="h-5 w-5 shrink-0 text-silver" aria-hidden />
            <span className="text-sm text-bone">{l(n.label)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex items-center gap-2 text-sm text-silver-dim">
        <DemoTag />
        {t("demo.banner")}
      </p>
    </Section>
  );
}
