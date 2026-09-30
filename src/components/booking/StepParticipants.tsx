"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import type { ExperienceId, ParticipantInput } from "@/types";
import { ParticipantForm } from "./ParticipantForm";
import { blankParticipant } from "./booking-utils";

type Contact = { contactName: string; contactEmail: string; contactPhone: string; marketingConsent: boolean };

export function StepParticipants({ experienceId, participants, minParticipants, maxParticipants, remaining, contact, errors, onParticipants, onContact }: {
  experienceId: ExperienceId;
  participants: ParticipantInput[];
  minParticipants: number;
  maxParticipants: number;
  /** Spots left in the chosen session (Infinity when unknown) */
  remaining: number;
  contact: Contact;
  errors: Record<string, string>;
  onParticipants: (next: ParticipantInput[]) => void;
  onContact: (patch: Partial<Contact>) => void;
}) {
  const { t } = useI18n();
  const cap = Math.min(maxParticipants, remaining);
  const canAdd = participants.length < cap;
  const canRemove = participants.length > Math.max(1, minParticipants);
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined }) as const;

  const forRider = (i: number) => {
    const out: Record<string, string> = {};
    for (const k of Object.keys(errors)) if (k.startsWith(`${i}.`)) out[k.slice(String(i).length + 1)] = errors[k];
    return out;
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-silver">
        {t("booking.ridersRange", { min: minParticipants, max: maxParticipants })}
        {Number.isFinite(remaining) && remaining < maxParticipants ? ` ${t("booking.ridersCapacity", { n: remaining })}` : ""}
      </p>

      {errors.count && <p id="riders-count" role="alert" tabIndex={-1} className="rounded-md border border-danger/40 bg-danger/5 p-3 text-sm text-danger">{t(errors.count as MessageKey, { min: minParticipants, n: Number.isFinite(remaining) ? remaining : maxParticipants })}</p>}

      {participants.map((p, i) => (
        <ParticipantForm
          key={p.id}
          index={i}
          value={p}
          errors={forRider(i)}
          experienceId={experienceId}
          onChange={(next) => onParticipants(participants.map((x, j) => (j === i ? next : x)))}
          onRemove={canRemove ? () => onParticipants(participants.filter((_, j) => j !== i)) : undefined}
        />
      ))}

      <div>
        <Button variant="secondary" disabled={!canAdd} onClick={() => onParticipants([...participants, blankParticipant()])}>
          <Plus className="h-4 w-4" aria-hidden />
          {t("booking.addRider")}
        </Button>
        {!canAdd && <p className="mt-2 text-xs text-silver-dim">{t("booking.maxReached", { n: cap })}</p>}
      </div>

      <fieldset className="surface space-y-4 p-5">
        <legend className="font-display text-xl font-bold uppercase">{t("booking.contactTitle")}</legend>
        <p className="text-sm text-silver">{t("booking.contactBody")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("label.name")} htmlFor="contactName" error={err("contactName")} className="sm:col-span-2">
            <Input id="contactName" autoComplete="name" value={contact.contactName} onChange={(e) => onContact({ contactName: e.target.value })} {...inv("contactName")} />
          </Field>
          <Field label={t("label.email")} htmlFor="contactEmail" error={err("contactEmail")}>
            <Input id="contactEmail" type="email" inputMode="email" autoComplete="email" value={contact.contactEmail} onChange={(e) => onContact({ contactEmail: e.target.value })} {...inv("contactEmail")} />
          </Field>
          <Field label={t("label.phone")} htmlFor="contactPhone" error={err("contactPhone")}>
            <Input id="contactPhone" type="tel" inputMode="tel" autoComplete="tel" value={contact.contactPhone} onChange={(e) => onContact({ contactPhone: e.target.value })} {...inv("contactPhone")} />
          </Field>
        </div>
        <Checkbox id="marketingConsent" checked={contact.marketingConsent} onChange={(v) => onContact({ marketingConsent: v })}>
          {t("label.consentMarketing")}
        </Checkbox>
        <p className="text-xs text-silver-dim">{t("booking.dataNote")}</p>
      </fieldset>
    </div>
  );
}
