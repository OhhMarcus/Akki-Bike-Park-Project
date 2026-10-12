"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useBookings, useEvents, useNowHK, useSettings } from "@/lib/hooks";
import { downloadFile } from "@/lib/calendar-links";
import { bookingTitle } from "@/lib/labels";
import { getState } from "@/lib/store";
import { addDays } from "@/lib/time";
import type { Booking, BookingKind, BookingSource } from "@/types";
import { AdminPageHeader } from "@/components/layout/AdminShell";
import { Chip, SourceTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { BookingSheet } from "./BookingSheet";
import { AttendanceBadge, FlagChip, PaymentBadge, lessonMeta, rentalsText } from "./shared";

const RANGES = ["today", "next7", "next28", "past7", "all"] as const;
const KINDS = ["lesson", "pump", "event"] as const satisfies readonly BookingKind[];
const SOURCES = ["website", "klook", "whatsapp", "walkin"] as const satisfies readonly BookingSource[];
const STATUSES = ["all", "active", "unpaid", "cancelled", "flagged"] as const;
type Range = (typeof RANGES)[number];
type StatusFilter = (typeof STATUSES)[number];

/** Filters other screens can preset through the URL (?q=, ?range=, ?kind=, ?source=, ?status=). */
export type BookingsQuery = { q?: string; range?: string; kind?: string; source?: string; status?: string };

const oneOf = <T extends string>(list: readonly T[], v: string | undefined): T | undefined => list.find((x) => x === v);

function bounds(range: Range, today: string): [string | null, string | null] {
  if (range === "today") return [today, today];
  if (range === "next7") return [today, addDays(today, 6)];
  if (range === "next28") return [today, addDays(today, 27)];
  if (range === "past7") return [addDays(today, -7), addDays(today, -1)];
  return [null, null];
}

/** CSV cell: quoted when needed; formula-like values are neutralised so spreadsheets show them as text. */
function csvCell(v: string | number) {
  let s = String(v);
  if (/^[=+\-@]/.test(s)) s = `\t${s}`;
  return /[",\r\n\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function FilterSelect<T extends string>({
  id, label, value, onChange, options,
}: {
  id: string; label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div className="min-w-0 space-y-1">
      <label htmlFor={id} className="text-xs font-semibold text-muted">
        {label}
      </label>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function BookingsScreen({ initial }: { initial: BookingsQuery }) {
  const { t, tn, l, fmt } = useI18n();
  const toast = useToast();
  const now = useNowHK();
  const [bookings] = useBookings();
  const [events] = useEvents();
  const [settings] = useSettings();

  // A search link (e.g. from Today or Add booking) looks across all dates and statuses.
  const searching = !!initial.q?.trim();
  const [q, setQ] = useState(initial.q ?? "");
  const [range, setRange] = useState<Range>(oneOf(RANGES, initial.range) ?? (searching ? "all" : "next7"));
  const [kind, setKind] = useState<BookingKind | "all">(oneOf(KINDS, initial.kind) ?? "all");
  const [source, setSource] = useState<BookingSource | "all">(oneOf(SOURCES, initial.source) ?? "all");
  const [status, setStatus] = useState<StatusFilter>(oneOf(STATUSES, initial.status) ?? (searching ? "all" : "active"));
  const [openId, setOpenId] = useState<string | null>(null);

  // ?q=<exact booking ref> opens that booking straight away.
  useEffect(() => {
    const ref = initial.q?.trim().toUpperCase();
    const hit = ref ? getState("bookings").find((b) => b.ref === ref) : undefined;
    if (hit) setOpenId(hit.id);
  }, [initial.q]);

  const today = now?.date;
  const rows = useMemo(() => {
    if (!today) return [];
    const [from, to] = bounds(range, today);
    const needle = q.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    const list = bookings.filter((b) => {
      if (from && b.date < from) return false;
      if (to && b.date > to) return false;
      if (kind !== "all" && b.kind !== kind) return false;
      if (source !== "all" && b.source !== source) return false;
      if (status === "active" && b.status !== "confirmed") return false;
      if (status === "unpaid" && !(b.status === "confirmed" && b.payment === "unpaid")) return false;
      if (status === "cancelled" && b.status !== "cancelled") return false;
      if (status === "flagged" && !b.flag) return false;
      if (!needle) return true;
      const hay = `${b.riderName} ${b.ref} ${b.externalRef ?? ""} ${b.phone}`.toLowerCase();
      return hay.includes(needle) || (digits.length >= 4 && b.phone.replace(/\D/g, "").includes(digits));
    });
    const dir = range === "past7" ? -1 : 1;
    return list.sort((a, b) => dir * `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`) || a.riderName.localeCompare(b.riderName));
  }, [bookings, today, range, kind, source, status, q]);

  const dirty = !!q.trim() || range !== "next7" || kind !== "all" || source !== "all" || status !== "active";
  const clear = () => {
    setQ("");
    setRange("next7");
    setKind("all");
    setSource("all");
    setStatus("active");
  };

  const title = (b: Booking) => l(bookingTitle(b, events));
  const detail = (b: Booking) => {
    const meta = lessonMeta(b, settings);
    if (meta) return t(`tlang.${meta.language}`);
    if (b.kind !== "event") return "";
    const cat = events.find((e) => e.id === b.targetId)?.categories.find((c) => c.id === b.eventCategoryId);
    return cat ? l(cat.name) : "";
  };

  const exportCsv = () => {
    const head = [
      t("label.date"), t("adminOps.csv.start"), t("adminOps.csv.end"), t("adminOps.col.ref"), t("adminOps.col.rider"), t("label.phone"),
      t("adminOps.col.what"), t("label.riders"), t("label.rentals"), t("adminOps.col.source"), t("adminOps.csv.extRef"), t("label.status"),
      t("adminOps.col.payment"), t("adminOps.col.attendance"), t("label.price"), t("label.notes"),
    ];
    const body = rows.map((b) => [
      b.date, b.start, b.end, b.ref, b.riderName, b.phone, [title(b), detail(b)].filter(Boolean).join(" · "), b.riders,
      rentalsText(b.rentals, { t, tn }) ?? "", t(`source.${b.source}`), b.externalRef ?? "",
      t(b.status === "cancelled" ? "booking.cancelled" : b.flag ? "booking.flagged" : "booking.confirmed"),
      t(`pay.${b.payment}`), b.status === "cancelled" ? "" : t(`att.${b.attendance}`), b.priceHKD, b.notes ?? "",
    ]);
    const csv = [head, ...body].map((r) => r.map(csvCell).join(",")).join("\r\n");
    downloadFile(`akki-bookings-${today ?? "export"}.csv`, `﻿${csv}`, "text/csv");
    toast(tn("adminOps.bookings.exported", rows.length));
  };

  const columns: Column<Booking>[] = [
    {
      key: "when",
      header: t("adminOps.col.when"),
      sort: (b) => `${b.date} ${b.start}`,
      className: "whitespace-nowrap",
      cell: (b) => (
        <div>
          <p className="font-medium">{today ? fmt.relDay(b.date, today) : fmt.dateWeekday(b.date)}</p>
          <p className="text-xs tabular text-muted">{fmt.timeRange(b.start, b.end)}</p>
        </div>
      ),
    },
    {
      key: "ref",
      header: t("adminOps.col.ref"),
      sort: (b) => b.ref,
      className: "whitespace-nowrap",
      cell: (b) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenId(b.id);
          }}
          className="rounded-sm font-mono text-xs font-semibold underline decoration-fg/30 underline-offset-4 hover:decoration-fg"
        >
          {b.ref}
        </button>
      ),
    },
    {
      key: "rider",
      header: t("adminOps.col.rider"),
      sort: (b) => b.riderName.toLowerCase(),
      cell: (b) => (
        <div className="min-w-[150px]">
          <p className="font-medium">{b.riderName}</p>
          <p className="whitespace-nowrap text-xs tabular text-muted">{b.phone}</p>
        </div>
      ),
    },
    {
      key: "what",
      header: t("adminOps.col.what"),
      sort: (b) => title(b),
      cell: (b) => {
        const d = detail(b);
        return (
          <div className="min-w-[170px]">
            <p>{title(b)}</p>
            {d && <p className="text-xs text-muted">{d}</p>}
            {(b.status === "cancelled" || b.flag) && (
              <p className="mt-1 flex flex-wrap gap-1">
                {b.status === "cancelled" && <Chip>{t("booking.cancelled")}</Chip>}
                {b.flag && <FlagChip />}
              </p>
            )}
          </div>
        );
      },
    },
    { key: "riders", header: t("label.riders"), sort: (b) => b.riders, className: "text-right tabular", cell: (b) => b.riders },
    {
      key: "rentals",
      header: t("label.rentals"),
      cell: (b) => {
        const r = rentalsText(b.rentals, { t, tn });
        return r ? (
          <span className="block min-w-[120px] text-xs text-muted">{r}</span>
        ) : (
          <span className="relative text-muted/60">
            –<span className="sr-only">{t("adminOps.none")}</span>
          </span>
        );
      },
    },
    {
      key: "source",
      header: t("adminOps.col.source"),
      sort: (b) => b.source,
      className: "whitespace-nowrap",
      cell: (b) => (
        <div>
          <SourceTag source={b.source} />
          {b.externalRef && <p className="mt-1 font-mono text-[11px] text-muted">{b.externalRef}</p>}
        </div>
      ),
    },
    { key: "payment", header: t("adminOps.col.payment"), sort: (b) => b.payment, className: "whitespace-nowrap", cell: (b) => <PaymentBadge payment={b.payment} /> },
    {
      key: "attendance",
      header: t("adminOps.col.attendance"),
      sort: (b) => b.attendance,
      className: "whitespace-nowrap",
      cell: (b) =>
        b.status === "cancelled" ? (
          <span className="relative text-muted/60">
            –<span className="sr-only">{t("booking.cancelled")}</span>
          </span>
        ) : (
          <AttendanceBadge attendance={b.attendance} />
        ),
    },
    { key: "price", header: t("label.price"), sort: (b) => b.priceHKD, className: "whitespace-nowrap text-right tabular", cell: (b) => fmt.money(b.priceHKD) },
  ];

  const riderSum = rows.reduce((s, b) => s + b.riders, 0);

  return (
    <>
      <AdminPageHeader
        title={t("admin.nav.bookings")}
        lead={t("adminOps.bookings.lead")}
        actions={
          <>
            <Button variant="subtle" size="sm" font="sans" onClick={exportCsv} disabled={!rows.length}>
              <Download className="h-4 w-4" aria-hidden />
              {t("adminOps.bookings.export")}
            </Button>
            <Button asChild size="sm" font="sans">
              <Link href="/admin/bookings/new">
                <Plus className="h-4 w-4" aria-hidden />
                {t("admin.nav.add")}
              </Link>
            </Button>
          </>
        }
      />

      <div role="search" className="surface mb-3 grid grid-cols-2 gap-3 p-3 md:grid-cols-4 xl:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
        <div className="col-span-2 min-w-0 space-y-1 md:col-span-4 xl:col-span-1">
          <label htmlFor="bk-q" className="text-xs font-semibold text-muted">
            {t("btn.search")}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input id="bk-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("adminOps.filter.searchPh")} className="pl-9" autoComplete="off" />
          </div>
        </div>
        <FilterSelect id="bk-range" label={t("adminOps.filter.dates")} value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r, label: t(`adminOps.range.${r}`) }))} />
        <FilterSelect
          id="bk-kind"
          label={t("adminOps.filter.kind")}
          value={kind}
          onChange={setKind}
          options={[{ value: "all" as const, label: t("adminOps.filter.allKinds") }, ...KINDS.map((k) => ({ value: k, label: t(`kind.${k}`) }))]}
        />
        <FilterSelect
          id="bk-source"
          label={t("adminOps.filter.source")}
          value={source}
          onChange={setSource}
          options={[{ value: "all" as const, label: t("adminOps.filter.allSources") }, ...SOURCES.map((s) => ({ value: s, label: t(`source.${s}`) }))]}
        />
        <FilterSelect id="bk-status" label={t("label.status")} value={status} onChange={setStatus} options={STATUSES.map((s) => ({ value: s, label: t(`adminOps.status.${s}`) }))} />
      </div>

      <div className="mb-3 flex min-h-9 flex-wrap items-center justify-between gap-2 text-sm">
        <p className="tabular text-muted" aria-live="polite">
          {today ? `${tn("adminOps.bookingCount", rows.length)} · ${tn("riders.count", riderSum)}` : " "}
        </p>
        {dirty && (
          <Button variant="ghost" size="sm" font="sans" onClick={clear}>
            <X className="h-4 w-4" aria-hidden />
            {t("adminOps.filter.clear")}
          </Button>
        )}
      </div>

      {today ? (
        <DataTable
          key={`${range}|${kind}|${source}|${status}|${q}`}
          rows={rows}
          columns={columns}
          rowKey={(b) => b.id}
          onRowClick={(b) => setOpenId(b.id)}
          rowClassName={(b) => (b.status === "cancelled" ? "opacity-60" : undefined)}
          caption={t("adminOps.bookings.caption")}
          empty={{
            title: t("adminOps.bookings.emptyTitle"),
            body: t("adminOps.bookings.emptyBody"),
            action: dirty ? (
              <Button variant="secondary" size="sm" font="sans" onClick={clear}>
                {t("adminOps.filter.clear")}
              </Button>
            ) : undefined,
          }}
        />
      ) : (
        <div className="surface space-y-2 p-3">
          <p className="sr-only" role="status">{t("state.loading")}</p>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      )}

      {now && <BookingSheet bookingId={openId} onClose={() => setOpenId(null)} now={now} />}
    </>
  );
}
