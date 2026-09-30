"use client";

import { Minus, Plus } from "lucide-react";
import { experiences } from "@/config/pricing";
import { useI18n } from "@/i18n/provider";
import { DemoTag } from "@/components/common/DemoTag";
import { Select } from "@/components/ui/input";
import { segments, segmentMsgKey, type SegmentKey } from "./segments";

export const MIN_SIZE = 2;
export const MAX_SIZE = 100;

/** Pure guidance maths shared with the proposal download. */
export function groupGuidance(segment: SegmentKey, size: number) {
  const seg = segments.find((s) => s.key === segment) ?? segments[0];
  const exp = experiences.find((e) => e.id === seg.priceExp);
  const per = exp?.priceHKD ?? 0;
  const low = per * size;
  return {
    per,
    low,
    high: Math.round((low * 1.25) / 10) * 10,
    coaches: Math.max(1, Math.ceil(size / 6)),
    min: exp?.minParticipants ?? MIN_SIZE,
    max: exp?.maxParticipants ?? MAX_SIZE,
  };
}

export function GroupSizeSelector({ segment, onSegment, size, onSize }: { segment: SegmentKey; onSegment: (s: SegmentKey) => void; size: number; onSize: (n: number) => void }) {
  const { t, money } = useI18n();
  const g = groupGuidance(segment, size);
  const set = (n: number) => onSize(Math.min(MAX_SIZE, Math.max(MIN_SIZE, n)));
  const outside = size < g.min || size > g.max;
  return (
    <div className="surface space-y-6 p-5 md:p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="gs-type" className="block text-sm font-medium">{t("groups.size.type")}</label>
          <Select id="gs-type" value={segment} onChange={(e) => onSegment(e.target.value as SegmentKey)}>
            {segments.map((s) => (
              <option key={s.key} value={s.key}>{t(segmentMsgKey(s.key))}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="gs-size" className="block text-sm font-medium">{t("groups.size.label")}</label>
          <div className="flex items-center gap-3">
            <button type="button" aria-label={t("groups.size.dec")} onClick={() => set(size - 1)} disabled={size <= MIN_SIZE} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-graphite-600 hover:bg-graphite-800 disabled:opacity-40">
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <input id="gs-size" type="range" min={MIN_SIZE} max={MAX_SIZE} value={size} onChange={(e) => set(Number(e.target.value))} aria-valuetext={t("groups.size.riders", { n: size })} className="h-11 min-w-0 flex-1 accent-[#b8bcc4]" />
            <button type="button" aria-label={t("groups.size.inc")} onClick={() => set(size + 1)} disabled={size >= MAX_SIZE} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-graphite-600 hover:bg-graphite-800 disabled:opacity-40">
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <p className="font-display text-3xl font-bold" aria-live="polite">{t("groups.size.riders", { n: size })}</p>
        </div>
      </div>

      <div className="grid gap-4 border-t border-graphite-700 pt-5 md:grid-cols-2">
        <div>
          <p className="text-sm text-silver">{t("groups.size.coaches", { n: g.coaches })}</p>
          <p className="mt-1 text-xs text-silver-dim">{t("groups.size.coachesNote")}</p>
        </div>
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm text-silver">
            {t("groups.size.estimate")} <DemoTag />
          </p>
          <p className="font-display mt-1 text-2xl font-bold" aria-live="polite">
            {money(g.low)} – {money(g.high)}
          </p>
          <p className="mt-1 text-xs text-silver-dim">{t("groups.size.estimateNote", { unit: `${money(g.per)} ${t("label.perPerson")}` })}</p>
        </div>
      </div>
      {outside && <p role="status" className="text-xs text-signal">{t("groups.size.outside", { min: g.min, max: g.max })}</p>}
    </div>
  );
}
