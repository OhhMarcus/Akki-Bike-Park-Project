"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { useBookings, useEnquiries, useEvents, useGroupEnquiries, useOverrides, useWaitlist } from "@/lib/store";
import { getDaySlots } from "@/lib/availability";
import { addDays, hkToday } from "@/lib/dates";
import { Card, CardBody } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { DemoTag } from "@/components/common/DemoTag";
import { EmptyState } from "@/components/common/States";
import type { ExperienceId } from "@/types";
import { AdminPageHeader } from "./AdminPageHeader";
import { BarChart } from "./BarChart";
import { BookingStatusBadge } from "./StatusBadge";
import { StatTile } from "./StatTile";
import { cn } from "@/lib/utils";

const experienceIds: ExperienceId[] = ["entry", "beginner", "coaching", "kids", "camp", "private", "school", "corporate", "event"];

function Panel({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <Card>
      <CardBody className="p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold uppercase">{title}</h2>
          {href && (
            <Link href={href} className={cn(buttonVariants({ variant: "ghost" }), "px-3 text-xs")}>
              {t("btn.viewAll")}
            </Link>
          )}
        </div>
        {children}
      </CardBody>
    </Card>
  );
}

export function OverviewAdmin() {
  const { t, l, date, money } = useI18n();
  const [bookings] = useBookings();
  const [overrides] = useOverrides();
  const [events] = useEvents();
  const [enquiries] = useEnquiries();
  const [groupEnquiries] = useGroupEnquiries();
  const [waitlist] = useWaitlist();

  const today = hkToday();
  const active = bookings.filter((b) => b.status !== "cancelled");
  const todays = active.filter((b) => b.date === today);
  const revenue = todays.filter((b) => b.paymentStatus === "paid_demo").reduce((s, b) => s + b.total, 0);

  const util = (day: string) => {
    const open = getDaySlots(day, bookings, overrides).filter((s) => s.status !== "closed");
    const cap = open.reduce((s, x) => s + x.capacity, 0);
    return cap ? Math.round((open.reduce((s, x) => s + x.booked, 0) / cap) * 100) : 0;
  };
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const newEnq = enquiries.filter((e) => e.status === "new");
  const newGroup = groupEnquiries.filter((e) => e.status === "new");
  const waiting = waitlist.filter((w) => w.status === "waiting").length;
  const pending = bookings.filter((b) => b.changeRequest || b.paymentStatus === "refund_requested").length;
  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const byExperience = experienceIds
    .map((id) => ({ id, n: active.filter((b) => b.experienceId === id).length }))
    .filter((x) => x.n > 0);

  return (
    <>
      <AdminPageHeader title={t("admin.ov.title")} description={t("admin.ov.sub")} />

      <section aria-label={t("admin.ov.kpis")} className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label={t("admin.ov.bookingsToday")} value={String(todays.length)} />
        <StatTile label={t("admin.ov.revenue")} value={money(revenue)} demo />
        <StatTile label={t("admin.ov.utilisation")} value={`${util(today)}%`} />
        <StatTile label={t("admin.ov.newEnquiries")} value={String(newEnq.length + newGroup.length)} />
        <StatTile label={t("admin.ov.waitlist")} value={String(waiting)} />
        <StatTile label={t("admin.ov.pending")} value={String(pending)} alert={pending > 0} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title={t("admin.ov.next7")}>
          <BarChart
            ariaLabel={t("admin.ov.next7")}
            max={100}
            data={days.map((d) => {
              const pct = util(d);
              return { id: d, label: date(d), value: pct, display: `${pct}%`, ariaLabel: t("admin.ov.utilAria", { date: date(d), pct }), alert: pct >= 90 };
            })}
          />
        </Panel>
        <Panel title={t("admin.ov.byExperience")} href="/admin/bookings">
          {byExperience.length === 0 ? (
            <EmptyState title={t("admin.ov.noBookings")} />
          ) : (
            <BarChart
              ariaLabel={t("admin.ov.byExperience")}
              data={byExperience.map((x) => ({ id: x.id, label: t(`exp.${x.id}`), value: x.n, display: String(x.n), ariaLabel: `${t(`exp.${x.id}`)}: ${x.n}` }))}
            />
          )}
        </Panel>

        <Panel title={t("admin.ov.todayBookings")} href="/admin/bookings">
          {todays.length === 0 ? (
            <p className="text-sm text-silver">{t("admin.ov.noBookings")}</p>
          ) : (
            <ul className="divide-y divide-graphite-800">
              {todays.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{b.contactName}</p>
                    <p className="text-xs text-silver-dim">
                      {t(`exp.${b.experienceId}`)} · {t(`period.${b.period}`)} · {t("admin.ov.riders", { n: b.participants.length })}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("admin.ov.upcomingEvents")} href="/admin/events">
          {upcoming.length === 0 ? (
            <p className="text-sm text-silver">{t("admin.ov.noEvents")}</p>
          ) : (
            <ul className="divide-y divide-graphite-800">
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {l(e.title)} {e.isDemo && <DemoTag />}
                    </p>
                    <p className="text-xs text-silver-dim">{date(e.date)} · {e.startTime}</p>
                  </div>
                  <span className="shrink-0 text-xs text-silver">{t("admin.ov.registered", { n: e.registered, cap: e.capacity })}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="lg:col-span-2">
          <Panel title={t("admin.ov.enquiriesPreview")} href="/admin/enquiries">
            {newEnq.length + newGroup.length === 0 ? (
              <p className="text-sm text-silver">{t("admin.ov.noEnquiries")}</p>
            ) : (
              <ul className="divide-y divide-graphite-800">
                {newEnq.slice(0, 3).map((e) => (
                  <li key={e.id} className="py-2.5 text-sm">
                    <p className="font-medium">{e.name}</p>
                    <p className="line-clamp-1 text-xs text-silver-dim">{e.message}</p>
                  </li>
                ))}
                {newGroup.slice(0, 3).map((e) => (
                  <li key={e.id} className="py-2.5 text-sm">
                    <p className="font-medium">{e.organisation || e.contactName}</p>
                    <p className="line-clamp-1 text-xs text-silver-dim">{e.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
