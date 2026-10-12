"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** enables sorting on this column */
  sort?: (row: T) => string | number;
  className?: string;
  /** hide below a breakpoint, e.g. "hidden md:table-cell" */
  responsive?: string;
};

/**
 * Admin table: sortable headers, pagination, row click, horizontal scroll on
 * small screens (scroll stays inside the table container).
 */
export function DataTable<T>({
  rows, columns, rowKey, onRowClick, pageSize = 20, empty, initialSort, caption, rowClassName,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  empty?: { title: string; body?: string; action?: React.ReactNode };
  initialSort?: { key: string; dir: "asc" | "desc" };
  caption?: string;
  rowClassName?: (row: T) => string | undefined;
}) {
  const { t } = useI18n();
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key);
    if (!col?.sort || !sort) return rows;
    const get = col.sort;
    return [...rows].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, columns, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const slice = sorted.slice(current * pageSize, current * pageSize + pageSize);

  if (!rows.length && empty) return <EmptyState title={empty.title} body={empty.body} action={empty.action} />;

  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line bg-card-2 text-left text-xs text-muted">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th key={c.key} scope="col" className={cn("whitespace-nowrap px-3 py-2.5 font-semibold", c.responsive, c.className)} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}>
                    {c.sort ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-fg"
                        onClick={() => setSort(active ? { key: c.key, dir: sort!.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" })}
                      >
                        {c.header}
                        {active && (sort!.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("border-b border-line/70 last:border-0", onRowClick && "cursor-pointer hover:bg-white/[.03]", rowClassName?.(row))}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-3 py-2.5 align-middle", c.responsive, c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 text-xs text-muted">
          <span className="tabular">
            {current * pageSize + 1}–{Math.min(sorted.length, (current + 1) * pageSize)} / {sorted.length}
          </span>
          <div className="flex gap-1">
            <button type="button" className="grid h-8 w-8 place-items-center rounded-md hover:bg-white/5 disabled:opacity-30" onClick={() => setPage(current - 1)} disabled={current === 0} aria-label={t("btn.prevPage")}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" className="grid h-8 w-8 place-items-center rounded-md hover:bg-white/5 disabled:opacity-30" onClick={() => setPage(current + 1)} disabled={current >= pages - 1} aria-label={t("btn.nextPage")}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
