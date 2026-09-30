"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { useHydrated } from "@/lib/store";
import type { ParkEvent } from "@/types";

function diff(target: number, now: number) {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return { done: target <= now, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Live countdown. Renders only for real (non-demo) events and only after hydration. */
export function EventCountdown({ event }: { event: ParkEvent }) {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const [now, setNow] = useState<number | null>(null);
  const target = new Date(`${event.date}T${event.startTime}:00+08:00`).getTime();

  useEffect(() => {
    if (event.isDemo !== false) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [event.isDemo]);

  if (event.isDemo !== false || !hydrated || now === null) return null;
  const c = diff(target, now);
  if (c.done) return <p className="text-sm text-silver">{t("events.countdown.started")}</p>;

  const cells: [number, string][] = [
    [c.d, t("events.countdown.days")],
    [c.h, t("events.countdown.hours")],
    [c.m, t("events.countdown.minutes")],
    [c.s, t("events.countdown.seconds")],
  ];
  return (
    <div>
      <p className="eyebrow mb-2">{t("events.countdown.label")}</p>
      <div role="timer" aria-live="off" className="flex gap-2">
        {cells.map(([n, label]) => (
          <div key={label} className="min-w-14 rounded-lg border border-graphite-700 bg-graphite-950 px-3 py-2 text-center">
            <div className="font-display text-2xl font-bold tabular-nums">{String(n).padStart(2, "0")}</div>
            <div className="text-[10px] uppercase tracking-wider text-silver-dim">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
