"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { useBookings, useOverrides } from "@/lib/store";
import { getDaySlots, getSlot, slotId } from "@/lib/availability";
import { addDays, hkToday, weekday } from "@/lib/dates";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { Availability, CapacityOverride, TimeSlot } from "@/types";
import { AdminPageHeader } from "./AdminPageHeader";
import { ParkStatusCard } from "./ParkStatusCard";
import { StatusBadge } from "./StatusBadge";
import { toInt } from "./helpers";
import { cn } from "@/lib/utils";

const availTone: Record<Availability, "green" | "amber" | "red" | "neutral"> = { available: "green", limited: "amber", full: "red", closed: "neutral" };

function SlotCard({ slot, overridden, onCapacity, onBlock, onReset }: { slot: TimeSlot; overridden: boolean; onCapacity: (n: number) => void; onBlock: (b: boolean) => void; onReset: () => void }) {
  const { t } = useI18n();
  const [value, setValue] = useState(String(slot.capacity));
  const [error, setError] = useState<string>();
  const blocked = slot.status === "closed";
  const pct = slot.capacity ? Math.round((slot.booked / slot.capacity) * 100) : 0;

  return (
    <div className={cn("surface space-y-3 p-4", blocked && "opacity-80")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-xl font-bold uppercase">{t(`period.${slot.period}`)}</h3>
          <p className="text-xs text-silver-dim">{slot.startTime}–{slot.endTime}</p>
        </div>
        <StatusBadge label={t(`avail.${slot.status}`)} tone={availTone[slot.status]} />
      </div>
      <div>
        <div role="meter" aria-label={t("admin.ca.filled", { pct })} aria-valuemin={0} aria-valuemax={slot.capacity} aria-valuenow={slot.booked}>
          <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-2 w-full" aria-hidden>
            <rect width="100" height="8" rx="2" className="fill-graphite-800" />
            <rect width={pct} height="8" rx="2" className={pct >= 90 ? "fill-signal" : "fill-silver"} />
          </svg>
        </div>
        <p className="mt-1.5 text-sm text-silver">{t("admin.ca.bookedOf", { booked: slot.booked, cap: slot.capacity, left: slot.remaining })}</p>
      </div>
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = toInt(value);
          if (n === null || n > 500) return setError(t("admin.err.number"));
          setError(undefined);
          onCapacity(n);
        }}
      >
        <Field label={t("admin.ev.fCapacity")} htmlFor={`cap-${slot.id}`} error={error} className="flex-1">
          <Input id={`cap-${slot.id}`} inputMode="numeric" value={value} aria-invalid={!!error} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Button type="submit" variant="secondary">{t("btn.save")}</Button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={blocked}
          onClick={() => onBlock(!blocked)}
          className="inline-flex min-h-11 items-center gap-3 text-sm"
        >
          <span aria-hidden className={cn("relative h-6 w-11 rounded-full border transition-colors", blocked ? "border-danger bg-danger/30" : "border-graphite-600 bg-graphite-800")}>
            <span className={cn("absolute top-[3px] h-[18px] w-[18px] rounded-full bg-bone transition-all", blocked ? "left-[22px]" : "left-[3px]")} />
          </span>
          {t(blocked ? "admin.ca.blocked" : "admin.ca.block")}
        </button>
        {overridden && (
          <Button variant="ghost" onClick={onReset}>
            {t("admin.ca.reset")}
          </Button>
        )}
      </div>
    </div>
  );
}

export function CapacityAdmin() {
  const { t, date } = useI18n();
  const toast = useToast();
  const [bookings] = useBookings();
  const [overrides, setOverrides] = useOverrides();
  const today = hkToday();
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today]);
  const [selected, setSelected] = useState(today);

  const upsert = (id: string, patch: Partial<CapacityOverride> | null) =>
    setOverrides((prev) => {
      const rest = prev.filter((o) => o.slotId !== id);
      if (!patch) return rest;
      const next = { ...(prev.find((o) => o.slotId === id) ?? { slotId: id }), ...patch };
      return next.capacity === undefined && !next.blocked ? rest : [...rest, next];
    });

  const slots = getDaySlots(selected, bookings, overrides);
  const allBlocked = slots.every((s) => s.status === "closed");

  return (
    <>
      <AdminPageHeader title={t("admin.ca.title")} description={t("admin.ca.sub")} />
      <ParkStatusCard />

      <section aria-labelledby="ca-days" className="mt-8">
        <h2 id="ca-days" className="font-display text-2xl font-bold uppercase">{t("admin.ca.slots")}</h2>
        <p className="mt-1 text-sm text-silver">{t("admin.ca.defaultCap", { n: siteConfig.capacityPerSession })}</p>
        <div role="group" aria-label={t("admin.ca.pickDay")} className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((d) => {
            const daySlots = getDaySlots(d, bookings, overrides);
            const open = daySlots.filter((s) => s.status !== "closed");
            const cap = open.reduce((s, x) => s + x.capacity, 0);
            const pct = cap ? Math.round((open.reduce((s, x) => s + x.booked, 0) / cap) * 100) : 0;
            const closed = open.length === 0;
            return (
              <button
                key={d}
                type="button"
                aria-pressed={selected === d}
                aria-label={`${date(d)}, ${closed ? t("avail.closed") : `${pct}%`}`}
                onClick={() => setSelected(d)}
                className={cn("flex min-h-16 flex-col items-center justify-center rounded-md border px-1 py-2 text-center transition-colors", selected === d ? "border-bone bg-graphite-800" : "border-graphite-700 hover:bg-graphite-800/60")}
              >
                <span className="text-[10px] uppercase text-silver-dim">{t(`weekday.${weekday(d)}` as "weekday.0")}</span>
                <span className="font-display text-lg font-bold leading-none">{Number(d.slice(8))}</span>
                <span className={cn("text-[10px]", closed ? "text-danger" : pct >= 90 ? "text-signal" : "text-silver")}>{closed ? "–" : `${pct}%`}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-bold uppercase">{date(selected, { weekday: "long", month: "long", day: "numeric" })}</h3>
          <Button
            variant="secondary"
            onClick={() => {
              slots.forEach((s) => upsert(s.id, { blocked: !allBlocked }));
              toast(t(allBlocked ? "admin.ca.dayUnblocked" : "admin.ca.dayBlocked"), "success");
            }}
          >
            {t(allBlocked ? "admin.ca.unblockDay" : "admin.ca.blockDay")}
          </Button>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {slots.map((s) => {
            const ov = overrides.find((o) => o.slotId === slotId(selected, s.period));
            const live = getSlot(selected, s.period, bookings, overrides);
            return (
              <SlotCard
                key={`${s.id}-${live.capacity}-${live.status}`}
                slot={live}
                overridden={!!ov}
                onCapacity={(n) => { upsert(s.id, { capacity: n }); toast(t("state.saved"), "success"); }}
                onBlock={(b) => { upsert(s.id, { blocked: b }); toast(t(b ? "admin.ca.slotBlocked" : "admin.ca.slotUnblocked"), "success"); }}
                onReset={() => { upsert(s.id, null); toast(t("admin.ca.resetDone"), "success"); }}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
