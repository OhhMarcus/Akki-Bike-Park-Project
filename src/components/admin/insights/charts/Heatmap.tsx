"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { ChartTip } from "./ChartCard";
import type { ColumnTip } from "./ColumnChart";
import { heatBin, viz } from "./palette";
import { useWidth } from "./useWidth";

export type HeatCell = {
  key: string;
  /** occupancy 0…1 when the track was open */
  ratio: number | null;
  /** open = has open sessions · closed = every session blocked · none = not open at that hour */
  state: "open" | "closed" | "none";
};

type Pos = { r: number; c: number };

/** Rough width of an 11px label: CJK glyphs are about one em, Latin about 0.56em. */
const textWidth = (s: string) => Array.from(s).reduce((w, ch) => w + (ch.charCodeAt(0) >= 0x2e80 ? 11 : 6.2), 0);

const HEAD_H = 26;
const ROW_H = 30;
const MIN_COL = 22;
/** room an hour label needs before every column can carry one */
const LABEL_SPACE = 62;
const TIP_W = 184;
const TIP_H = 76;

/**
 * Weekday × hour heatmap on the brand heat ramp. All hours fit on a phone;
 * on very narrow screens the grid scrolls sideways while the weekday labels
 * stay put. Hover, tap or arrow keys show the value.
 */
export function Heatmap({ label, rows, cols, tip, describe, defaultCell, labelWidth = 48 }: {
  label: string;
  rows: { key: string; label: string; cells: HeatCell[] }[];
  cols: { key: string; label: string }[];
  tip: (p: Pos) => ColumnTip;
  describe: (p: Pos) => string;
  defaultCell?: Pos;
  labelWidth?: number;
}) {
  const { t } = useI18n();
  const [outerRef, width] = useWidth<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Pos | null>(null);
  const [scrollX, setScrollX] = useState(0);
  const hatchId = `heat-hatch-${useId().replace(/[^\w-]/g, "")}`;

  const nc = cols.length;
  const avail = Math.max(0, width - labelWidth);
  const colW = nc ? Math.max(MIN_COL, avail / nc) : MIN_COL;
  const gridW = colW * nc;
  const gridH = HEAD_H + ROW_H * rows.length;
  const every = Math.max(1, Math.ceil(LABEL_SPACE / colW));
  const scrolls = gridW > avail + 1;

  // keep the active cell in view while moving with the keyboard
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !active) return;
    const x0 = active.c * colW;
    const x1 = x0 + colW;
    if (x0 < el.scrollLeft) el.scrollLeft = x0 - 8;
    else if (x1 > el.scrollLeft + el.clientWidth) el.scrollLeft = x1 - el.clientWidth + 8;
  }, [active, colW]);

  const move = (r: number, c: number) => setActive({ r: Math.max(0, Math.min(rows.length - 1, r)), c: Math.max(0, Math.min(nc - 1, c)) });
  const onKey = (e: React.KeyboardEvent) => {
    const cur = active ?? defaultCell ?? { r: 0, c: 0 };
    const next: Record<string, Pos> = {
      ArrowRight: { r: cur.r, c: cur.c + 1 },
      ArrowLeft: { r: cur.r, c: cur.c - 1 },
      ArrowDown: { r: cur.r + 1, c: cur.c },
      ArrowUp: { r: cur.r - 1, c: cur.c },
      Home: { r: cur.r, c: 0 },
      End: { r: cur.r, c: nc - 1 },
    };
    if (e.key in next) {
      e.preventDefault();
      move(next[e.key].r, next[e.key].c);
    } else if (e.key === "Escape") setActive(null);
  };

  const tipNow = active ? tip(active) : null;
  const tipPos = active
    ? {
        left: Math.max(scrollX + 2, Math.min(scrollX + avail - TIP_W - 2, active.c * colW + colW / 2 - TIP_W / 2)),
        top: active.r < 3 ? HEAD_H + (active.r + 1) * ROW_H + 4 : HEAD_H + active.r * ROW_H - TIP_H - 4,
      }
    : null;

  return (
    <div>
      <div ref={outerRef} className="relative flex">
        {/* weekday labels (do not scroll) */}
        <div aria-hidden className="shrink-0" style={{ width: labelWidth, paddingTop: HEAD_H }}>
          {rows.map((row, r) => (
            <div
              key={row.key}
              className={cn("flex items-center pr-2 text-xs", active?.r === r ? "font-semibold text-fg" : "text-muted")}
              style={{ height: ROW_H }}
            >
              {row.label}
            </div>
          ))}
        </div>

        <div
          ref={scrollRef}
          tabIndex={0}
          role="group"
          aria-roledescription={t("adminInsights.chart.roledesc")}
          aria-label={`${label}. ${t("adminInsights.chart.keys")}`}
          onKeyDown={onKey}
          onFocus={(e) => {
            if (!active && e.currentTarget.matches(":focus-visible")) move(defaultCell?.r ?? 0, defaultCell?.c ?? 0);
          }}
          onBlur={() => setActive(null)}
          onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}
          className={cn("relative min-w-0 flex-1 rounded-md", scrolls ? "overflow-x-auto" : "overflow-hidden")}
        >
          {width > 0 && (
            <div className="relative" style={{ width: gridW, height: gridH }}>
              <svg
                width={gridW}
                height={gridH}
                aria-hidden
                className="block select-none"
                onPointerLeave={(e) => e.pointerType !== "touch" && setActive(null)}
              >
                <defs>
                  <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="2.5" height="5" fill={viz.closed} fillOpacity="0.55" />
                  </pattern>
                </defs>

                {cols.map((col, c) =>
                  c % every === 0 ? (
                    <text
                      key={col.key}
                      x={Math.max(0, Math.min(c * colW + 2, gridW - textWidth(col.label) - 1))}
                      y={HEAD_H - 9}
                      fontSize={11}
                      fill={active?.c === c ? viz.text : viz.label}
                      fontWeight={active?.c === c ? 600 : 400}
                    >
                      {col.label}
                    </text>
                  ) : null,
                )}

                {rows.map((row, r) =>
                  row.cells.map((cell, c) => {
                    const x = c * colW + 1;
                    const y = HEAD_H + r * ROW_H + 1;
                    const w = colW - 2;
                    const h = ROW_H - 2;
                    const on = active?.r === r && active?.c === c;
                    return (
                      <g
                        key={cell.key}
                        onPointerEnter={(e) => e.pointerType !== "touch" && setActive({ r, c })}
                        onClick={() => setActive({ r, c })}
                      >
                        {/* hit area includes the 2px gap */}
                        <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} fill="transparent" />
                        {cell.state === "open" && cell.ratio !== null && (
                          <rect x={x} y={y} width={w} height={h} rx={3} fill={viz.heat[heatBin(cell.ratio)]} />
                        )}
                        {cell.state === "closed" && (
                          <rect x={x} y={y} width={w} height={h} rx={3} fill={`url(#${hatchId})`} stroke={viz.closed} strokeOpacity={0.5} />
                        )}
                        {cell.state === "none" && <circle cx={x + w / 2} cy={y + h / 2} r={1.5} fill={viz.axis} />}
                        {on && <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx={2.5} fill="none" stroke={viz.text} strokeWidth={2} />}
                      </g>
                    );
                  }),
                )}
              </svg>
              {tipNow && tipPos && <ChartTip left={tipPos.left} top={tipPos.top} {...tipNow} />}
            </div>
          )}
          <p className="sr-only" aria-live="polite">
            {active ? describe(active) : ""}
          </p>
        </div>
      </div>
      {scrolls && <p className="mt-2 text-xs text-muted">{t("adminInsights.heat.scroll")}</p>}
    </div>
  );
}

/** Binned scale legend for the heat ramp (five 20% steps). */
export function HeatLegend() {
  const { t } = useI18n();
  const stops = [0, 20, 40, 60, 80, 100];
  return (
    <span className="inline-flex items-center gap-2">
      <span>{t("adminInsights.heat.legend")}</span>
      <span aria-hidden className="inline-block">
        <span className="flex gap-0.5">
          {viz.heat.map((c) => (
            <span key={c} className="h-2.5 w-8 first:rounded-l-sm last:rounded-r-sm" style={{ background: c }} />
          ))}
        </span>
        <span className="relative mt-1 block h-3 w-[168px] text-[10px] leading-none tabular">
          {stops.map((s, i) => (
            <span
              key={s}
              className="absolute top-0"
              style={{ left: `${(i / 5) * 100}%`, transform: i === 0 ? "none" : i === 5 ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {s}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
