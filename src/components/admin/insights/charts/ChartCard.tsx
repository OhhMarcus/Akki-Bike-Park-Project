"use client";

import { useState } from "react";
import { Table2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * A chart's frame: title, subtitle, legend, the chart, an optional footnote and
 * the "Show table" toggle (every chart has a table twin with the same values).
 */
export function ChartCard({
  id, title, sub, badge, legend, note, table, children, className,
}: {
  id: string;
  title: string;
  sub?: React.ReactNode;
  badge?: React.ReactNode;
  legend?: React.ReactNode;
  note?: React.ReactNode;
  table?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  const [showTable, setShowTable] = useState(false);
  return (
    <section aria-labelledby={`${id}-title`} className={cn("surface flex min-w-0 flex-col p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="flex flex-wrap items-center gap-2 text-[15px] font-semibold leading-snug">
            {title}
            {badge}
          </h2>
          {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
        </div>
        {legend && <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">{legend}</div>}
      </div>
      <div className="mt-4 min-w-0 flex-1">{children}</div>
      {(note || table) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
          {note ? <div className="text-xs text-muted">{note}</div> : <span />}
          {table && (
            <button
              type="button"
              aria-expanded={showTable}
              aria-controls={`${id}-table`}
              onClick={() => setShowTable((s) => !s)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-muted hover:bg-white/5 hover:text-fg"
            >
              <Table2 className="h-3.5 w-3.5" aria-hidden />
              {showTable ? t("adminInsights.chart.hideTable") : t("adminInsights.chart.showTable")}
            </button>
          )}
        </div>
      )}
      {table && showTable && (
        <div id={`${id}-table`} className="mt-3 overflow-x-auto">
          {table}
        </div>
      )}
    </section>
  );
}

type Swatch = "bar" | "barLight" | "line" | "dot" | "hatch";

/** Legend key. The swatch mirrors the mark; the text stays in text colours. */
export function LegendItem({ swatch, color, children }: { swatch: Swatch; color?: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch === "bar" && <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />}
      {swatch === "barLight" && color && (
        <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: `${color}47`, boxShadow: `inset 0 0 0 1.5px ${color}` }} />
      )}
      {swatch === "line" && <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: color }} />}
      {swatch === "dot" && <span aria-hidden className="grid h-2.5 w-2.5 place-items-center"><span className="h-1 w-1 rounded-full bg-line-strong" /></span>}
      {swatch === "hatch" && <span aria-hidden className="hatch-closed h-2.5 w-2.5 rounded-sm border border-state-closed/60" />}
      {children}
    </span>
  );
}

/** Floating readout used by the SVG charts (hover and keyboard focus). */
export function ChartTip({ left, top, title, rows, foot }: {
  left: number;
  top: number;
  title: string;
  rows: { key: string; color?: string; light?: boolean; value: string; label?: string; detail?: string }[];
  foot?: string;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-10 w-[184px] rounded-md border border-line-strong bg-card-2 px-3 py-2 text-xs shadow-lift"
      style={{ left, top }}
    >
      <p className="mb-1 font-semibold text-fg">{title}</p>
      <div className="space-y-1">
        {rows.map((r) => (
          <p key={r.key} className="flex items-start gap-2">
            {r.color && <span className={cn("mt-[7px] h-0.5 w-3 shrink-0 rounded-full", r.light && "opacity-50")} style={{ background: r.color }} />}
            <span className="min-w-0">
              <span className="font-semibold tabular text-fg">{r.value}</span>
              {r.label && <span className="ml-1.5 text-muted">{r.label}</span>}
              {r.detail && <span className="block text-[11px] text-muted">{r.detail}</span>}
            </span>
          </p>
        ))}
      </div>
      {foot && <p className="mt-1 text-muted">{foot}</p>}
    </div>
  );
}

/** Compact data table used as each chart's table view. */
export function DataTableView({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full min-w-[280px] border-collapse text-xs">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-line text-left text-muted">
          {head.map((h, i) => (
            <th key={h} scope="col" className={cn("whitespace-nowrap px-2 py-1.5 font-semibold", i > 0 && "text-right")}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={String(r[0])} className="border-b border-line/60 last:border-0">
            {r.map((c, i) =>
              i === 0 ? (
                <th key={i} scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-fg">
                  {c}
                </th>
              ) : (
                <td key={i} className="whitespace-nowrap px-2 py-1.5 text-right tabular text-fg/90">
                  {c}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
