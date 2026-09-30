"use client";

import { Bike, CalendarDays, Languages, Mountain, Route, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { MessageKey } from "@/i18n/dictionary";

const items = [
  { key: "progression", icon: Route },
  { key: "coaching", icon: Languages },
  { key: "trails", icon: Mountain },
  { key: "events", icon: CalendarDays },
  { key: "rental", icon: Bike },
  { key: "safety", icon: ShieldCheck },
] as const;

export function ExperienceHighlights() {
  const { t } = useI18n();
  return (
    <section className="border-y border-graphite-800 bg-graphite-950" aria-label={t("home.hl.title")}>
      <div className="container section-pad">
        <SectionHeading eyebrow={t("home.hl.eyebrow")} title={t("home.hl.title")} />
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ key, icon: Icon }, i) => (
            <li key={key}>
              <Reveal delay={i * 0.04} className="space-y-3">
                <Icon className="h-6 w-6 text-silver" aria-hidden />
                <h3 className="font-display text-xl font-bold uppercase">{t(`home.hl.${key}.title` as MessageKey)}</h3>
                <p className="text-silver">{t(`home.hl.${key}.body` as MessageKey)}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
