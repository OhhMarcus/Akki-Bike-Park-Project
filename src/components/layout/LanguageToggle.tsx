"use client";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** EN / 繁 switch. Instant, no reload, remembered (cookie + localStorage). */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const opts = [
    { v: "en" as const, label: "EN", full: t("lang.en"), lang: "en" },
    { v: "zh" as const, label: "繁", full: t("lang.zh"), lang: "zh-Hant-HK" },
  ];
  return (
    <div role="group" aria-label={t("lang.label")} className={cn("inline-flex items-center rounded-lg border border-line bg-ink/60 p-0.5", className)}>
      {opts.map((o, i) => (
        <span key={o.v} className="flex items-center">
          {i > 0 && <span aria-hidden className="px-0.5 text-xs text-line-strong">/</span>}
          <button
            type="button"
            lang={o.lang}
            aria-pressed={locale === o.v}
            aria-label={o.full}
            onClick={() => setLocale(o.v)}
            className={cn(
              "min-h-9 min-w-9 rounded-md px-2 text-sm font-bold transition-colors",
              locale === o.v ? "bg-fg text-ink" : "text-muted hover:text-fg",
            )}
          >
            {o.label}
          </button>
        </span>
      ))}
    </div>
  );
}
