"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/States";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Provide to make the column sortable */
  sortValue?: (row: T) => string | number;
  className?: string;
};

type Sort = { key: string; dir: "asc" | "desc" };

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Accessible table name */
  caption: string;
  /** Provide to enable the search box */
  searchText?: (row: T) => string;
  pageSize?: number;
  defaultSort?: Sort;
  /** Row actions rendered in the last column */
  actions?: (row: T) => ReactNode;
  /** Filters / buttons rendered beside the search box */
  toolbar?: ReactNode;
  /** Shown when `rows` is empty (before filtering) */
  empty?: ReactNode;
  rowClassName?: (row: T) => string | undefined;
};

/**
 * Generic admin table: search, sortable columns, pagination, empty state and row actions.
 * On narrow screens the table scrolls horizontally inside its own container only.
 */
export function AdminDataTable<T>({ rows, columns, rowKey, caption, searchText, pageSize = 10, defaultSort, actions, toolbar, empty, rowClassName }: Props<T>) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort | undefined>(defaultSort);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : rows;
  }, [rows, query, searchText]);

  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key);
    if (!sort || !col?.sortValue) return filtered;
    const get = col.sortValue;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
      return String(x).localeCompare(String(y)) * dir;
    });
  }, [filtered, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : undefined) : { key, dir: "asc" }));
  };

  return (
    <div className="space-y-3">
      {(searchText || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {searchText && (
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-silver-dim" aria-hidden />
              <Input type="search" aria-label={`${t("btn.search")}: ${caption}`} placeholder={t("admin.table.search")} value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} className="pl-9" />
            </div>
          )}
          {toolbar}
        </div>
      )}

      {rows.length === 0 ? (
        (empty ?? <EmptyState />)
      ) : (
        <>
          <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto rounded-lg border border-graphite-700 bg-graphite-900">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">{caption}</caption>
              <thead>
                <tr className="border-b border-graphite-700 text-xs uppercase tracking-wider text-silver-dim">
                  {columns.map((c) => {
                    const active = sort?.key === c.key;
                    return (
                      <th key={c.key} scope="col" aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : c.sortValue ? "none" : undefined} className={cn("px-3 py-2 font-semibold", c.className)}>
                        {c.sortValue ? (
                          <button type="button" onClick={() => toggleSort(c.key)} aria-label={t("admin.table.sortBy", { col: c.header })} className="inline-flex min-h-11 items-center gap-1 uppercase tracking-wider hover:text-bone">
                            {c.header}
                            {active ? sort?.dir === "asc" ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden /> : <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />}
                          </button>
                        ) : (
                          c.header
                        )}
                      </th>
                    );
                  })}
                  {actions && (
                    <th scope="col" className="px-3 py-2 text-right font-semibold">
                      {t("admin.table.actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={rowKey(r)} className={cn("border-b border-graphite-800 align-middle last:border-0 hover:bg-graphite-800/40", rowClassName?.(r))}>
                    {columns.map((c) => (
                      <td key={c.key} className={cn("px-3 py-2", c.className)}>
                        {c.cell(r)}
                      </td>
                    ))}
                    {actions && <td className="px-3 py-2 text-right"><div className="flex justify-end gap-1">{actions(r)}</div></td>}
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)} className="px-3 py-8 text-center text-silver">
                      {t("label.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-silver">
            <p aria-live="polite">{sorted.length === 0 ? "0" : t("admin.table.range", { from: current * pageSize + 1, to: Math.min(sorted.length, (current + 1) * pageSize), n: sorted.length })}</p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <Button variant="secondary" size="icon" aria-label={t("admin.table.prev")} disabled={current === 0} onClick={() => setPage(current - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 tabular-nums">{current + 1} / {pages}</span>
                <Button variant="secondary" size="icon" aria-label={t("admin.table.next")} disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
