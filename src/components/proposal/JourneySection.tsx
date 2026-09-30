"use client";

import { useI18n } from "@/i18n/provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LocalizedText } from "@/types";
import { Section } from "./Section";
import { journeyAfter, journeyBefore, staffAfter, staffBefore } from "./content";

function Column({ title, steps, staff, staffTitle, tone }: { title: string; steps: LocalizedText[]; staff: LocalizedText[]; staffTitle: string; tone: "before" | "after" }) {
  const { l } = useI18n();
  return (
    <div className={cn("surface p-5 md:p-6 print:break-inside-avoid", tone === "after" && "border-silver/50")}>
      <h3 className="font-display text-2xl font-bold uppercase">{title}</h3>
      <ol className="mt-5">
        {steps.map((s, i) => (
          <li key={s.en} className="relative flex items-center gap-4 pb-5 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-graphite-600" />}
            <span className={cn("relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold", tone === "after" ? "border-bone bg-bone text-ink" : "border-graphite-600 bg-graphite-900 text-silver")}>{i + 1}</span>
            <span className="text-bone">{l(s)}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 border-t border-graphite-700 pt-4">
        <p className="eyebrow">{staffTitle}</p>
        <ul className="mt-3 space-y-2 text-sm text-silver">
          {staff.map((s) => (
            <li key={s.en} className="flex gap-2">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-silver-dim" />
              {l(s)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function JourneySection() {
  const { t } = useI18n();
  return (
    <Section id="journey" eyebrow={t("proposal.journey.eyebrow")} title={t("proposal.journey.title")} body={t("proposal.journey.body")}>
      <div className="mb-4">
        <Badge tone="amber">{t("proposal.illustrative")}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Column tone="before" title={t("proposal.journey.before")} steps={journeyBefore} staff={staffBefore} staffTitle={t("proposal.journey.staff")} />
        <Column tone="after" title={t("proposal.journey.after")} steps={journeyAfter} staff={staffAfter} staffTitle={t("proposal.journey.staff")} />
      </div>
    </Section>
  );
}
