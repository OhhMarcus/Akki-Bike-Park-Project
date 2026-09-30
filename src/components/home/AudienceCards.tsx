"use client";

import Link from "next/link";
import { ArrowRight, Gauge, Sprout, Users } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { MessageKey } from "@/i18n/dictionary";

const cards: { key: "first" | "exp" | "groups"; href: string; icon: typeof Sprout }[] = [
  { key: "first", href: "/booking?exp=beginner", icon: Sprout },
  { key: "exp", href: "/coaching", icon: Gauge },
  { key: "groups", href: "/groups", icon: Users },
];

export function AudienceCards() {
  const { t } = useI18n();
  return (
    <section className="container section-pad" aria-label={t("home.aud.title")}>
      <SectionHeading eyebrow={t("home.aud.eyebrow")} title={t("home.aud.title")} />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {cards.map(({ key, href, icon: Icon }, i) => (
          <Reveal key={key} delay={i * 0.06} className="h-full">
            <Link href={href} className="surface group flex h-full flex-col gap-4 p-6 transition-colors hover:border-silver-dim">
              <Icon className="h-6 w-6 text-silver" aria-hidden />
              <h3 className="font-display text-2xl font-bold uppercase">{t(`home.aud.${key}.title` as MessageKey)}</h3>
              <p className="flex-1 text-silver">{t(`home.aud.${key}.body` as MessageKey)}</p>
              <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
                {t(`home.aud.${key}.cta` as MessageKey)}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
