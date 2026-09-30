"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { buttonVariants } from "@/components/ui/button";

export function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="container section-pad" aria-label={t("home.cta.title")}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
        <div className="space-y-6">
          <h2 className="h-display text-5xl md:text-7xl">{t("home.cta.title")}</h2>
          <p className="max-w-md text-lg text-silver">{t("home.cta.body")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/booking" className={buttonVariants({ size: "lg" })}>
              {t("cta.bookRide")}
            </Link>
            <WhatsAppButton size="lg" />
          </div>
        </div>
        <div className="surface space-y-3 p-6">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-silver" aria-hidden />
            <h3 className="font-display text-xl font-bold uppercase">{t("home.cta.offerTitle")}</h3>
            <DemoTag />
          </div>
          <p>{t("home.cta.offerBody")}</p>
          <p className="text-sm text-silver">{t("home.cta.referral")}</p>
        </div>
      </div>
    </section>
  );
}
