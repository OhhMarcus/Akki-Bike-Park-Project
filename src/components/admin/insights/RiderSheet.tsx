"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Pencil, Plus } from "lucide-react";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { Chip, SourceTag } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { ConfirmDialog, Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { lessonList, pack5 } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import { useEvents } from "@/lib/hooks";
import { bookingTitle } from "@/lib/labels";
import { waLink } from "@/lib/phone";
import { addPack, updateRider } from "@/lib/services";
import { bikeSizeForHeight } from "@/lib/sizing";
import type { HKNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Booking, LessonId } from "@/types";
import { packUsable, type RiderRow } from "./riderStats";

const HISTORY_PREVIEW = 6;

/** Wide rider profile: details, class packs, upcoming bookings, visit history and staff notes. */
export function RiderSheet({ row, now, onClose }: { row: RiderRow | undefined; now: HKNow | null; onClose: () => void }) {
  const { t, fmt } = useI18n();
  const description = row
    ? [row.rider.phone, row.joined ? t("adminInsights.rider.since", { date: fmt.date(row.joined) }) : null].filter(Boolean).join(" · ")
    : undefined;
  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && onClose()} title={row?.rider.name ?? ""} description={description} wide>
      {row && now && <RiderDetail key={row.rider.id} row={row} now={now} />}
    </Sheet>
  );
}

function SectionTitle({ id, children, aside }: { id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 id={id} className="eyebrow">
        {children}
      </h3>
      {aside}
    </div>
  );
}

function RiderDetail({ row, now }: { row: RiderRow; now: HKNow }) {
  const { t, tn, fmt, l } = useI18n();
  const toast = useToast();
  const [events] = useEvents();
  const { rider } = row;
  const [sell, setSell] = useState<LessonId | null>(null);
  const [allHistory, setAllHistory] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rider.notes ?? "");

  const size = bikeSizeForHeight(rider.heightCm);
  const notGiven = <span className="text-muted">{t("adminInsights.rider.notGiven")}</span>;
  const profile: { key: string; label: string; value: React.ReactNode }[] = [
    { key: "age", label: t("label.age"), value: rider.age ? t("adminInsights.rider.ageValue", { n: rider.age }) : notGiven },
    {
      key: "height",
      label: t("adminInsights.rider.height"),
      value: rider.heightCm ? (
        <>
          {t("adminInsights.rider.heightValue", { n: rider.heightCm })}
          {size && <span className="mt-0.5 block text-xs text-muted">{t("book.rent.suggested", { size: t(`size.${size}`) })}</span>}
        </>
      ) : notGiven,
    },
    { key: "exp", label: t("label.experience"), value: rider.experience ? t(`exp.${rider.experience}`) : notGiven },
    { key: "email", label: t("label.email"), value: rider.email ? <span className="break-all">{rider.email}</span> : notGiven },
  ];

  const history = allHistory ? row.past : row.past.slice(0, HISTORY_PREVIEW);
  const title = (b: Booking) => l(bookingTitle(b, events));
  const lessonShort = (id: LessonId) => t(`adminInsights.lessonShort.${id}`);

  const saveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    updateRider(rider.id, { notes: draft.trim() || undefined });
    setEditing(false);
    toast(t("adminInsights.rider.notesSaved"));
  };

  return (
    <div className="space-y-7">
      {/* quick actions */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={waLink(rider.phone, t("adminInsights.rider.waPrefill", { name: rider.name }))}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "secondary", size: "sm", font: "sans" })}
        >
          <WhatsAppIcon className="h-4 w-4 text-[#5EDC8C]" />
          {t("adminInsights.rider.whatsapp")}
        </a>
        {rider.clubMember && <Chip tone="purple">{t("adminInsights.riders.member")}</Chip>}
        {row.isNew && <Chip tone="sky">{t("adminInsights.riders.newChip")}</Chip>}
        <span className="text-sm text-muted">{tn("adminInsights.rider.visits", row.visits)}</span>
        {row.sources.length > 0 && (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm text-muted">· {t("adminInsights.col.sources")}</span>
            {row.sources.map((s) => (
              <SourceTag key={s} source={s} />
            ))}
          </span>
        )}
      </div>

      {/* profile */}
      <section aria-labelledby="rider-profile">
        <SectionTitle id="rider-profile">{t("adminInsights.rider.profile")}</SectionTitle>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          {profile.map((p) => (
            <div key={p.key} className="min-w-0">
              <dt className="text-xs text-muted">{p.label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{p.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* class packs */}
      <section aria-labelledby="rider-packs">
        <SectionTitle id="rider-packs">{t("adminInsights.rider.packs")}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {lessonList.map((lesson) => {
            const holdings = rider.packs
              .filter((p) => p.lessonId === lesson.id)
              .sort((a, z) => Number(packUsable(z, now.date)) - Number(packUsable(a, now.date)) || z.purchasedOn.localeCompare(a.purchasedOn));
            const left = row.packsLeft[lesson.id];
            return (
              <section key={lesson.id} aria-labelledby={`pack-${lesson.id}`} className="flex flex-col rounded-lg border border-line bg-ink/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 id={`pack-${lesson.id}`} className="font-semibold">
                      {l(lesson.name)}
                    </h4>
                    <p className="mt-0.5 text-sm text-muted" aria-live="polite">
                      {holdings.length ? tn("adminInsights.rider.classesLeft", left) : t("adminInsights.rider.noPack")}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className={cn("font-display text-3xl font-extrabold italic leading-none tabular [font-synthesis:none]", left ? "text-fg" : "text-line-strong")}
                  >
                    {left}
                  </span>
                </div>
                {holdings.length > 0 && (
                  <ul className="mt-3 space-y-2.5 border-t border-line pt-3">
                    {holdings.map((p) => {
                      const expired = p.expiresOn < now.date;
                      return (
                        <li key={p.id} className={cn("text-sm", !packUsable(p, now.date) && "opacity-60")}>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span aria-hidden className="flex gap-0.5">
                              {Array.from({ length: p.total }, (_, i) => (
                                <span key={i} className={cn("h-2.5 w-2.5 rounded-[2px]", i < p.remaining ? "bg-fg" : "bg-line-strong")} />
                              ))}
                            </span>
                            <span className="font-semibold tabular">{t("adminInsights.rider.packProgress", { left: p.remaining, total: p.total })}</span>
                            {p.remaining === 0 && <Chip>{t("adminInsights.rider.usedUp")}</Chip>}
                          </div>
                          <p className="mt-0.5 text-xs text-muted">
                            {t("adminInsights.rider.bought", { date: fmt.date(p.purchasedOn) })}
                            <span aria-hidden> · </span>
                            <span className={cn(expired && "text-brand-amber")}>
                              {expired ? t("adminInsights.rider.expired", { date: fmt.date(p.expiresOn) }) : t("adminInsights.rider.expires", { date: fmt.date(p.expiresOn) })}
                            </span>
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="mt-auto pt-3">
                  <Button variant="secondary" size="sm" font="sans" className="w-full" onClick={() => setSell(lesson.id)}>
                    <Plus className="h-4 w-4" aria-hidden />
                    {t("adminInsights.rider.sell")}
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {/* upcoming */}
      <section aria-labelledby="rider-upcoming">
        <SectionTitle
          id="rider-upcoming"
          aside={
            <Link href={`/admin/bookings?q=${encodeURIComponent(rider.phone)}`} className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-fg">
              {t("adminInsights.rider.openBookings")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        >
          {t("adminInsights.rider.upcoming")}
          {row.upcoming.length > 0 && <span className="ml-2 tabular">{row.upcoming.length}</span>}
        </SectionTitle>
        {row.upcoming.length ? (
          <ul className="space-y-2">
            {row.upcoming.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-line px-3 py-2 text-sm">
                <span className="font-semibold">{fmt.relDay(b.date, now.date)}</span>
                <span className="tabular text-muted">{fmt.timeRange(b.start, b.end)}</span>
                <span className="min-w-0 flex-1">{title(b)}</span>
                <span className="text-muted">{tn("riders.count", b.riders)}</span>
                <SourceTag source={b.source} />
                {b.payment === "unpaid" && <Chip tone="amber">{t("pay.unpaid")}</Chip>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("adminInsights.rider.upcomingNone")}</p>
        )}
      </section>

      {/* visit history */}
      <section aria-labelledby="rider-history">
        <SectionTitle id="rider-history">
          {t("adminInsights.rider.history")}
          {row.past.length > 0 && <span className="ml-2 tabular">{row.past.length}</span>}
        </SectionTitle>
        {row.past.length ? (
          <>
            <ol className="ml-1.5 space-y-4 border-l border-line pl-5">
              {history.map((b) => {
                const cancelled = b.status === "cancelled";
                const dot = cancelled ? "bg-line-strong" : b.attendance === "attended" ? "bg-fg" : b.attendance === "no_show" ? "bg-state-closed" : "bg-muted";
                return (
                  <li key={b.id} className="relative">
                    <span aria-hidden className={cn("absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-card", dot)} />
                    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold">{title(b)}</span>
                      <span className="text-xs text-muted tabular">
                        {fmt.date(b.date)}
                        <span aria-hidden> · </span>
                        {fmt.timeRange(b.start, b.end)}
                      </span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="mr-1 text-muted">{tn("riders.count", b.riders)}</span>
                      {cancelled ? (
                        <Chip>{t("booking.cancelled")}</Chip>
                      ) : (
                        <Chip tone={b.attendance === "attended" ? "sky" : b.attendance === "no_show" ? "red" : "neutral"}>
                          {b.attendance === "attended" && <Check className="h-3 w-3" aria-hidden />}
                          {t(`att.${b.attendance}`)}
                        </Chip>
                      )}
                      <Chip tone={b.payment === "unpaid" ? "amber" : "neutral"}>{t(`pay.${b.payment}`)}</Chip>
                      <SourceTag source={b.source} />
                    </p>
                  </li>
                );
              })}
            </ol>
            {row.past.length > HISTORY_PREVIEW && (
              <Button variant="ghost" size="sm" font="sans" className="mt-3" aria-expanded={allHistory} onClick={() => setAllHistory((v) => !v)}>
                {allHistory ? t("adminInsights.rider.showFewer") : t("adminInsights.rider.showAll", { n: row.past.length })}
              </Button>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">{t("adminInsights.rider.historyNone")}</p>
        )}
      </section>

      {/* notes */}
      <section aria-labelledby="rider-notes-title">
        <SectionTitle
          id="rider-notes-title"
          aside={
            !editing && (
              <Button variant="ghost" size="sm" font="sans" onClick={() => { setDraft(rider.notes ?? ""); setEditing(true); }}>
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                {rider.notes ? t("btn.edit") : t("adminInsights.rider.addNotes")}
              </Button>
            )
          }
        >
          {t("label.notes")}
        </SectionTitle>
        {editing ? (
          <form onSubmit={saveNotes}>
            <Textarea
              id="rider-notes"
              aria-labelledby="rider-notes-title"
              aria-describedby="rider-notes-hint"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("adminInsights.rider.notesPlaceholder")}
              autoFocus
            />
            <p id="rider-notes-hint" className="mt-1.5 text-xs text-muted">{t("adminInsights.rider.notesHint")}</p>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" font="sans" onClick={() => setEditing(false)}>
                {t("btn.cancel")}
              </Button>
              <Button type="submit" size="sm" font="sans">
                {t("btn.save")}
              </Button>
            </div>
          </form>
        ) : rider.notes ? (
          <p className="whitespace-pre-wrap rounded-md border border-line bg-ink/40 px-3 py-2.5 text-sm">{rider.notes}</p>
        ) : (
          <p className="text-sm text-muted">{t("adminInsights.rider.notesEmpty")}</p>
        )}
      </section>

      <ConfirmDialog
        open={!!sell}
        onOpenChange={(o) => !o && setSell(null)}
        title={sell ? t("adminInsights.rider.sellTitle", { lesson: lessonShort(sell) }) : ""}
        body={
          sell
            ? t("adminInsights.rider.sellBody", { name: rider.name, n: pack5.classes, days: pack5.validityDays, price: fmt.money(pack5.priceHKD[sell]) })
            : undefined
        }
        confirmLabel={t("adminInsights.rider.sellConfirm")}
        onConfirm={() => {
          if (!sell) return;
          addPack(rider.id, sell);
          toast(t("adminInsights.rider.sold", { lesson: lessonShort(sell), name: rider.name }));
        }}
      />
    </div>
  );
}
