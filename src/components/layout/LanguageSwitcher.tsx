"use client";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const opts = [
    { v: "en" as const, label: "EN", full: "English" },
    { v: "zh" as const, label: "繁中", full: "繁體中文" },
  ];
  return (
    <div role="group" aria-label={t("nav.language")} className={cn("inline-flex rounded-md border border-graphite-600 p-0.5", className)}>
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          lang={o.v === "zh" ? "zh-Hant" : "en"}
          aria-pressed={locale === o.v}
          aria-label={o.full}
          onClick={() => setLocale(o.v)}
          className={cn("min-h-9 min-w-11 rounded px-2.5 text-xs font-semibold transition-colors", locale === o.v ? "bg-bone text-ink" : "text-silver hover:text-bone")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
