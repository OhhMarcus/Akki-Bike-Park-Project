"use client";

import { useI18n } from "@/i18n/provider";
import type { EventCategory } from "@/types";
import type { CategorySpots } from "@/lib/schedule";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CapacityBar } from "@/components/ui/capacity";
import { cn } from "@/lib/utils";
import { agesNote } from "./utils";

type Row = { category: EventCategory; spots: CategorySpots };

function Ages({ category, className }: { category: EventCategory; className: string }) {
  const { t, l } = useI18n();
  const ages = agesNote(l(category.name), l(category.ages));
  if (!ages) return null;
  return (
    <span className={className}>
      <span className="sr-only">{t("events.col.ages")}: </span>
      {ages}
    </span>
  );
}

function Meter({ spots, ended }: { spots: CategorySpots; ended: boolean }) {
  const { t } = useI18n();
  return (
    <div className="space-y-1.5">
      {!ended && <CapacityBar booked={spots.taken} capacity={spots.capacity} status={spots.status} />}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <StatusBadge status={spots.status} past={ended} />
        {!ended && <span className="text-xs text-muted tabular">{t("spots.ofLeft", { n: spots.remaining, cap: spots.capacity })}</span>}
      </div>
    </div>
  );
}

/**
 * Categories: a table from md up, stacked cards on phones. Each row can start
 * a registration with that category picked; full rows say so and are disabled.
 */
export function CategoryTable({
  rows, ended, onRegister, className,
}: {
  rows: Row[];
  ended: boolean;
  onRegister: (categoryId: string) => void;
  className?: string;
}) {
  const { t, l, fmt } = useI18n();
  const action = ({ category, spots }: Row, extra?: string) => {
    if (ended) return null;
    const full = spots.remaining <= 0;
    return (
      <Button
        variant="secondary"
        disabled={full}
        onClick={() => onRegister(category.id)}
        aria-label={`${full ? t("status.full") : t("btn.register")}: ${l(category.name)}`}
        className={extra}
      >
        {full ? t("status.full") : t("btn.register")}
      </Button>
    );
  };

  return (
    <div className={className}>
      <div className="surface hidden overflow-hidden md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{t("events.categories")}</caption>
          <thead>
            <tr className="border-b border-line bg-card-2 text-xs text-muted">
              <th scope="col" className="px-4 py-3 font-semibold">{t("label.category")}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t("label.price")}</th>
              <th scope="col" className="w-[36%] px-3 py-3 font-semibold">{t("events.col.spots")}</th>
              {!ended && (
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">{t("btn.register")}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.category.id} className={cn(r.spots.remaining <= 0 && !ended && "bg-ink/30")}>
                <th scope="row" className="px-4 py-4 align-middle font-normal">
                  <span className="block font-semibold text-fg">{l(r.category.name)}</span>
                  <Ages category={r.category} className="block text-xs text-muted" />
                </th>
                <td className="whitespace-nowrap px-3 py-4 align-middle font-display text-xl font-extrabold italic tabular [font-synthesis:none]">
                  {fmt.money(r.category.priceHKD)}
                </td>
                <td className="px-3 py-4 align-middle">
                  <Meter spots={r.spots} ended={ended} />
                </td>
                {!ended && <td className="px-4 py-4 text-right align-middle">{action(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((r) => (
          <li key={r.category.id} className="surface space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{l(r.category.name)}</p>
                <Ages category={r.category} className="block text-sm text-muted" />
              </div>
              <p className="shrink-0 font-display text-xl font-extrabold italic tabular [font-synthesis:none]">{fmt.money(r.category.priceHKD)}</p>
            </div>
            <Meter spots={r.spots} ended={ended} />
            {action(r, "w-full")}
          </li>
        ))}
      </ul>
    </div>
  );
}
