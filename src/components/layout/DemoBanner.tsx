"use client";

import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";

export function DemoBanner() {
  const { t } = useI18n();
  if (!siteConfig.showDemoLabels) return null;
  return <div className="border-b border-signal/30 bg-signal/10 px-4 py-1.5 text-center text-[11px] font-medium text-signal">{t("demo.banner")}</div>;
}
