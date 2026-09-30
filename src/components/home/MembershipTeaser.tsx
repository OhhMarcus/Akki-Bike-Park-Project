"use client";

import { useI18n } from "@/i18n/provider";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";

const clubTiers = ["Blue", "Silver", "Gold", "Platinum", "Diamond"];

export function MembershipTeaser() {
  const { t } = useI18n();
  return (
    <section className="border-y border-graphite-800 bg-graphite-950" aria-label={t("home.mem.title")}>
      <div className="container grid gap-8 py-14 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-6">
          <div className="max-w-xl space-y-3">
            <p className="eyebrow">{t("home.mem.eyebrow")}</p>
            <h2 className="h-section">{t("home.mem.title")}</h2>
            <p className="text-silver">{t("home.mem.body")}</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {clubTiers.map((tier) => (
              <li key={tier} className="rounded-full border border-graphite-600 px-4 py-1.5 font-display text-lg font-bold uppercase tracking-wide">{tier}</li>
            ))}
          </ul>
        </div>
        <WhatsAppButton variant="primary" size="lg" label={t("home.mem.cta")} text={t("home.mem.cta")} />
      </div>
    </section>
  );
}
