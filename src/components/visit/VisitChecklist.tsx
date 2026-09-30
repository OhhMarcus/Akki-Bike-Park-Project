"use client";

import { Printer, RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStored } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";

const items = [1, 2, 3, 4, 5, 6, 7] as const;
const EMPTY: number[] = [];

export function VisitChecklist() {
  const { t } = useI18n();
  const [done, setDone] = useStored<number[]>("visitChecklist", EMPTY);
  const pct = Math.round((done.length / items.length) * 100);
  const toggle = (n: number) => setDone((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  return (
    <div className="surface p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-display text-2xl font-bold uppercase">{t("visit.check.title")}</h3>
        <p className="text-sm text-silver" aria-live="polite">{t("visit.check.progress", { done: done.length, total: items.length })}</p>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t("visit.check.title")} className="mt-3 h-1.5 overflow-hidden rounded-full bg-graphite-700">
        <div className="h-full bg-trail-green transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-5 grid gap-2 md:grid-cols-2">
        {items.map((n) => (
          <li key={n}>
            <Checkbox id={`vc-${n}`} checked={done.includes(n)} onChange={() => toggle(n)} className="flex min-h-11 items-center rounded-md border border-graphite-700 px-3 py-2">
              {t(`visit.check.${n}`)}
            </Checkbox>
          </li>
        ))}
      </ul>
      <div className="no-print mt-5 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setDone([])}><RotateCcw className="h-4 w-4" aria-hidden />{t("visit.check.reset")}</Button>
        <Button variant="ghost" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden />{t("visit.check.print")}</Button>
      </div>
    </div>
  );
}
