"use client";

import Link from "next/link";
import { membershipTiers } from "@/config/pricing";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { buttonVariants } from "@/components/ui/button";
import type { MessageKey } from "@/i18n/dictionary";

export function MembershipTeaser() {
  const { t, l, money } = useI18n();
  return (
    <section className="border-y border-graphite-800 bg-graphite-950" aria-label={t("home.mem.title")}>
      <div className="container grid gap-8 py-14 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-6">
          <div className="max-w-xl space-y-3">
            <p className="eyebrow">{t("home.mem.eyebrow")}</p>
            <h2 className="h-section">{t("home.mem.title")}</h2>
            <p className="text-silver">{t("home.mem.body")}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {membershipTiers.map((tier) => (
              <li key={tier.id} className="surface space-y-1 p-4">
                <p className="text-sm font-semibold">{l(tier.name)}</p>
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-2xl font-bold">{money(tier.priceHKD)}</span>
                  <DemoTag />
                </p>
                <p className="text-xs text-silver-dim">{t(`home.mem.per.${tier.id}` as MessageKey)}</p>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/contact?topic=general" className={buttonVariants({ size: "lg" })}>
          {t("home.mem.cta")}
        </Link>
      </div>
    </section>
  );
}
