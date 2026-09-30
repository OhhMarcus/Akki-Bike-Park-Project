"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownToLine, ChevronDown, CornerUpRight, MapPin, MoveUpRight, Repeat, Waves, type LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { Trail } from "@/content/trails";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoTag } from "@/components/common/DemoTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { cn } from "@/lib/utils";

const featureIcons: Record<Trail["features"][number], LucideIcon> = {
  rollers: Waves,
  berms: CornerUpRight,
  jumps: MoveUpRight,
  drops: ArrowDownToLine,
  pump: Repeat,
};

type Props = {
  trail: Trail;
  number: number;
  selected: boolean;
  recommended: boolean;
  parkOpen: boolean;
  onShowOnMap: (id: string) => void;
};

export function TrailCard({ trail, number, selected, recommended, parkOpen, onShowOnMap }: Props) {
  const { t, l } = useI18n();
  const [open, setOpen] = useState(false);
  const closed = !trail.open || !parkOpen;
  const panelId = `suitable-${trail.id}`;
  const levelLabel = t(`level.${trail.difficulty}`);

  return (
    <article
      id={`trail-${trail.id}`}
      aria-labelledby={`trail-title-${trail.id}`}
      className={cn("surface flex scroll-mt-24 flex-col gap-4 p-5 transition-colors", selected && "border-bone", !selected && recommended && "border-silver/60")}
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={trail.difficulty} />
          <Badge tone="neutral">{t(trail.kind === "trail" ? "park.trail.trail" : "park.trail.facility")}</Badge>
          <Badge tone={closed ? "red" : "green"}>{closed ? t("status.closed") : t("status.open")}</Badge>
          {recommended && <Badge tone="silver">{t("park.trail.recommended")}</Badge>}
        </div>
        <h3 id={`trail-title-${trail.id}`} className="font-display text-2xl font-bold uppercase leading-tight">
          <span className="mr-2 text-silver-dim">{number}</span>
          {l(trail.name)}
        </h3>
        {!parkOpen && <p className="text-sm text-signal">{t("park.map.parkClosed")}</p>}
      </header>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-silver-dim">{t("park.trail.distance")}</dt>
          <dd className="mt-1 text-silver">{l(trail.distance)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-silver-dim">{t("park.trail.rideTime")}</dt>
          <dd className="mt-1 text-silver">{l(trail.rideTime)}</dd>
        </div>
      </dl>
      <DemoTag label={t("demo.placeholder")} className="w-fit" />

      <div>
        <p className="text-xs uppercase tracking-wider text-silver-dim">{t("park.trail.skills")}</p>
        <p className="mt-1 text-sm text-silver">{trail.skills.map((s) => l(s)).join(" · ")}</p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {trail.features.map((f) => {
          const Icon = featureIcons[f];
          return (
            <li key={f}>
              <Badge tone="neutral">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {t(`park.feature.${f}`)}
              </Badge>
            </li>
          );
        })}
      </ul>

      <p className="rounded-md border border-graphite-700 bg-graphite-950 p-3 text-sm text-silver">
        <span className="font-semibold text-bone">{t("park.trail.safety")}: </span>
        {l(trail.safety)}
      </p>

      <div className="border-t border-graphite-700 pt-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-semibold"
        >
          {t("park.trail.suitableToggle")}
          <ChevronDown className={cn("h-4 w-4 text-silver transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        {open && (
          <div id={panelId} className="space-y-3 pb-1 text-sm text-silver">
            <p>{l(trail.suitable)}</p>
            <Link href={`/coaching?level=${trail.difficulty}`} className="inline-flex min-h-11 items-center text-bone underline underline-offset-4">
              {t("park.trail.coachingLink", { level: levelLabel })}
            </Link>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <Link href="/booking?exp=entry" className={cn(buttonVariants(), "flex-1")}>
          {t("park.trail.book")}
        </Link>
        <Button variant="secondary" onClick={() => onShowOnMap(trail.id)} className="flex-1">
          <MapPin className="h-4 w-4" aria-hidden />
          {t("park.map.showOnMap")}
        </Button>
      </div>
    </article>
  );
}
