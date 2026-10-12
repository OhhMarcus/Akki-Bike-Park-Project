"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminShell";
import { Chip, SourceTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/ui/table";
import { lessonList } from "@/content/catalogue";
import type { MessageKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/provider";
import { useBookings, useNowHK, useRiders } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { RiderSheet } from "./RiderSheet";
import { riderRows, type RiderRow } from "./riderStats";

type FilterKey = "packs" | "club" | "fresh";
const FILTERS: { key: FilterKey; label: MessageKey; test: (r: RiderRow) => boolean }[] = [
  { key: "packs", label: "adminInsights.riders.filter.packs", test: (r) => r.packsLeft.foundation + r.packsLeft.advanced > 0 },
  { key: "club", label: "adminInsights.riders.filter.club", test: (r) => !!r.rider.clubMember },
  { key: "fresh", label: "adminInsights.riders.filter.new", test: (r) => r.isNew },
];
const NO_FILTERS: Record<FilterKey, boolean> = { packs: false, club: false, fresh: false };

const digits = (s: string) => s.replace(/\D/g, "");

export function RidersScreen() {
  const { t, tn, fmt } = useI18n();
  const now = useNowHK(60_000);
  const [riders] = useRiders();
  const [bookings] = useBookings();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [openId, setOpenId] = useState<string | null>(null);

  // deep links from other admin screens: ?q=<name or phone>, ?rider=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const id = params.get("rider");
    if (q) setQuery(q);
    if (id) setOpenId(id);
  }, []);

  const rows = useMemo(() => (now ? riderRows(riders, bookings, now) : []), [riders, bookings, now]);
  const q = query.trim().toLowerCase();
  const qDigits = digits(q);
  const shown = rows.filter(
    (r) =>
      FILTERS.every((f) => !filters[f.key] || f.test(r)) &&
      (!q || r.rider.name.toLowerCase().includes(q) || (qDigits.length >= 2 && digits(r.rider.phone).includes(qDigits))),
  );
  const filtering = !!q || Object.values(filters).some(Boolean);
  const clear = () => {
    setQuery("");
    setFilters(NO_FILTERS);
  };
  const openRow = openId ? rows.find((r) => r.rider.id === openId) : undefined;
  const dash = <span className="text-muted">{t("adminInsights.dash")}</span>;

  const columns: Column<RiderRow>[] = [
    {
      key: "name",
      header: t("adminInsights.col.name"),
      sort: (r) => r.rider.name.toLowerCase(),
      cell: (r) => (
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenId(r.rider.id);
            }}
            aria-label={t("adminInsights.riders.open", { name: r.rider.name })}
            className="inline-flex min-h-8 items-center whitespace-nowrap rounded text-left font-semibold text-fg underline-offset-4 hover:underline"
          >
            {r.rider.name}
          </button>
          {r.isNew && <Chip tone="sky">{t("adminInsights.riders.newChip")}</Chip>}
        </span>
      ),
    },
    {
      key: "phone",
      header: t("adminInsights.col.phone"),
      cell: (r) => <span className="whitespace-nowrap tabular text-fg/90">{r.rider.phone}</span>,
    },
    {
      key: "visits",
      header: t("adminInsights.col.visits"),
      sort: (r) => r.visits,
      className: "text-right",
      cell: (r) => <span className="tabular">{r.visits}</span>,
    },
    {
      key: "lastVisit",
      header: t("adminInsights.col.lastVisit"),
      sort: (r) => r.lastVisit ?? "",
      cell: (r) => (r.lastVisit ? <span className="whitespace-nowrap tabular">{fmt.date(r.lastVisit)}</span> : dash),
    },
    {
      key: "upcoming",
      header: t("adminInsights.col.upcoming"),
      sort: (r) => r.upcoming.length,
      className: "text-right",
      cell: (r) => (r.upcoming.length ? <span className="tabular">{r.upcoming.length}</span> : dash),
    },
    {
      key: "packs",
      header: t("adminInsights.col.packs"),
      sort: (r) => r.packsLeft.foundation + r.packsLeft.advanced,
      cell: (r) => {
        const held = lessonList.filter((lesson) => r.packsLeft[lesson.id] > 0);
        return held.length ? (
          <span className="flex gap-1 whitespace-nowrap">
            {held.map((lesson) => (
              <Chip key={lesson.id} tone="sky" className="whitespace-nowrap">
                {t("adminInsights.riders.packChip", { lesson: t(`adminInsights.lessonShort.${lesson.id}`), n: r.packsLeft[lesson.id] })}
              </Chip>
            ))}
          </span>
        ) : (
          dash
        );
      },
    },
    {
      key: "club",
      header: t("adminInsights.col.club"),
      sort: (r) => (r.rider.clubMember ? 1 : 0),
      cell: (r) => (r.rider.clubMember ? <Chip tone="purple" className="whitespace-nowrap">{t("adminInsights.riders.member")}</Chip> : dash),
    },
    {
      key: "sources",
      header: t("adminInsights.col.sources"),
      cell: (r) =>
        r.sources.length ? (
          <span className="flex gap-1 whitespace-nowrap">
            {r.sources.map((s) => (
              <SourceTag key={s} source={s} />
            ))}
          </span>
        ) : (
          dash
        ),
    },
  ];

  return (
    <>
      <AdminPageHeader title={t("adminInsights.riders.title")} lead={t("adminInsights.riders.lead")} />

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="rider-search" className="sr-only">
            {t("adminInsights.riders.searchLabel")}
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            id="rider-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("adminInsights.riders.searchPlaceholder")}
            autoComplete="off"
            className="pl-9"
          />
        </div>
        <div role="group" aria-label={t("adminInsights.riders.filtersLabel")} className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const on = filters[f.key];
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => setFilters((cur) => ({ ...cur, [f.key]: !cur[f.key] }))}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 text-sm font-semibold transition-colors",
                  on ? "border-fg bg-fg text-ink" : "border-line bg-card text-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                {t(f.label)}
              </button>
            );
          })}
        </div>
      </div>

      {now ? (
        <>
          <div className="mb-3 flex min-h-9 items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              {filtering
                ? t("adminInsights.riders.countOf", { shown: shown.length, total: rows.length })
                : tn("adminInsights.riders.count", rows.length)}
            </p>
            {filtering && (
              <Button variant="ghost" size="sm" font="sans" onClick={clear}>
                {t("adminInsights.riders.clear")}
              </Button>
            )}
          </div>
          <DataTable
            rows={shown}
            columns={columns}
            rowKey={(r) => r.rider.id}
            onRowClick={(r) => setOpenId(r.rider.id)}
            caption={t("adminInsights.riders.caption")}
            initialSort={{ key: "lastVisit", dir: "desc" }}
            empty={
              rows.length
                ? {
                    title: t("adminInsights.riders.noMatchTitle"),
                    body: t("adminInsights.riders.noMatchBody"),
                    action: (
                      <Button variant="secondary" size="sm" font="sans" onClick={clear}>
                        {t("adminInsights.riders.clear")}
                      </Button>
                    ),
                  }
                : { title: t("adminInsights.riders.emptyTitle"), body: t("adminInsights.riders.emptyBody") }
            }
          />
        </>
      ) : (
        <div aria-hidden className="surface overflow-hidden">
          <Skeleton className="h-10 rounded-none" />
          <div className="space-y-3 p-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-7" />
            ))}
          </div>
        </div>
      )}

      <RiderSheet row={openRow} now={now} onClose={() => setOpenId(null)} />
    </>
  );
}
