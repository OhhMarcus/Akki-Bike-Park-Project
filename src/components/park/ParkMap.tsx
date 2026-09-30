"use client";

import { useI18n } from "@/i18n/provider";
import { difficultyColors, type Trail } from "@/content/trails";
import { DemoTag } from "@/components/common/DemoTag";
import { CLOSED_COLOR, CLOSED_DASH, difficultyDash } from "./trailStyle";

type Props = {
  trails: Trail[];
  /** Position of each trail in the full list, so numbers stay stable while filtering */
  numbers: Record<string, number>;
  selectedId: string | null;
  parkOpen: boolean;
  onSelect: (id: string) => void;
};

const contours = [
  "M-10 330 C80 280 140 340 240 310 C340 280 420 350 610 300",
  "M-10 250 C90 200 170 260 260 235 C350 210 450 270 610 220",
  "M-10 170 C100 120 190 180 280 150 C370 120 470 180 610 130",
  "M-10 90 C90 40 190 100 290 60 C380 25 480 60 610 30",
];

function Marker({ x, y, n, closed, active }: { x: number; y: number; n: number; closed: boolean; active: boolean }) {
  return (
    <g aria-hidden pointerEvents="none">
      <circle cx={x} cy={y} r={11} fill={active ? "#e8e6e1" : "#111113"} stroke={closed ? CLOSED_COLOR : "#e8e6e1"} strokeWidth={1.5} />
      {closed ? (
        <path d={`M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}`} stroke={active ? "#111113" : "#b8bcc4"} strokeWidth={2} strokeLinecap="round" />
      ) : (
        <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={active ? "#111113" : "#e8e6e1"}>
          {n}
        </text>
      )}
    </g>
  );
}

export function ParkMap({ trails, numbers, selectedId, parkOpen, onSelect }: Props) {
  const { t, l } = useI18n();
  return (
    <figure className="surface overflow-hidden">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-graphite-700 px-4 py-3">
        <span className="text-sm font-semibold">{t("park.map.title")}</span>
        <DemoTag label={t("park.map.placeholderTag")} />
      </figcaption>
      <svg viewBox="0 0 600 380" role="group" aria-label={t("park.map.aria")} className="block h-auto w-full bg-graphite-950">
        <g fill="none" stroke="#b8bcc4" strokeOpacity={0.09} strokeWidth={1} aria-hidden>
          {contours.map((d) => (
            <path key={d} d={d} />
          ))}
          <ellipse cx={300} cy={190} rx={280} ry={160} />
          <ellipse cx={300} cy={190} rx={200} ry={110} />
          <ellipse cx={300} cy={190} rx={120} ry={60} />
        </g>
        {trails.map((tr) => {
          const closed = !tr.open || !parkOpen;
          const active = selectedId === tr.id;
          const color = closed ? CLOSED_COLOR : difficultyColors[tr.difficulty];
          const dash = closed ? CLOSED_DASH : difficultyDash[tr.difficulty];
          const status = closed ? t("status.closed") : t("status.open");
          return (
            <g
              key={tr.id}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={t("park.map.trailLabel", { name: l(tr.name), level: t(`level.${tr.difficulty}`), status })}
              className="cursor-pointer outline-none [&:focus-visible>path.ring]:stroke-bone [&:focus-visible>path.ring]:[stroke-opacity:0.7]"
              onClick={() => onSelect(tr.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(tr.id);
                }
              }}
            >
              <path className="ring" d={tr.path} fill="none" stroke="transparent" strokeWidth={active ? 14 : 12} strokeLinecap="round" />
              <path d={tr.path} fill="none" stroke="transparent" strokeWidth={26} />
              <path d={tr.path} fill="none" stroke={color} strokeWidth={active ? 6 : 3.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} opacity={active ? 1 : 0.85} />
              <Marker x={tr.label.x} y={tr.label.y} n={numbers[tr.id] ?? 0} closed={closed} active={active} />
            </g>
          );
        })}
      </svg>
      <div className="space-y-3 border-t border-graphite-700 px-4 py-3 text-xs text-silver">
        <ul className="grid grid-cols-1 gap-x-4 gap-y-2 min-[420px]:grid-cols-2">
          {(["beginner", "intermediate", "advanced"] as const).map((lv) => (
            <li key={lv} className="flex items-center gap-2">
              <svg width="30" height="8" aria-hidden>
                <line x1="2" y1="4" x2="28" y2="4" stroke={difficultyColors[lv]} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={difficultyDash[lv]} />
              </svg>
              {t(lv === "beginner" ? "park.map.legendSolid" : lv === "intermediate" ? "park.map.legendDashed" : "park.map.legendDotted")}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <svg width="30" height="8" aria-hidden>
              <line x1="2" y1="4" x2="28" y2="4" stroke={CLOSED_COLOR} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={CLOSED_DASH} />
            </svg>
            {t("park.map.legendClosed")}
          </li>
        </ul>
        <p className="text-silver-dim">{t("park.map.hint")}</p>
      </div>
    </figure>
  );
}
