"use client";

import { usePrefs } from "@/lib/hooks";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Amber "SWAP" marker next to any placeholder value (prices, coach names,
 * address, hours, WhatsApp, capacity, club details). Hidden when the footer
 * toggle turns markers off.
 */
export function Swap({ className, label }: { className?: string; label?: string }) {
  const { t } = useI18n();
  const [prefs] = usePrefs();
  if (!prefs.swapMarkers) return null;
  return (
    <span
      title={t("demo.swapTitle")}
      className={cn(
        "ml-1.5 inline-flex translate-y-[-1px] items-center rounded-sm border border-dashed border-brand-amber/70 px-1 py-px align-middle font-sans text-[10px] font-bold not-italic uppercase leading-none tracking-wider text-brand-amber",
        className,
      )}
    >
      {label ?? t("demo.swap")}
    </span>
  );
}
