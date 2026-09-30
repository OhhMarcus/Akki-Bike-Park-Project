"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { sanitizeText } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import type { CoachingProgramme, Level, LocalizedText } from "@/types";
import { LocalizedFields } from "./LocalizedFields";
import { toInt } from "./helpers";

const clean = (v: LocalizedText, max: number): LocalizedText => ({ en: sanitizeText(v.en, max), zh: sanitizeText(v.zh, max) });

export function ProgrammeForm({ programme, onSave, onCancel }: { programme: CoachingProgramme; onSave: (p: CoachingProgramme) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState(programme.name);
  const [summary, setSummary] = useState(programme.summary);
  const [groupSize, setGroupSize] = useState(programme.groupSize);
  const [duration, setDuration] = useState(programme.duration);
  const [ageRange, setAgeRange] = useState(programme.ageRange);
  const [instructor, setInstructor] = useState(programme.instructor);
  const [level, setLevel] = useState<Level | "all">(programme.level);
  const [price, setPrice] = useState(programme.priceHKD === null ? "" : String(programme.priceHKD));
  const [offset, setOffset] = useState(String(programme.nextSessionOffsetDays));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    const n = clean(name, 100);
    const s = clean(summary, 240);
    if (!n.en) err.nameEn = t("val.required");
    if (!n.zh) err.nameZh = t("val.required");
    if (!s.en) err.summaryEn = t("val.required");
    if (!s.zh) err.summaryZh = t("val.required");
    let priceHKD: number | null = null;
    if (price.trim() !== "") {
      const p = toInt(price);
      if (p === null) err.price = t("admin.err.number");
      else priceHKD = p;
    }
    const off = toInt(offset);
    if (off === null || off > 365) err.offset = t("admin.err.number");
    setErrors(err);
    if (Object.keys(err).length || off === null) return;
    onSave({ ...programme, name: n, summary: s, groupSize: clean(groupSize, 60), duration: clean(duration, 60), ageRange: clean(ageRange, 60), instructor: clean(instructor, 100), level, priceHKD, nextSessionOffsetDays: off });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <LocalizedFields id="pg-name" label={t("admin.co.fName")} value={name} onChange={setName} errors={{ en: errors.nameEn, zh: errors.nameZh }} />
      <LocalizedFields id="pg-summary" label={t("admin.ev.fSummary")} value={summary} onChange={setSummary} multiline errors={{ en: errors.summaryEn, zh: errors.summaryZh }} />
      <LocalizedFields id="pg-group" label={t("admin.co.fGroup")} value={groupSize} onChange={setGroupSize} />
      <LocalizedFields id="pg-duration" label={t("admin.co.fDuration")} value={duration} onChange={setDuration} />
      <LocalizedFields id="pg-age" label={t("admin.co.fAge")} value={ageRange} onChange={setAgeRange} />
      <LocalizedFields id="pg-instructor" label={t("admin.co.fInstructor")} value={instructor} onChange={setInstructor} hint={t("admin.co.instructorHint")} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t("label.level")} htmlFor="pg-level">
          <Select id="pg-level" value={level} onChange={(e) => setLevel(e.target.value as Level | "all")}>
            {(["all", "beginner", "intermediate", "advanced"] as const).map((x) => (
              <option key={x} value={x}>{t(`level.${x}`)}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("admin.ev.fPrice")} htmlFor="pg-price" error={errors.price} hint={t("admin.ev.priceHint")}>
          <Input id="pg-price" inputMode="numeric" value={price} placeholder={t("label.tbc")} aria-invalid={!!errors.price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label={t("admin.co.fOffset")} htmlFor="pg-offset" error={errors.offset} hint={t("admin.co.offsetHint")}>
          <Input id="pg-offset" inputMode="numeric" value={offset} aria-invalid={!!errors.offset} onChange={(e) => setOffset(e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>{t("btn.cancel")}</Button>
        <Button type="submit">{t("btn.save")}</Button>
      </div>
    </form>
  );
}
