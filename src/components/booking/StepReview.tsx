"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { getExperience } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { validatePromo, type PriceLine } from "@/lib/pricing";
import { usePromos } from "@/lib/store";
import type { DayPeriod, ExperienceId, ParkEvent, ParticipantInput } from "@/types";
import { PriceSummary } from "./PriceSummary";
import { WaiverModal } from "./WaiverModal";
import { sessionTimes } from "./booking-utils";

type Price = { lines: PriceLine[]; subtotal: number; discount: number; total: number };

export function StepReview({ experienceId, event, date, period, participants, contact, price, promoCode, promoPrefill, terms, waiver, errors, onPromo, onTerms, onWaiver, onEdit }: {
  experienceId: ExperienceId;
  event?: ParkEvent;
  date: string;
  period: DayPeriod;
  participants: ParticipantInput[];
  contact: { contactName: string; contactEmail: string; contactPhone: string };
  price: Price;
  promoCode: string;
  promoPrefill: string;
  terms: boolean;
  waiver: boolean;
  errors: Record<string, string>;
  onPromo: (code: string) => void;
  onTerms: (v: boolean) => void;
  onWaiver: (v: boolean) => void;
  onEdit: (step: number) => void;
}) {
  const { t, l, date: fmt } = useI18n();
  const [promos] = usePromos();
  const [input, setInput] = useState(promoCode || promoPrefill);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [waiverOpen, setWaiverOpen] = useState(false);
  const tried = useRef(false);
  const exp = getExperience(experienceId);
  const times = sessionTimes({ period, eventId: event?.id }, event ? [event] : []);
  const hasMinors = participants.some((p) => typeof p.age === "number" && p.age < 18);
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);

  function apply(raw: string) {
    const code = raw.trim();
    if (!code) return setPromoError(t("booking.promo.empty"));
    const r = validatePromo(code, promos);
    if (r.ok) {
      setPromoError(null);
      setInput(r.promo.code);
      onPromo(r.promo.code);
    } else {
      onPromo("");
      setPromoError(t(`booking.promo.${r.reason}`));
    }
  }

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    if (!promoCode && promoPrefill) apply(promoPrefill);
    // run once on mount to apply ?promo= / ?ref=
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applied = promos.find((p) => p.code.toUpperCase() === promoCode.toUpperCase());

  return (
    <div className="space-y-6">
      <section className="surface space-y-4 p-5" aria-labelledby="review-title">
        <div className="flex items-center justify-between gap-2">
          <h3 id="review-title" className="font-display text-xl font-bold uppercase">{t("booking.summary")}</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}><Pencil className="h-3.5 w-3.5" aria-hidden />{t("btn.edit")}</Button>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-silver-dim">{t("booking.experience")}</dt><dd className="font-medium">{event ? l(event.title) : exp ? l(exp.name) : ""}</dd></div>
          <div><dt className="text-silver-dim">{t("label.date")}</dt><dd className="font-medium">{fmt(date, { weekday: "long", month: "long", day: "numeric" })}</dd></div>
          <div>
            <dt className="text-silver-dim">{t("label.time")}</dt>
            <dd className="flex flex-wrap items-center gap-2 font-medium">{t(`period.${period}`)} · {times.start}–{times.end} <DemoTag /></dd>
          </div>
          <div><dt className="text-silver-dim">{t("booking.contact")}</dt><dd className="break-words font-medium">{contact.contactName}<br />{contact.contactEmail}<br />{contact.contactPhone}</dd></div>
          <div className="sm:col-span-2">
            <dt className="text-silver-dim">{t("label.riders")} ({participants.length})</dt>
            <dd className="font-medium">{participants.map((p) => `${p.name} (${p.age})`).join(", ")}</dd>
          </div>
        </dl>
        <Button variant="ghost" size="sm" onClick={() => onEdit(3)}><Pencil className="h-3.5 w-3.5" aria-hidden />{t("booking.editRiders")}</Button>
      </section>

      <section className="surface space-y-3 p-5" aria-labelledby="promo-title">
        <h3 id="promo-title" className="font-display text-xl font-bold uppercase">{t("booking.promo.title")}</h3>
        <form onSubmit={(e) => { e.preventDefault(); apply(input); }} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label={t("booking.promo.label")} htmlFor="promo-input" error={promoError ?? undefined} className="flex-1">
            <Input id="promo-input" value={input} autoCapitalize="characters" autoComplete="off" onChange={(e) => setInput(e.target.value)} aria-invalid={!!promoError} aria-describedby={promoError ? "promo-input-error" : undefined} />
          </Field>
          <Button type="submit" variant="secondary">{t("btn.apply")}</Button>
        </form>
        {applied && promoCode && (
          <p role="status" className="text-sm text-trail-green">
            {t("booking.promo.applied", { code: applied.code })}{applied.referral ? ` · ${t("booking.promo.referral")}` : ""}
            <button type="button" onClick={() => { onPromo(""); setInput(""); }} className="ml-2 min-h-11 px-2 text-silver underline hover:text-bone">{t("btn.remove")}</button>
          </p>
        )}
        <p className="text-xs text-silver-dim">{t("booking.promo.hint")}</p>
      </section>

      <PriceSummary {...price} promoCode={promoCode || undefined} priceTbc={experienceId === "event" && event?.priceHKD == null} />

      <section className="surface space-y-4 p-5" aria-labelledby="agree-title">
        <h3 id="agree-title" className="font-display text-xl font-bold uppercase">{t("booking.agreeTitle")}</h3>
        <Checkbox id="terms" checked={terms} onChange={onTerms} error={err("terms")}>
          {t("booking.termsPre")} <Link href="/terms" target="_blank" className="underline">{t("footer.terms")}</Link> {t("booking.termsAnd")} <Link href="/privacy" target="_blank" className="underline">{t("footer.privacy")}</Link>.
        </Checkbox>
        <div className="space-y-2">
          <Checkbox id="waiver" checked={waiver} onChange={onWaiver} error={err("waiver")}>
            {t("booking.waiverLabel", { v: siteConfig.waiverVersion })}
          </Checkbox>
          <Button variant="secondary" size="sm" onClick={() => setWaiverOpen(true)} className="ml-8">{t("booking.readWaiver")}</Button>
          {hasMinors && <p className="ml-8 text-xs text-signal">{t("booking.waiver.hasMinors")}</p>}
        </div>
        <p className="text-sm text-silver">
          {t("booking.cancelPolicy", { hours: siteConfig.cancellationWindowHours })}{" "}
          <Link href="/cancellation" target="_blank" className="underline hover:text-bone">{t("footer.cancellation")}</Link>
        </p>
      </section>

      <WaiverModal open={waiverOpen} onOpenChange={setWaiverOpen} onAccept={() => onWaiver(true)} hasMinors={hasMinors} />
    </div>
  );
}
