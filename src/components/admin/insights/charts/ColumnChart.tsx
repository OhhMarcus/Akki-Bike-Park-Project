"use client";

import { useId, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { ChartTip } from "./ChartCard";
import { columnPath, viz } from "./palette";
import { useWidth } from "./useWidth";

export type ColumnPoint = {
  key: string;
  /** x-axis label; leave out for no tick label */
  axis?: string;
  /** shorter label used when columns get narrow */
  axisShort?: string;
  /** emphasised axis label (today) */
  strong?: boolean;
  /** day still to come: the current series is drawn lighter */
  upcoming?: boolean;
};

export type ColumnSeries = {
  key: string;
  color: string;
  /** null = nothing to show (no open sessions that day) */
  values: (number | null)[];
  /** per point: true when null because every session was blocked (red hatch stub) */
  closed?: boolean[];
  /** the period being reported (upcoming days are drawn lighter) */
  current?: boolean;
  /** direct value labels on the caps */
  labels?: "all" | "max";
};

export type ColumnTip = {
  title: string;
  rows: { key: string; color?: string; light?: boolean; value: string; label?: string; detail?: string }[];
  foot?: string;
};

const TIP_W = 184;
const M = { top: 20, right: 4, bottom: 26 };

/**
 * Responsive SVG column chart (one series, or a group per point).
 * Thin columns (≤ 24px), 4px rounded data ends, hairline grid, selective
 * direct labels. Hover or arrow keys show a readout, which is also announced.
 */
export function ColumnChart({
  label, points, series, max, ticks, formatTick, formatValue, tip, describe, defaultIndex, height = 168,
}: {
  label: string;
  points: ColumnPoint[];
  series: ColumnSeries[];
  max: number;
  ticks: number[];
  formatTick: (v: number) => string;
  formatValue: (v: number) => string;
  tip: (i: number) => ColumnTip;
  describe: (i: number) => string;
  defaultIndex?: number;
  height?: number;
}) {
  const { t } = useI18n();
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const hatchId = `hatch-${useId().replace(/[^\w-]/g, "")}`;

  const n = points.length;
  const tickText = ticks.map(formatTick);
  const left = Math.max(24, Math.ceil(Math.max(...tickText.map((s) => s.length)) * 7.2) + 12);
  const plotW = Math.max(0, width - left - M.right);
  const band = n ? plotW / n : 0;
  const ns = series.length;
  const groupW = Math.min(band * (ns > 1 ? 0.72 : 0.6), ns * 24 + (ns - 1) * 2);
  const barW = Math.max(1, (groupW - (ns - 1) * 2) / ns);
  const base = M.top + height;
  const y = (v: number) => base - (Math.min(v, max) / max) * height;
  const total = M.top + height + M.bottom;
  const cx = (i: number) => left + band * (i + 0.5);
  const barX = (i: number, s: number) => left + band * i + (band - groupW) / 2 + s * (barW + 2);

  const move = (i: number) => setActive(Math.max(0, Math.min(n - 1, i)));
  const onKey = (e: React.KeyboardEvent) => {
    const cur = active ?? defaultIndex ?? n - 1;
    const keys: Record<string, number> = { ArrowRight: cur + 1, ArrowDown: cur + 1, ArrowLeft: cur - 1, ArrowUp: cur - 1, Home: 0, End: n - 1 };
    if (e.key in keys) {
      e.preventDefault();
      move(keys[e.key]);
    } else if (e.key === "Escape") setActive(null);
  };

  const tipNow = active !== null && width > 0 ? tip(active) : null;
  const tipLeft = active === null ? 0 : (() => {
    const right = cx(active) + band / 2 + 6;
    const leftSide = cx(active) - band / 2 - 6 - TIP_W;
    const x = cx(active) < width / 2 ? right : leftSide;
    return Math.max(0, Math.min(width - TIP_W, x));
  })();

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="group"
      aria-roledescription={t("adminInsights.chart.roledesc")}
      aria-label={`${label}${t("adminInsights.sep.sentence")}${t("adminInsights.chart.keys")}`}
      onKeyDown={onKey}
      onFocus={(e) => {
        if (active === null && e.currentTarget.matches(":focus-visible")) move(defaultIndex ?? n - 1);
      }}
      onBlur={() => setActive(null)}
      className="relative rounded-md"
      style={{ height: total }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={total}
          aria-hidden
          className="block select-none"
          onPointerLeave={(e) => e.pointerType !== "touch" && setActive(null)}
        >
          <defs>
            <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2.5" height="5" fill={viz.closed} fillOpacity="0.6" />
            </pattern>
          </defs>

          {/* hover band */}
          {active !== null && (
            <rect x={left + band * active + 1} y={M.top - 6} width={Math.max(0, band - 2)} height={height + 6} rx={4} fill="#FFFFFF" fillOpacity={0.045} />
          )}

          {/* grid + y ticks */}
          {ticks.map((v, i) => {
            const yy = Math.round(y(v)) + 0.5;
            return (
              <g key={v}>
                <line x1={left} x2={width - M.right} y1={yy} y2={yy} stroke={v === 0 ? viz.axis : viz.grid} strokeWidth={1} />
                <text x={left - 6} y={yy} dy="0.32em" textAnchor="end" className="tabular" fontSize={11} fill={viz.label}>
                  {tickText[i]}
                </text>
              </g>
            );
          })}

          {/* columns */}
          {series.map((s, si) => {
            const valid = s.values.filter((v): v is number => v !== null);
            const top = valid.length ? Math.max(...valid) : null;
            const topIndex = top === null ? -1 : s.values.indexOf(top);
            return (
              <g key={s.key}>
                {s.values.map((v, i) => {
                  const x = barX(i, si);
                  if (v === null) {
                    return s.closed?.[i] ? <rect key={i} x={x} y={base - 10} width={barW} height={10} fill={`url(#${hatchId})`} /> : null;
                  }
                  const yy = y(v);
                  const light = s.current && points[i].upcoming;
                  const showLabel = s.labels === "all" || (s.labels === "max" && i === topIndex && v > 0);
                  const tallest = Math.min(yy, ...series.map((o) => (o.values[i] === null ? base : y(o.values[i] as number))));
                  return (
                    <g key={i}>
                      {v > 0 &&
                        (light ? (
                          <path d={columnPath(x + 0.75, yy + 0.75, barW - 1.5, base - yy - 0.75)} fill={s.color} fillOpacity={0.28} stroke={s.color} strokeWidth={1.5} />
                        ) : (
                          <path d={columnPath(x, yy, barW, base - yy)} fill={s.color} />
                        ))}
                      {showLabel && (
                        <text x={x + barW / 2} y={tallest - 5} textAnchor="middle" fontSize={11} fontWeight={600} className="tabular" fill={viz.text}>
                          {formatValue(v)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* x labels */}
          {points.map((p, i) =>
            p.axis ? (
              <text
                key={p.key}
                x={Math.max(left + 16, Math.min(width - M.right - 16, cx(i)))}
                y={base + 17}
                textAnchor="middle"
                fontSize={11}
                fontWeight={p.strong ? 700 : 400}
                fill={p.strong ? viz.text : viz.label}
              >
                {band < 48 && p.axisShort ? p.axisShort : p.axis}
              </text>
            ) : null,
          )}

          {/* hit areas, bigger than the marks */}
          {points.map((p, i) => (
            <rect
              key={p.key}
              x={left + band * i}
              y={0}
              width={band}
              height={total}
              fill="transparent"
              onPointerEnter={(e) => e.pointerType !== "touch" && setActive(i)}
              onClick={() => setActive(i)}
            />
          ))}
        </svg>
      )}
      {tipNow && <ChartTip left={tipLeft} top={0} {...tipNow} />}
      <p className="sr-only" aria-live="polite">
        {active !== null ? describe(active) : ""}
      </p>
    </div>
  );
}
