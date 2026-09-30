"use client";

import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** Amber marker for demonstration/placeholder content. Hidden when NEXT_PUBLIC_SHOW_DEMO_LABELS=false. */
export function DemoTag({ className, label }: { className?: string; label?: string }) {
  const { t } = useI18n();
  if (!siteConfig.showDemoLabels) return null;
  return (
    <span className={cn("inline-flex items-center rounded border border-signal/50 bg-signal/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-signal", className)}>
      {label ?? t("demo.tag")}
    </span>
  );
}
