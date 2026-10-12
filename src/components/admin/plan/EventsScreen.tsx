"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, ExternalLink, Pencil, Plus, Trash } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { AdminPageHeader } from "@/components/layout/AdminShell";
import { Chip, EventTag } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CapacityBar } from "@/components/ui/capacity";
import { EmptyState } from "@/components/ui/empty";
import { Segmented } from "@/components/ui/segmented";
import { ConfirmDialog } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useAvailability, useEvents, useNowHK } from "@/lib/hooks";
import { deleteEvent, setEventPublished } from "@/lib/services";
import type { HKNow } from "@/lib/time";
import type { ParkEvent } from "@/types";
import { EventEditor, missingLangs } from "./EventEditor";
import { DateTile, PlanSkeleton, Switch, Warn } from "./ui";

/** Admin → Events. */
export function EventsScreen() {
  const { t } = useI18n();
  const now = useNowHK();
  const [editing, setEditing] = useState<ParkEvent | "new" | null>(null);
  return (
    <>
      <AdminPageHeader
        title={t("admin.nav.events")}
        lead={t("adminPlan.events.lead")}
        actions={
          <Button font="sans" disabled={!now} onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("adminPlan.events.new")}
          </Button>
        }
      />
      {now ? <EventsBody now={now} editing={editing} setEditing={setEditing} /> : <PlanSkeleton />}
    </>
  );
}

function EventsBody({
  now, editing, setEditing,
}: {
  now: HKNow; editing: ParkEvent | "new" | null; setEditing: (e: ParkEvent | "new" | null) => void;
}) {
  const { t, tn, l, fmt, locale } = useI18n();
  const toast = useToast();
  const [events] = useEvents();
  const avail = useAvailability(now);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [deleting, setDeleting] = useState<ParkEvent | null>(null);

  const byDate = (a: ParkEvent, b: ParkEvent) => (a.date + a.start).localeCompare(b.date + b.start);
  const upcoming = events.filter((e) => e.date >= now.date).sort(byDate);
  const past = events.filter((e) => e.date < now.date).sort((a, b) => byDate(b, a));
  const list = tab === "upcoming" ? upcoming : past;
  /** Title in the current language, falling back to the other one. */
  const titleOf = (e: ParkEvent) => l(e.title) || e.title[locale === "en" ? "zh" : "en"] || t("adminPlan.events.untitled");
  const deletingTaken = deleting ? avail.eventSpots(deleting).taken : 0;

  const publish = (e: ParkEvent, published: boolean) => {
    setEventPublished(e.id, published);
    toast(published ? t("adminPlan.events.publishedToast") : t("adminPlan.events.unpublishedToast"));
  };

  return (
    <>
      <Segmented
        label={t("adminPlan.events.filter")}
        value={tab}
        onChange={setTab}
        options={[
          { value: "upcoming", label: t("adminPlan.events.tabCount", { label: t("adminPlan.events.upcoming"), n: upcoming.length }) },
          { value: "past", label: t("adminPlan.events.tabCount", { label: t("adminPlan.events.past"), n: past.length }) },
        ]}
        className="mb-4"
      />

      {list.length === 0 ? (
        tab === "upcoming" ? (
          <EmptyState
            title={t("adminPlan.events.emptyTitle")}
            body={t("adminPlan.events.emptyBody")}
            icon={<CalendarPlus className="h-6 w-6 text-muted" aria-hidden />}
            action={
              <Button font="sans" variant="secondary" onClick={() => setEditing("new")}>
                <Plus className="h-4 w-4" aria-hidden />
                {t("adminPlan.events.new")}
              </Button>
            }
          />
        ) : (
          <EmptyState title={t("adminPlan.events.emptyPastTitle")} body={t("adminPlan.events.emptyPastBody")} />
        )
      ) : (
        <ul className="space-y-2">
          {list.map((e) => {
            const spots = avail.eventSpots(e);
            const gaps = missingLangs(e);
            const incomplete = gaps.en || gaps.zh;
            const title = titleOf(e);
            const whyId = `evt-${e.id}-why`;
            return (
              <li
                key={e.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-lg border border-line bg-card p-3 sm:p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] xl:grid-cols-[auto_minmax(0,1fr)_220px_auto]"
              >
                <DateTile date={e.date} today={now.date} className="md:row-span-2 xl:row-span-1" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <EventTag type={e.type} />
                    {!e.published && <Chip>{t("adminPlan.events.draft")}</Chip>}
                    {gaps.en && <Chip tone="amber">{t("adminPlan.events.missingEn")}</Chip>}
                    {gaps.zh && <Chip tone="amber">{t("adminPlan.events.missingZh")}</Chip>}
                  </div>
                  <p className="mt-1.5 truncate font-semibold" title={title}>{title}</p>
                  <p className="tabular text-xs text-muted">{fmt.timeRange(e.start, e.end)}</p>
                </div>
                <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 xl:col-start-3 xl:row-start-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="tabular text-muted">{t("adminPlan.events.registered", { taken: spots.taken, cap: spots.capacity })}</span>
                    {spots.ended && <span className="font-semibold text-muted">{t("adminPlan.events.ended")}</span>}
                  </div>
                  <CapacityBar booked={spots.taken} capacity={spots.capacity} status={spots.status} className="mt-1.5" />
                </div>
                <div className="col-span-2 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 md:col-span-1 md:col-start-3 md:row-span-2 md:row-start-1 md:flex-col md:items-end md:border-0 md:pt-0 xl:col-start-4 xl:row-span-1 xl:flex-row xl:items-center">
                  <div>
                    <Switch
                      checked={e.published}
                      onChange={(v) => publish(e, v)}
                      disabled={!e.published && incomplete}
                      label={t("adminPlan.events.publishLabel", { title })}
                      describedBy={incomplete ? whyId : undefined}
                    >
                      <span className={e.published ? "w-[4.5rem] text-fg" : "w-[4.5rem] text-muted"}>{e.published ? t("adminPlan.events.published") : t("adminPlan.events.draft")}</span>
                    </Switch>
                    {incomplete && (
                      <Warn id={whyId} className="mt-0.5">
                        {t("adminPlan.events.cantPublish")}
                      </Warn>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {e.published ? (
                      <Link
                        href={`/events/${e.slug}`}
                        target="_blank"
                        rel="noopener"
                        className={buttonVariants({ variant: "ghost", size: "iconSm", font: "sans" })}
                        aria-label={`${t("adminPlan.events.previewLabel", { title })} ${t("adminPlan.newTab")}`}
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </Link>
                    ) : (
                      <Button variant="ghost" size="iconSm" font="sans" disabled title={t("adminPlan.events.previewDraft")} aria-label={`${t("adminPlan.events.previewLabel", { title })}: ${t("adminPlan.events.previewDraft")}`}>
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </Button>
                    )}
                    <Button variant="ghost" size="iconSm" font="sans" onClick={() => setEditing(e)} aria-label={t("adminPlan.events.editLabel", { title })}>
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button variant="ghost" size="iconSm" font="sans" onClick={() => setDeleting(e)} aria-label={t("adminPlan.events.deleteLabel", { title })} className="hover:text-state-closed">
                      <Trash className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <EventEditor
          key={editing === "new" ? "new" : editing.id}
          event={editing === "new" ? null : editing}
          events={events}
          now={now}
          onClose={() => setEditing(null)}
          onDelete={(e) => {
            setEditing(null);
            setDeleting(e);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("adminPlan.events.deleteTitle")}
        danger
        confirmLabel={t("adminPlan.events.delete")}
        onConfirm={() => {
          if (!deleting) return;
          deleteEvent(deleting.id);
          toast(t("adminPlan.events.deletedToast"));
        }}
        body={
          deleting && (
            <div className="space-y-2">
              <p>{t("adminPlan.events.deleteBody", { title: titleOf(deleting) })}</p>
              {deletingTaken > 0 && <Warn className="text-sm">{t("adminPlan.events.deleteRegs", { riders: tn("riders.count", deletingTaken) })}</Warn>}
            </div>
          )
        }
      />
    </>
  );
}
