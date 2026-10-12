"use client";

import { useState } from "react";
import { CheckCheck, CircleCheck, LockOpen, Send } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { site } from "@/config/site";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { Chip, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Field, Select } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useBookings, useClosures, useConditions } from "@/lib/hooks";
import { markClosureMessageSent, reopenClosure, setWarning } from "@/lib/services";
import { fromMin, hkNow, type HKNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Booking, Closure, WarningCode } from "@/types";
import { BookingMiniList, Panel, WarningGlyph, tally, useStamp, useWhen } from "./ui";

/** Every HK Observatory warning the public status card can show. */
const ALL_WARNINGS: WarningCode[] = ["amber_rain", "red_rain", "black_rain", "thunderstorm", "t3", "t8", "very_hot"];

/** What a rider sees in WhatsApp: one message from AKKI with both languages. */
function WhatsAppPreview({ en, zh, sentAt, today, className }: { en: string; zh: string; sentAt?: string; today: string; className?: string }) {
  const { t, l, fmt } = useI18n();
  const at = hkNow(sentAt ? Date.parse(sentAt) : Date.now());
  return (
    <figure className={cn("overflow-hidden rounded-lg border border-line", className)}>
      <figcaption className="flex items-center gap-2.5 bg-[#1F2C34] px-3 py-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ink">
          <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[#E9EDEF]">{l(site.name)}</span>
          <span className="block text-[11px] text-[#8696A0]">{t("adminPlan.weather.waBusiness")}</span>
        </span>
      </figcaption>
      <div className="space-y-2 bg-[#0B141A] p-3">
        <p className="mx-auto w-fit rounded-md bg-[#182229] px-2 py-0.5 text-[11px] text-[#8696A0]">{fmt.relDay(at.date, today)}</p>
        <div className="max-w-[94%] rounded-lg rounded-tl-none bg-[#202C33] px-3 py-2 text-[13px] leading-relaxed text-[#E9EDEF]">
          <p lang="en" className="whitespace-pre-line break-words">{en}</p>
          <p lang="zh-Hant-HK" className="mt-2 whitespace-pre-line break-words border-t border-white/10 pt-2">{zh}</p>
          <p className="mt-1 text-right text-[10px] text-[#8696A0]">{fmt.time(fromMin(at.minutes))}</p>
        </div>
      </div>
    </figure>
  );
}

/** A live closure: flagged bookings, send the message, reopen. */
export function ClosureCard({ closure, now }: { closure: Closure; now: HKNow }) {
  const { t, tn } = useI18n();
  const toast = useToast();
  const when = useWhen();
  const stamp = useStamp();
  const [bookings] = useBookings();
  const [reopen, setReopen] = useState(false);
  const ids = new Set(closure.affectedBookingIds);
  const flagged = bookings.filter((b) => ids.has(b.id));
  const live = flagged.filter((b) => b.status === "confirmed" && b.flag?.closureId === closure.id);
  const counts = tally(flagged);
  const contacts = tally(live).contacts;

  const rowState = (b: Booking) => {
    if (b.status === "cancelled") return <span className="text-muted">{t("booking.cancelled")}</span>;
    if (b.flag?.closureId !== closure.id) return <span className="text-muted">{t("adminPlan.weather.rowSorted")}</span>;
    return b.flag.notified ? (
      <span className="inline-flex items-center gap-1 font-semibold text-[#5EDC8C]">
        <CheckCheck className="h-3.5 w-3.5" aria-hidden />
        {t("adminPlan.weather.rowMessaged")}
      </span>
    ) : (
      <span className="font-semibold text-brand-amber">{t("adminPlan.weather.rowPending")}</span>
    );
  };

  return (
    <article id={`closure-${closure.id}`} tabIndex={-1} aria-labelledby={`closure-${closure.id}-title`} className="surface scroll-mt-24 overflow-hidden border-state-closed/40 animate-fade-up">
      <div className="flex flex-col gap-4 border-b border-line bg-state-closed/[.06] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <WarningGlyph code={closure.warning} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusBadge status="closed" />
              <span className="text-xs text-muted">{t("adminPlan.weather.closedAt", { when: stamp(closure.createdAt, now.date) })}</span>
            </p>
            <h3 id={`closure-${closure.id}-title`} className="mt-1 text-lg font-semibold leading-snug">{t(`warning.${closure.warning}`)}</h3>
            <p className="text-sm text-fg/90">{when(closure, now.date)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {live.length > 0 && !closure.messageSent && (
            <Button
              font="sans"
              onClick={() => {
                markClosureMessageSent(closure.id);
                toast(tn("adminPlan.weather.sent", contacts));
              }}
              className="flex-1 sm:flex-none"
            >
              <Send className="h-4 w-4" aria-hidden />
              {tn("adminPlan.weather.send", contacts)}
            </Button>
          )}
          {closure.messageSent && (
            <Chip tone="green" className="min-h-11 px-3 text-xs">
              <CircleCheck className="h-3.5 w-3.5" aria-hidden />
              {t("adminPlan.weather.sentBadge")}
            </Chip>
          )}
          <Button variant="secondary" font="sans" onClick={() => setReopen(true)} className="flex-1 sm:flex-none">
            <LockOpen className="h-4 w-4" aria-hidden />
            {t("adminPlan.weather.reopen")}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <h4 className="mb-2 text-sm font-semibold">
            {t("adminPlan.weather.flagged")}{" "}
            <span className="font-normal text-muted">
              {t("adminPlan.withRiders", { bookings: tn("adminPlan.bookings", counts.bookings), riders: tn("riders.count", counts.riders) })}
            </span>
          </h4>
          {flagged.length ? <BookingMiniList bookings={flagged} limit={5} trailing={rowState} /> : <p className="text-sm text-muted">{t("adminPlan.weather.noBookings")}</p>}
        </div>
        <div className="min-w-0">
          <h4 className="mb-2 text-sm font-semibold">{t("adminPlan.weather.preview")}</h4>
          <WhatsAppPreview en={closure.messageEn} zh={closure.messageZh} sentAt={closure.createdAt} today={now.date} />
        </div>
      </div>

      <ConfirmDialog
        open={reopen}
        onOpenChange={setReopen}
        title={t("adminPlan.weather.reopenTitle")}
        confirmLabel={t("adminPlan.weather.reopen")}
        onConfirm={() => {
          reopenClosure(closure.id);
          toast(t("adminPlan.weather.reopenedToast"));
        }}
        body={t("adminPlan.weather.reopenBody", { when: when(closure) })}
      />
    </article>
  );
}

/** Every closure, newest first. */
export function ClosureHistory({ now }: { now: HKNow }) {
  const { t, tn } = useI18n();
  const when = useWhen();
  const stamp = useStamp();
  const [closures] = useClosures();
  const sorted = [...closures].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <Panel id="history" title={t("adminPlan.weather.history")}>
      {sorted.length === 0 ? (
        <EmptyState title={t("adminPlan.weather.historyEmptyTitle")} body={t("adminPlan.weather.historyEmptyBody")} />
      ) : (
        <ol className="-my-3 divide-y divide-line">
          {sorted.map((c) => {
            const state = c.reopenedAt ? "reopened" : c.date < now.date ? "ended" : "active";
            return (
              <li key={c.id} className="flex items-start gap-3 py-3">
                <WarningGlyph code={c.warning} className="h-8 w-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug">{t(`warning.${c.warning}`)}</p>
                  <p className="text-sm text-fg/90">{when(c, now.date)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {tn("adminPlan.bookings", c.affectedBookingIds.length)} · {c.messageSent ? t("adminPlan.weather.sentBadge") : t("adminPlan.weather.notSent")}
                  </p>
                  {c.reopenedAt && <p className="text-xs text-muted">{t("adminPlan.weather.reopenedAt", { when: stamp(c.reopenedAt, now.date) })}</p>}
                </div>
                <Chip tone={state === "active" ? "red" : "neutral"}>{t(`adminPlan.weather.state.${state}`)}</Chip>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

/** Set or clear the warning shown on the public status card, without closing. */
export function WarningControl({ now }: { now: HKNow }) {
  const { t } = useI18n();
  const toast = useToast();
  const stamp = useStamp();
  const [conditions] = useConditions();
  const [pick, setPick] = useState<WarningCode>(conditions.warning ?? "amber_rain");
  const current = conditions.warning;
  return (
    <Panel id="hko" title={t("adminPlan.hko.title")} lead={t("adminPlan.hko.lead")}>
      <div className="space-y-4">
        <div className="rounded-md border border-line bg-[#0E0D0D] p-3" aria-live="polite">
          <p className="text-xs font-semibold text-muted">{t("adminPlan.hko.current")}</p>
          {current ? (
            <div className="mt-2 flex items-center gap-2.5">
              <WarningGlyph code={current} className="h-8 w-8" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{t(`warning.${current}`)}</p>
                <p className="text-xs text-muted">{t("adminPlan.hko.updated", { when: stamp(conditions.updatedAt, now.date) })}</p>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm">{t("warning.none")}</p>
          )}
        </div>
        <Field label={t("adminPlan.hko.pick")} htmlFor="hko-pick">
          <Select id="hko-pick" value={pick} onChange={(e) => setPick(e.target.value as WarningCode)}>
            {ALL_WARNINGS.map((w) => (
              <option key={w} value={w}>
                {t(`warning.${w}`)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="subtle"
            font="sans"
            disabled={pick === current}
            onClick={() => {
              setWarning(pick);
              toast(t("adminPlan.hko.setToast", { warning: t(`warning.${pick}`) }));
            }}
          >
            {t("adminPlan.hko.set")}
          </Button>
          {current && (
            <Button
              variant="ghost"
              font="sans"
              onClick={() => {
                setWarning(null);
                toast(t("adminPlan.hko.clearedToast"));
              }}
            >
              {t("btn.clear")}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">{t("adminPlan.hko.sample")}</p>
      </div>
    </Panel>
  );
}
