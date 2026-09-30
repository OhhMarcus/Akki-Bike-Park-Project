"use client";

import { Trash2 } from "lucide-react";
import { addOnPrices } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import type { ExperienceId, Guardian, Level, ParticipantInput } from "@/types";
import { emptyGuardian } from "./booking-utils";

type Props = {
  index: number;
  value: ParticipantInput;
  /** Keys relative to this rider, e.g. `name`, `guardian.phone` -> message key */
  errors: Record<string, string>;
  experienceId: ExperienceId;
  onChange: (next: ParticipantInput) => void;
  onRemove?: () => void;
};

const levels: Level[] = ["beginner", "intermediate", "advanced"];

export function participantFieldId(index: number, key: string) {
  const k = key === "guardian" ? "guardian.name" : key;
  return `p${index}-${k.replace(".", "-")}`;
}

export function ParticipantForm({ index, value, errors, experienceId, onChange, onRemove }: Props) {
  const { t, money } = useI18n();
  const id = (k: string) => participantFieldId(index, k);
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${id(k)}-error` : undefined }) as const;
  const minor = typeof value.age === "number" && value.age < 18;
  const g: Guardian = value.guardian ?? emptyGuardian();
  const set = (patch: Partial<ParticipantInput>) => onChange({ ...value, ...patch });
  const setG = (patch: Partial<Guardian>) => set({ guardian: { ...g, ...patch } });
  const canCoach = experienceId !== "coaching" && experienceId !== "event";

  function onAge(raw: string) {
    const n = raw === "" ? "" : Math.max(0, Math.min(120, Math.floor(Number(raw))));
    const isMinor = typeof n === "number" && n < 18;
    onChange({ ...value, age: Number.isNaN(n) ? "" : n, guardian: isMinor ? (value.guardian ?? emptyGuardian()) : undefined });
  }

  return (
    <fieldset className="surface space-y-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <legend className="font-display text-xl font-bold uppercase">{t("label.rider")} {index + 1}</legend>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`${t("btn.remove")} ${t("label.rider")} ${index + 1}`}>
            <Trash2 className="h-4 w-4" aria-hidden />
            {t("btn.remove")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("label.name")} htmlFor={id("name")} error={err("name")}>
          <Input id={id("name")} autoComplete="off" value={value.name} onChange={(e) => set({ name: e.target.value })} {...inv("name")} />
        </Field>
        <Field label={t("label.age")} htmlFor={id("age")} error={err("age")}>
          <Input id={id("age")} type="number" inputMode="numeric" min={3} max={99} value={value.age} onChange={(e) => onAge(e.target.value)} {...inv("age")} />
        </Field>
        <Field label={t("booking.skillLevel")} htmlFor={id("level")}>
          <Select id={id("level")} value={value.level} onChange={(e) => set({ level: e.target.value as Level })}>
            {levels.map((lv) => <option key={lv} value={lv}>{t(`level.${lv}`)}</option>)}
          </Select>
        </Field>
        <Field label={t("booking.bike")} htmlFor={id("bike")}>
          <Select id={id("bike")} value={value.bike} onChange={(e) => set({ bike: e.target.value as "own" | "rental" })}>
            <option value="own">{t("booking.bikeOwn")}</option>
            <option value="rental">{t("booking.bikeRental", { price: money(addOnPrices.rentalBike) })}</option>
          </Select>
        </Field>
        <Field label={t("booking.emergencyName")} htmlFor={id("emergencyName")} error={err("emergencyName")}>
          <Input id={id("emergencyName")} autoComplete="off" value={value.emergencyName} onChange={(e) => set({ emergencyName: e.target.value })} {...inv("emergencyName")} />
        </Field>
        <Field label={t("booking.emergencyPhone")} htmlFor={id("emergencyPhone")} error={err("emergencyPhone")}>
          <Input id={id("emergencyPhone")} type="tel" inputMode="tel" autoComplete="off" value={value.emergencyPhone} onChange={(e) => set({ emergencyPhone: e.target.value })} {...inv("emergencyPhone")} />
        </Field>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{t("booking.equipment")}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <Checkbox id={id("helmet")} checked={value.equipment.helmet} onChange={(v) => set({ equipment: { ...value.equipment, helmet: v } })}>{t("booking.helmet", { price: money(addOnPrices.helmet) })}</Checkbox>
          <Checkbox id={id("gloves")} checked={value.equipment.gloves} onChange={(v) => set({ equipment: { ...value.equipment, gloves: v } })}>{t("booking.gloves", { price: money(addOnPrices.gloves) })}</Checkbox>
          <Checkbox id={id("pads")} checked={value.equipment.pads} onChange={(v) => set({ equipment: { ...value.equipment, pads: v } })}>{t("booking.pads", { price: money(addOnPrices.pads) })}</Checkbox>
        </div>
      </div>

      {canCoach && (
        <Checkbox id={id("coaching")} checked={value.coachingAddOn} onChange={(v) => set({ coachingAddOn: v })}>
          {t("booking.coachingAddOn", { price: money(addOnPrices.coaching) })}
        </Checkbox>
      )}

      {minor && (
        <div className="space-y-4 rounded-lg border border-signal/40 bg-signal/5 p-4" role="group" aria-label={t("booking.guardianTitle")}>
          <div>
            <p className="font-semibold">{t("booking.guardianTitle")}</p>
            <p className="text-sm text-silver">{t("booking.guardianBody")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("booking.guardianName")} htmlFor={id("guardian.name")} error={err("guardian.name") ?? err("guardian")}>
              <Input id={id("guardian.name")} autoComplete="off" value={g.name} onChange={(e) => setG({ name: e.target.value })} {...inv("guardian.name")} />
            </Field>
            <Field label={t("booking.guardianRelationship")} htmlFor={id("guardian.relationship")} error={err("guardian.relationship")}>
              <Input id={id("guardian.relationship")} autoComplete="off" value={g.relationship} onChange={(e) => setG({ relationship: e.target.value })} {...inv("guardian.relationship")} />
            </Field>
            <Field label={t("booking.guardianPhone")} htmlFor={id("guardian.phone")} error={err("guardian.phone")}>
              <Input id={id("guardian.phone")} type="tel" inputMode="tel" autoComplete="off" value={g.phone} onChange={(e) => setG({ phone: e.target.value })} {...inv("guardian.phone")} />
            </Field>
            <Field label={t("booking.guardianEmail")} htmlFor={id("guardian.email")} error={err("guardian.email")}>
              <Input id={id("guardian.email")} type="email" inputMode="email" autoComplete="off" value={g.email} onChange={(e) => setG({ email: e.target.value })} {...inv("guardian.email")} />
            </Field>
          </div>
          <Checkbox id={id("guardian.consentGiven")} checked={g.consentGiven} onChange={(v) => setG({ consentGiven: v })} error={err("guardian.consentGiven")}>
            {t("booking.guardianConsent")}
          </Checkbox>
        </div>
      )}
    </fieldset>
  );
}
