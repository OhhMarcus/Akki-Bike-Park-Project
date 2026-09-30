"use client";

import { useI18n } from "@/i18n/provider";
import type { Level } from "@/types";
import { cn } from "@/lib/utils";

const dot: Record<Level, string> = { beginner: "bg-trail-green", intermediate: "bg-trail-blue", advanced: "bg-trail-black" };
const shape: Record<Level, string> = { beginner: "rounded-full", intermediate: "rounded-[2px]", advanced: "rotate-45 rounded-[1px]" };

/** Colour AND shape encode difficulty (accessible without colour vision). */
export function DifficultyBadge({ level, className }: { level: Level | "all"; className?: string }) {
  const { t } = useI18n();
  if (level === "all") {
    return <span className={cn("inline-flex items-center gap-2 text-xs font-medium text-silver", className)}>{t("level.all")}</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-graphite-600 px-2.5 py-0.5 text-xs font-medium", className)}>
      <span aria-hidden className={cn("h-2.5 w-2.5", dot[level], shape[level])} />
      {t(`level.${level}`)}
    </span>
  );
}
