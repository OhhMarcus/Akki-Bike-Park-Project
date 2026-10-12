"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CalendarCheck, Gauge, GraduationCap, Minus, UserX, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminShell";
import { Chip, SourceTag } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat";
import { useI18n } from "@/i18n/provider";
import { useAvailability, useBookings, useNowHK } from "@/lib/hooks";
import { fromMin, weekdayOf } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { ISODate } from "@/types";
import { BarList } from "./charts/BarList";
import { ChartCard, DataTableView, LegendItem } from "./charts/ChartCard";
import { ColumnChart, type ColumnPoint, type ColumnSeries, type ColumnTip } from "./charts/ColumnChart";
import { HeatLegend, Heatmap, type HeatCell } from "./charts/Heatmap";
import { countTicks, heatBin, pct, viz } from "./charts/palette";
import {
  KINDS, SOURCES, WEEK_ORDER, busiestTimes, confirmedByDate, dayStat, firstDataDate, lessonFill, noShowRate, occupancy,
  periodsFor, totals, type RangeKey,
} from "./metrics";

export function StatsScreen() {
  const { t } = useI18n();
  const now = useNowHK();
  const [range, setRange] = useState<RangeKey>("week");
  return (
    <>
      <AdminPageHeader
        title={t("adminInsights.stats.title")}
        lead={t("adminInsights.stats.lead")}
        actions={
          <Segmented<RangeKey>
            label={t("adminInsights.stats.rangeLabel")}
            value={range}
            onChange={setRange}
            options={[
              { value: "week", label: t("adminInsights.stats.range.week") },
              { value: "4w", label: t("adminInsights.stats.range.4w") },
            ]}
          />
        }
      />
      {now ? <StatsBody today={now.date} range={range} /> : <StatsSkeleton />}
    </>
  );
}

function StatsSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="mb-5 h-4 w-72 max-w-full" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[124px]" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[330px]" />
        <Skeleton className="h-[330px]" />
      </div>
    </div>
  );
}

type Dir = "up" | "down" | "same";

/** Change vs last week: arrow + signed text + colour (good = sky, worse = amber). */
function Delta({ cur, prev, kind, upIsGood = true }: { cur: number | null; prev: number | null; kind: "pct" | "pts"; upIsGood?: boolean }) {
  const { t } = useI18n();
  if (cur === null || prev === null) return null;
  let change: number | null;
  if (kind === "pts") change = Math.round((cur - prev) * 100);
  else change = prev === 0 ? (cur === 0 ? 0 : null) : Math.round(((cur - prev) / prev) * 100);
  if (change === null) {
    return <span className="mt-1 block text-muted">{t("adminInsights.delta.fromZero")}</span>;
  }
  const dir: Dir = change > 0 ? "up" : change < 0 ? "down" : "same";
  const icon = "mr-1 inline-block h-3.5 w-3.5 -translate-y-px align-middle";
  if (dir === "same") {
    return (
      <span className="mt-1 block text-muted">
        <Minus className={icon} aria-hidden />
        {t("adminInsights.delta.same")}
      </span>
    );
  }
  const good = (dir === "up") === upIsGood;
  const Icon = dir === "up" ? ArrowUpRight : ArrowDownRight;
  const v = `${dir === "up" ? "+" : "−"}${Math.abs(change)}`;
  return (
    <span className={cn("mt-1 block font-semibold", good ? "text-state-ok" : "text-brand-amber")}>
      <Icon className={icon} aria-hidden />
      <span className="sr-only">{t(dir === "up" ? "adminInsights.delta.up" : "adminInsights.delta.down")} </span>
      <span className="whitespace-nowrap tabular">{kind === "pts" ? t("adminInsights.delta.pts", { v }) : t("adminInsights.delta.pct", { v })}</span>{" "}
      <span className="font-normal text-muted">{t("adminInsights.delta.vsLastWeek")}</span>
    </span>
  );
}

function StatsBody({ today, range }: { today: ISODate; range: RangeKey }) {
  const { t, tn, fmt, locale } = useI18n();
  const [bookings] = useBookings();
  const avail = useAvailability(null);

  const first = useMemo(() => firstDataDate(bookings), [bookings]);
  const byDate = useMemo(() => confirmedByDate(bookings), [bookings]);
  const { cur, prev, trimmedFrom } = useMemo(() => periodsFor(range, today, first), [range, today, first]);
  const curStats = useMemo(() => cur.days.map((d) => dayStat(d, byDate, avail)), [cur, byDate, avail]);
  const prevStats = useMemo(() => (prev ? prev.days.map((d) => dayStat(d, byDate, avail)) : null), [prev, byDate, avail]);
  const T = useMemo(() => totals(curStats), [curStats]);
  const P = useMemo(() => (prevStats ? totals(prevStats) : null), [prevStats]);
  const heatDays = useMemo(() => periodsFor("4w", today, first).cur, [today, first]);
  const heat = useMemo(() => busiestTimes(heatDays.days, avail), [heatDays, avail]);

  const week = range === "week";
  const wdStyle = locale === "zh" ? "long" : "short";
  const sep = { sentence: t("adminInsights.sep.sentence"), clause: t("adminInsights.sep.clause"), label: t("adminInsights.sep.label") };
  const pctText = (r: number | null) => (r === null ? t("adminInsights.dash") : t("adminInsights.pct", { n: pct(r) }));
  const money = (n: number) => fmt.money(n, { zeroAsFree: false });
  const perWeek = (n: number) => (T.days > 0 ? n / (T.days / 7) : 0);
  const dayTitle = (d: ISODate) => (d === today ? t("adminInsights.chart.today", { date: fmt.dateWeekday(d) }) : fmt.dateWeekday(d));
  const anyUpcoming = week && cur.days.some((d) => d > today);

  /* ---------- range line ---------- */
  const spanText = t("adminInsights.stats.span", { from: fmt.dateWeekday(cur.from), to: fmt.dateWeekday(cur.to) });
  const rangeLine = [
    spanText,
    week && prev ? t("adminInsights.stats.vs", { from: fmt.dateWeekday(prev.from), to: fmt.dateWeekday(prev.to) }) : null,
    trimmedFrom ? t("adminInsights.stats.historyFrom", { date: fmt.dateShort(trimmedFrom) }) : null,
  ].filter(Boolean).join(" · ");

  /* ---------- tiles ---------- */
  const occ = occupancy(T);
  const fill = lessonFill(T);
  const ns = noShowRate(T);
  const tiles: { key: string; label: string; value: React.ReactNode; sub: React.ReactNode; icon: React.ReactNode; accent?: boolean }[] = [
    {
      key: "bookings",
      label: t("adminInsights.tile.bookings"),
      value: fmt.number(T.bookings),
      accent: true,
      icon: <CalendarCheck className="h-4 w-4 text-muted" aria-hidden />,
      sub: week ? <Delta cur={T.bookings} prev={P?.bookings ?? null} kind="pct" /> : t("adminInsights.tile.perWeek", { n: fmt.number(Math.round(perWeek(T.bookings))) }),
    },
    {
      key: "riders",
      label: t("adminInsights.tile.riders"),
      value: fmt.number(T.riders),
      icon: <Users className="h-4 w-4 text-muted" aria-hidden />,
      sub: (
        <>
          <span className="block">{tn("adminInsights.tile.customers", T.customers)}</span>
          {week ? <Delta cur={T.riders} prev={P?.riders ?? null} kind="pct" /> : <span className="mt-1 block">{t("adminInsights.tile.perWeek", { n: fmt.number(Math.round(perWeek(T.riders))) })}</span>}
        </>
      ),
    },
    {
      key: "revenue",
      label: t("adminInsights.tile.revenue"),
      value: <span className="text-[26px] sm:text-4xl">{money(T.revenue)}</span>,
      icon: <Chip tone="amber" className="whitespace-nowrap">{t("adminInsights.tile.sampleShort")}</Chip>,
      sub: (
        <>
          <span className="block">{t("adminInsights.tile.placeholderPrices")}</span>
          {week ? <Delta cur={T.revenue} prev={P?.revenue ?? null} kind="pct" /> : <span className="mt-1 block">{t("adminInsights.tile.perWeek", { n: money(Math.round(perWeek(T.revenue))) })}</span>}
        </>
      ),
    },
    {
      key: "pump",
      label: t("adminInsights.tile.pump"),
      value: pctText(occ),
      icon: <Gauge className="h-4 w-4 text-muted" aria-hidden />,
      sub: (
        <>
          <span className="block">{T.pumpCap ? t("adminInsights.tile.spots", { booked: fmt.number(T.pumpBooked), cap: fmt.number(T.pumpCap) }) : t("adminInsights.tile.noSessions")}</span>
          {week && P && <Delta cur={occ} prev={occupancy(P)} kind="pts" />}
        </>
      ),
    },
    {
      key: "lessons",
      label: t("adminInsights.tile.lessons"),
      value: pctText(fill),
      icon: <GraduationCap className="h-4 w-4 text-muted" aria-hidden />,
      sub: (
        <>
          <span className="block">{T.lessonCap ? t("adminInsights.tile.places", { booked: fmt.number(T.lessonBooked), cap: fmt.number(T.lessonCap) }) : t("adminInsights.tile.noSessions")}</span>
          {week && P && <Delta cur={fill} prev={lessonFill(P)} kind="pts" />}
        </>
      ),
    },
    {
      key: "noshow",
      label: t("adminInsights.tile.noShow"),
      value: pctText(ns),
      icon: <UserX className="h-4 w-4 text-muted" aria-hidden />,
      sub: (
        <>
          <span className="block">{ns === null ? t("adminInsights.tile.noCheckins") : t("adminInsights.tile.noShows", { n: T.noShow, m: T.attended + T.noShow })}</span>
          {week && P && <Delta cur={ns} prev={noShowRate(P)} kind="pts" upIsGood={false} />}
          {week && P && ns === null && noShowRate(P) !== null && (
            <span className="mt-1 block">{t("adminInsights.tile.lastWeekValue", { v: pctText(noShowRate(P)) })}</span>
          )}
        </>
      ),
    },
  ];

  /* ---------- per-day charts ---------- */
  const points: ColumnPoint[] = cur.days.map((d) =>
    week
      ? { key: d, axis: fmt.weekday(d, wdStyle), axisShort: fmt.weekday(d, "short"), strong: d === today, upcoming: d > today }
      : { key: d, axis: weekdayOf(d) === 1 ? fmt.dateShort(d) : undefined },
  );
  const defaultIndex = Math.max(0, cur.days.indexOf(today));
  const thisLabel = t("adminInsights.chart.thisWeek");
  const lastLabel = t("adminInsights.chart.lastWeek");
  /** series name in readouts: only needed when two series are compared */
  const curName = week ? thisLabel : undefined;

  const bookingsCur = curStats.map((s) => s.bookings);
  const bookingsPrev = week && prevStats ? prevStats.map((s) => s.bookings) : null;
  const bTicks = countTicks(Math.max(1, ...bookingsCur, ...(bookingsPrev ?? [])));
  const bookingSeries: ColumnSeries[] = [
    ...(bookingsPrev ? [{ key: "prev", color: viz.previous, values: bookingsPrev }] : []),
    { key: "cur", color: viz.primary, values: bookingsCur, current: true, labels: week ? "all" : "max" },
  ];
  const bookingTip = (i: number): ColumnTip => ({
    title: dayTitle(cur.days[i]),
    rows: [
      { key: "cur", color: viz.primary, light: points[i].upcoming, value: fmt.number(bookingsCur[i]), label: curName },
      ...(bookingsPrev ? [{ key: "prev", color: viz.previous, value: fmt.number(bookingsPrev[i]), label: lastLabel }] : []),
    ],
    foot: points[i].upcoming ? t("adminInsights.chart.upcoming") : undefined,
  });
  const describeBookings = (i: number) =>
    [
      dayTitle(cur.days[i]),
      [curName, tn("adminInsights.daily.value", bookingsCur[i])].filter(Boolean).join(sep.label),
      bookingsPrev ? [lastLabel, tn("adminInsights.daily.value", bookingsPrev[i])].join(sep.label) : null,
      points[i].upcoming ? t("adminInsights.chart.upcoming") : null,
    ].filter(Boolean).join(sep.sentence);

  const occCur = curStats.map(occupancy);
  const occPrev = week && prevStats ? prevStats.map(occupancy) : null;
  const closedCur = curStats.map((s) => s.pumpCap === 0 && s.pumpClosed > 0);
  const closedPrev = week && prevStats ? prevStats.map((s) => s.pumpCap === 0 && s.pumpClosed > 0) : null;
  const occSeries: ColumnSeries[] = [
    ...(occPrev && closedPrev ? [{ key: "prev", color: viz.previous, values: occPrev, closed: closedPrev }] : []),
    { key: "cur", color: viz.primary, values: occCur, closed: closedCur, current: true, labels: week ? "all" : "max" },
  ];
  const occValue = (r: number | null, closed: boolean) => (r !== null ? pctText(r) : closed ? t("status.closed") : t("adminInsights.chart.notOpen"));
  const occDetail = (s: { pumpBooked: number; pumpCap: number }) =>
    s.pumpCap ? t("adminInsights.occ.detail", { booked: fmt.number(s.pumpBooked), cap: fmt.number(s.pumpCap) }) : undefined;
  const occTip = (i: number): ColumnTip => ({
    title: dayTitle(cur.days[i]),
    rows: [
      { key: "cur", color: viz.primary, light: points[i].upcoming, value: occValue(occCur[i], closedCur[i]), label: curName, detail: occDetail(curStats[i]) },
      ...(occPrev && closedPrev && prevStats
        ? [{ key: "prev", color: viz.previous, value: occValue(occPrev[i], closedPrev[i]), label: lastLabel, detail: occDetail(prevStats[i]) }]
        : []),
    ],
    foot: points[i].upcoming ? t("adminInsights.chart.upcoming") : undefined,
  });
  const describeOcc = (i: number) => {
    const tip = occTip(i);
    return [tip.title, ...tip.rows.map((r) => [[r.label, r.value].filter(Boolean).join(sep.label), r.detail].filter(Boolean).join(sep.clause)), tip.foot]
      .filter(Boolean)
      .join(sep.sentence);
  };

  const dayLegend = week ? (
    <>
      <LegendItem swatch="bar" color={viz.primary}>{thisLabel}</LegendItem>
      {prev && <LegendItem swatch="bar" color={viz.previous}>{lastLabel}</LegendItem>}
      {anyUpcoming && <LegendItem swatch="barLight" color={viz.primary}>{t("adminInsights.chart.upcoming")}</LegendItem>}
    </>
  ) : null;
  const tableHead = (measure: string) => (week && prev ? [t("adminInsights.chart.day"), thisLabel, lastLabel] : [t("label.date"), measure]);
  const rowLabel = (d: ISODate) => (week ? fmt.weekday(d, "long") : fmt.dateWeekday(d));

  /* ---------- sources & revenue ---------- */
  const sourceRows = SOURCES.map((s) => ({
    key: s,
    label: <SourceTag source={s} />,
    value: T.bySource[s],
    valueText: fmt.number(T.bySource[s]),
    detail: t("adminInsights.pct", { n: T.bookings ? pct(T.bySource[s] / T.bookings) : 0 }),
  }));
  const revenueScale = Math.max(1, ...KINDS.map((k) => T.revenueByKind[k]), ...(week && P ? KINDS.map((k) => P.revenueByKind[k]) : []));
  const revenueRows = KINDS.map((k) => ({
    key: k,
    label: t(`kind.${k}`),
    value: T.revenueByKind[k],
    valueText: money(T.revenueByKind[k]),
    detail: t("adminInsights.pct", { n: T.revenue ? pct(T.revenueByKind[k] / T.revenue) : 0 }),
    prev: week && P ? { value: P.revenueByKind[k], text: money(P.revenueByKind[k]) } : undefined,
  }));

  /* ---------- busiest times ---------- */
  const heatRows = WEEK_ORDER.map((wd) => ({
    key: String(wd),
    label: fmt.weekday(wd, wdStyle),
    cells: heat.hours.map((h): HeatCell => {
      const c = heat.get(wd, h);
      if (!c || (c.open === 0 && c.closed === 0)) return { key: `${wd}:${h}`, ratio: null, state: "none" };
      if (c.open === 0) return { key: `${wd}:${h}`, ratio: null, state: "closed" };
      return { key: `${wd}:${h}`, ratio: c.den ? c.num / c.den : 0, state: "open" };
    }),
  }));
  const heatCols = heat.hours.map((h) => ({ key: String(h), label: fmt.time(fromMin(h * 60)) }));
  const heatWhen = (r: number, c: number) =>
    t("adminInsights.heat.when", { day: fmt.weekday(WEEK_ORDER[r], "long"), time: fmt.timeRange(fromMin(heat.hours[c] * 60), fromMin((heat.hours[c] + 1) * 60)) });
  const heatTip = ({ r, c }: { r: number; c: number }): ColumnTip => {
    const cell = heatRows[r].cells[c];
    const agg = heat.get(WEEK_ORDER[r], heat.hours[c]);
    if (cell.state === "none" || !agg) return { title: heatWhen(r, c), rows: [{ key: "n", value: t("adminInsights.chart.notOpen") }] };
    if (cell.state === "closed") return { title: heatWhen(r, c), rows: [{ key: "c", value: t("adminInsights.heat.closedAll") }] };
    const ratioNow = cell.ratio ?? 0;
    return {
      title: heatWhen(r, c),
      rows: [
        {
          key: "p",
          color: viz.heat[heatBin(ratioNow)],
          value: t("adminInsights.heat.full", { p: pct(ratioNow) }),
          detail: t("adminInsights.heat.avg", { n: (agg.booked / agg.open).toFixed(1), cap: Math.round(agg.capacity / agg.open) }),
        },
      ],
      foot: [tn("adminInsights.heat.sessions", agg.open), agg.closed ? t("adminInsights.heat.closedSome", { n: agg.closed }) : null].filter(Boolean).join(" · "),
    };
  };
  const describeHeat = (p: { r: number; c: number }) => {
    const tip = heatTip(p);
    return [tip.title, ...tip.rows.flatMap((r) => [r.value, r.detail]), tip.foot].filter(Boolean).join(sep.sentence);
  };
  let peakCell: { r: number; c: number; v: number } | null = null;
  let quietCell: { r: number; c: number; v: number } | null = null;
  for (let r = 0; r < heatRows.length; r++) {
    for (let c = 0; c < heatRows[r].cells.length; c++) {
      const v = heatRows[r].cells[c].ratio;
      if (heatRows[r].cells[c].state !== "open" || v === null) continue;
      if (!peakCell || v > peakCell.v) peakCell = { r, c, v };
      if (!quietCell || v < quietCell.v) quietCell = { r, c, v };
    }
  }
  const anyClosedCell = heatRows.some((row) => row.cells.some((c) => c.state === "closed"));
  const heatCellText = (cell: HeatCell) =>
    cell.state === "open" && cell.ratio !== null ? t("adminInsights.pct", { n: pct(cell.ratio) }) : cell.state === "closed" ? t("status.closed") : t("adminInsights.dash");

  return (
    <div className="space-y-6">
      <p className="-mt-3 text-sm text-muted">{rangeLine}</p>

      <section aria-labelledby="kpi-title">
        <h2 id="kpi-title" className="sr-only">{t("adminInsights.stats.kpis")}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {tiles.map((tile) => (
            <StatTile key={tile.key} label={tile.label} value={tile.value} sub={tile.sub} icon={tile.icon} accent={tile.accent} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          id="chart-daily"
          title={t("adminInsights.daily.title")}
          sub={week ? t("adminInsights.daily.subWeek") : t("adminInsights.daily.sub4w")}
          legend={dayLegend}
          note={anyUpcoming ? t("adminInsights.stats.weekSoFar") : undefined}
          table={
            <DataTableView
              caption={t("adminInsights.daily.title")}
              head={tableHead(t("adminInsights.tile.bookings"))}
              rows={cur.days.map((d, i) => [rowLabel(d), fmt.number(bookingsCur[i]), ...(bookingsPrev ? [fmt.number(bookingsPrev[i])] : [])])}
            />
          }
        >
          <ColumnChart
            label={t("adminInsights.daily.title")}
            points={points}
            series={bookingSeries}
            max={bTicks.max}
            ticks={bTicks.ticks}
            formatTick={(v) => fmt.number(v)}
            formatValue={(v) => fmt.number(v)}
            tip={bookingTip}
            describe={describeBookings}
            defaultIndex={defaultIndex}
          />
        </ChartCard>

        <ChartCard
          id="chart-occupancy"
          title={t("adminInsights.occ.title")}
          sub={t("adminInsights.occ.sub")}
          legend={dayLegend}
          note={anyUpcoming ? t("adminInsights.stats.weekSoFar") : undefined}
          table={
            <DataTableView
              caption={t("adminInsights.occ.title")}
              head={tableHead(t("adminInsights.occ.short"))}
              rows={cur.days.map((d, i) => [rowLabel(d), occValue(occCur[i], closedCur[i]), ...(occPrev && closedPrev ? [occValue(occPrev[i], closedPrev[i])] : [])])}
            />
          }
        >
          <ColumnChart
            label={t("adminInsights.occ.title")}
            points={points}
            series={occSeries}
            max={1}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            formatTick={(v) => t("adminInsights.pct", { n: pct(v) })}
            formatValue={(v) => t("adminInsights.pct", { n: pct(v) })}
            tip={occTip}
            describe={describeOcc}
            defaultIndex={defaultIndex}
          />
        </ChartCard>

        <ChartCard id="chart-source" title={t("adminInsights.source.title")} sub={t("adminInsights.source.sub")}>
          {T.bookings ? <BarList rows={sourceRows} scale={T.bookings} track /> : <p className="text-sm text-muted">{t("adminInsights.chart.noData")}</p>}
        </ChartCard>

        <ChartCard
          id="chart-revenue"
          title={t("adminInsights.revenue.title")}
          sub={t("adminInsights.revenue.sub")}
          badge={<Chip tone="amber">{t("adminInsights.tile.sample")}</Chip>}
          legend={
            week && P ? (
              <>
                <LegendItem swatch="bar" color={viz.primary}>{thisLabel}</LegendItem>
                <LegendItem swatch="bar" color={viz.previous}>{lastLabel}</LegendItem>
              </>
            ) : null
          }
        >
          {T.revenue || (P && P.revenue) ? (
            <BarList rows={revenueRows} scale={revenueScale} srCurrent={week && P ? thisLabel : undefined} srPrev={week && P ? lastLabel : undefined} />
          ) : (
            <p className="text-sm text-muted">{t("adminInsights.chart.noData")}</p>
          )}
        </ChartCard>
      </div>

      <ChartCard
        id="chart-heat"
        title={t("adminInsights.heat.title")}
        sub={t("adminInsights.heat.sub", { from: fmt.dateShort(heatDays.from), to: fmt.dateShort(heatDays.to) })}
        legend={
          <>
            <HeatLegend />
            <LegendItem swatch="dot">{t("adminInsights.chart.notOpen")}</LegendItem>
            {anyClosedCell && <LegendItem swatch="hatch">{t("status.closed")}</LegendItem>}
          </>
        }
        note={
          peakCell && quietCell && peakCell.v > 0 ? (
            <p>
              <span className="block sm:inline">{t("adminInsights.heat.peak", { when: heatWhen(peakCell.r, peakCell.c), p: pct(peakCell.v) })}</span>
              <span aria-hidden className="hidden sm:inline"> · </span>
              <span className="block sm:inline">{t("adminInsights.heat.quiet", { when: heatWhen(quietCell.r, quietCell.c), p: pct(quietCell.v) })}</span>
            </p>
          ) : (
            t("adminInsights.chart.noData")
          )
        }
        table={
          <DataTableView
            caption={t("adminInsights.heat.title")}
            head={[t("adminInsights.chart.day"), ...heatCols.map((c) => c.label)]}
            rows={heatRows.map((row) => [fmt.weekday(Number(row.key), "long"), ...row.cells.map(heatCellText)])}
          />
        }
      >
        <Heatmap
          label={t("adminInsights.heat.title")}
          rows={heatRows}
          cols={heatCols}
          tip={heatTip}
          describe={describeHeat}
          defaultCell={peakCell ? { r: peakCell.r, c: peakCell.c } : undefined}
          labelWidth={locale === "zh" ? 56 : 44}
        />
      </ChartCard>
    </div>
  );
}
