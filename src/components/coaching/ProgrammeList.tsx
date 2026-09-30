"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { useHydrated, useProgrammes } from "@/lib/store";
import { daysFromToday } from "@/lib/dates";
import type { Level } from "@/types";
import { EmptyState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProgrammeCard } from "./ProgrammeCard";

type Filter = "all" | Level;
const filters: Filter[] = ["all", "beginner", "intermediate", "advanced"];

export function ProgrammeList({ initialLevel }: { initialLevel: Filter }) {
  const { t } = useI18n();
  const [programmes] = useProgrammes();
  const hydrated = useHydrated();
  const [filter, setFilter] = useState<Filter>(initialLevel);
  const visible = filter === "all" ? programmes : programmes.filter((p) => p.level === filter || p.level === "all");

  return (
    <div className="space-y-6">
      <div role="group" aria-label={t("coaching.filter.label")} className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn("min-h-11 rounded-full border px-5 text-sm font-medium transition-colors", filter === f ? "border-bone bg-bone text-ink" : "border-graphite-600 text-silver hover:bg-graphite-800 hover:text-bone")}
          >
            {f === "all" ? t("label.all") : t(`level.${f}`)}
          </button>
        ))}
      </div>
      {filter !== "all" && <p className="text-xs text-silver-dim">{t("coaching.filter.allLevelsNote")}</p>}
      {visible.length === 0 ? (
        <EmptyState
          title={t("coaching.filter.empty")}
          body={t("coaching.filter.emptyBody")}
          action={
            <Button variant="secondary" onClick={() => setFilter("all")}>
              {t("btn.clear")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <ProgrammeCard key={p.id} programme={p} nextDate={hydrated ? daysFromToday(p.nextSessionOffsetDays) : null} />
          ))}
        </div>
      )}
    </div>
  );
}
