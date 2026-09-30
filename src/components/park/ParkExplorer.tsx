"use client";

import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { trails } from "@/content/trails";
import { useParkStatus } from "@/lib/store";
import type { Level } from "@/types";
import { EmptyState } from "@/components/common/States";
import { DemoTag } from "@/components/common/DemoTag";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ParkMap } from "./ParkMap";
import { TrailCard } from "./TrailCard";
import { helperLevel, SuitableHelper, type HelperChoice } from "./SuitableHelper";

type Filter = "all" | Level;
const filters: Filter[] = ["all", "beginner", "intermediate", "advanced"];
const numbers = Object.fromEntries(trails.map((tr, i) => [tr.id, i + 1]));

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ParkExplorer() {
  const { t, l, locale } = useI18n();
  const [status] = useParkStatus();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [choice, setChoice] = useState<HelperChoice | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const visible = filter === "all" ? trails : trails.filter((tr) => tr.difficulty === filter);
  const activeId = visible.some((tr) => tr.id === selectedId) ? selectedId : null;
  const recommendedLevel = choice ? helperLevel[choice] : null;

  const scrollTo = useCallback((el: HTMLElement | null, focus = false) => {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    if (focus) el.focus({ preventScroll: true });
  }, []);

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => scrollTo(document.getElementById(`trail-${id}`)));
  };
  const selectFromCard = (id: string) => {
    setSelectedId(id);
    scrollTo(mapRef.current);
  };

  return (
    <div className="space-y-8">
      <SuitableHelper
        choice={choice}
        onChoice={setChoice}
        onShow={(level) => {
          setFilter(level);
          setSelectedId(null);
        }}
      />

      <div role="group" aria-label={t("park.filter.label")} className="flex flex-wrap gap-2">
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

      {!status.open && (
        <div role="status" className="rounded-lg border border-signal/40 bg-signal/5 p-4 text-sm">
          <p className="font-semibold text-signal">{t("park.map.parkClosed")}</p>
          {status.note[locale] && <p className="mt-1 text-silver">{l(status.note)}</p>}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          title={t("park.filter.emptyTitle")}
          body={t("park.filter.emptyBody")}
          action={
            <Button variant="secondary" onClick={() => setFilter("all")}>
              {t("btn.clear")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
          <div ref={mapRef} className="scroll-mt-24 lg:sticky lg:top-24">
            <ParkMap trails={visible} numbers={numbers} selectedId={activeId} parkOpen={status.open} onSelect={selectFromMap} />
            <p className="mt-3 flex items-center gap-2 text-xs text-silver-dim">
              <DemoTag label={t("demo.placeholder")} />
              {t("park.placeholder.banner")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {visible.map((tr) => (
              <TrailCard
                key={tr.id}
                trail={tr}
                number={numbers[tr.id]}
                selected={activeId === tr.id}
                recommended={recommendedLevel === tr.difficulty}
                parkOpen={status.open}
                onShowOnMap={selectFromCard}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
