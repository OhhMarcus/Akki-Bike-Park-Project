"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { BlockReason, HHmm, LessonId, SlotStatus } from "@/types";
import { Chip, StatusBadge } from "@/components/ui/badge";
import { CapacityBar } from "@/components/ui/capacity";
import { cn } from "@/lib/utils";

export type SlotOption = {
  id: string;
  start: HHmm;
  end: HHmm;
  title: string;
  detail?: React.ReactNode;
  capacity: number;
  booked: number;
  remaining: number;
  status: SlotStatus;
  closedReason?: BlockReason;
  lessonId?: LessonId;
  past: boolean;
  /** started but not finished: walk-ins can still join */
  running?: boolean;
  /** the slot the booking sits in now (move) */
  current?: boolean;
};

type T = ReturnType<typeof useI18n>["t"];

/** Why an option can't take `riders` more people (null = it can). `quiet` = the status badge already says it. */
function slotBlocker(o: SlotOption, riders: number, allowRunning: boolean, t: T): { text: string; tone: string; quiet?: boolean } | null {
  if (o.current) return { text: t("adminOps.move.current"), tone: "text-muted", quiet: true };
  if (o.status === "closed") return { text: o.closedReason ? t(`reason.${o.closedReason}`) : t("status.closed"), tone: "text-state-closed" };
  if (o.past && !(allowRunning && o.running)) return { text: t("adminOps.slot.started"), tone: "text-muted", quiet: !o.running };
  if (o.remaining <= 0) return { text: t("status.full"), tone: "text-state-full", quiet: true };
  if (o.remaining < riders) return { text: t("adminOps.slot.overbook", { n: o.remaining }), tone: "text-brand-amber" };
  return null;
}

/**
 * Pick-one list of pump slots / lesson sessions with live remaining places.
 * Slots that are closed, started, full or too small for the group are disabled
 * and say why, so staff can never pick an overbooking.
 */
export function SlotPicker({
  name, label, options, value, onChange, riders, allowRunning = false, className,
}: {
  name: string;
  label: string;
  options: SlotOption[];
  value: string | null;
  onChange: (id: string) => void;
  riders: number;
  allowRunning?: boolean;
  className?: string;
}) {
  const { t, fmt } = useI18n();
  if (!options.length) {
    return <p className={cn("rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted", className)}>{t("adminOps.slot.none")}</p>;
  }
  return (
    <fieldset className={className}>
      <legend className="sr-only">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const blocker = slotBlocker(o, riders, allowRunning, t);
          const selected = value === o.id;
          const walkin = allowRunning && !!o.running && !blocker;
          const descId = `${name}-${o.id}-d`;
          return (
            <label
              key={o.id}
              className={cn(
                "relative flex flex-col gap-2 rounded-lg border p-3 transition-colors has-[:focus-visible]:shadow-[0_0_0_2px_#080808,0_0_0_4px_#EBB04A]",
                blocker ? "cursor-not-allowed border-dashed border-line" : "cursor-pointer bg-card-2",
                !blocker && (selected ? "border-fg" : "border-line hover:border-line-strong"),
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.id}
                checked={selected}
                disabled={!!blocker}
                onChange={() => onChange(o.id)}
                aria-describedby={descId}
                className="sr-only"
              />
              <span className="flex items-start justify-between gap-2">
                <span className={cn("font-semibold tabular", blocker && "text-muted")}>{fmt.timeRange(o.start, o.end)}</span>
                {selected ? (
                  <span className="grid h-5 w-5 place-items-center rounded-sm bg-fg text-ink">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                ) : o.current ? (
                  <Chip>{t("adminOps.move.current")}</Chip>
                ) : o.past && o.running && !walkin && o.status !== "closed" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-sky">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-sky" />
                    {t("adminOps.onNow")}
                  </span>
                ) : (
                  <StatusBadge status={o.status} past={o.past && !walkin} />
                )}
              </span>
              <span className={cn("text-sm", blocker ? "text-muted" : "text-fg")}>
                {o.title}
                {o.detail}
              </span>
              <span id={descId} className="block space-y-1.5">
                <span className="block text-xs tabular text-muted">{t("spots.ofLeft", { n: o.remaining, cap: o.capacity })}</span>
                <CapacityBar booked={o.booked} capacity={o.capacity} status={o.status} />
                {blocker && !blocker.quiet && <span className={cn("block text-xs font-semibold", blocker.tone)}>{blocker.text}</span>}
                {walkin && <span className="block text-xs font-semibold text-brand-sky">{t("adminOps.slot.walkin")}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
