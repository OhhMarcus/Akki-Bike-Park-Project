"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";

export function GroupCoachingCta() {
  const { t } = useI18n();
  return (
    <div className="surface flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div className="space-y-2">
        <h2 className="h-section">{t("coaching.group.title")}</h2>
        <p className="max-w-xl text-silver">{t("coaching.group.body")}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/groups" className={buttonVariants()}>
          {t("coaching.group.cta")}
        </Link>
        <WhatsAppButton text={t("coaching.group.wa")} />
      </div>
    </div>
  );
}
