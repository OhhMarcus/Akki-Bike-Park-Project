"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import { eventTypes } from "@/content/events";
import { useI18n } from "@/i18n/provider";
import { sanitizeText } from "@/lib/sanitize";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import type { EventType, Level, LocalizedText, ParkEvent } from "@/types";
import { LocalizedFields } from "./LocalizedFields";
import { isIsoDate, isTime, slugify, toInt } from "./helpers";

type Form = {
  title: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  level: Level | "all";
  minAge: string;
  maxAge: string;
  capacity: string;
  deadline: string;
  price: string;
  featured: boolean;
  published: boolean;
  isDemo: boolean;
};

type Errors = Partial<Record<"titleEn" | "titleZh" | "summaryEn" | "summaryZh" | "date" | "startTime" | "endTime" | "minAge" | "maxAge" | "capacity" | "deadline" | "price", string>>;

const blank = (): Form => ({
  title: { en: "", zh: "" },
  summary: { en: "", zh: "" },
  description: { en: "", zh: "" },
  type: "community",
  date: "",
  startTime: "09:00",
  endTime: "12:00",
  level: "all",
  minAge: "8",
  maxAge: "",
  capacity: "20",
  deadline: "",
  price: "",
  featured: false,
  published: false,
  isDemo: true,
});

const fromEvent = (e: ParkEvent): Form => ({
  title: e.title,
  summary: e.summary,
  description: e.description,
  type: e.type,
  date: e.date,
  startTime: e.startTime,
  endTime: e.endTime,
  level: e.level,
  minAge: String(e.minAge),
  maxAge: e.maxAge === undefined ? "" : String(e.maxAge),
  capacity: String(e.capacity),
  deadline: e.registrationDeadline,
  price: e.priceHKD === null ? "" : String(e.priceHKD),
  featured: !!e.featured,
  published: e.published,
  isDemo: e.isDemo,
});

export function EventForm({ initial, onSave, onCancel }: { initial: ParkEvent | null; onSave: (e: ParkEvent) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [f, setF] = useState<Form>(initial ? fromEvent(initial) : blank());
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Errors = {};
    const req = t("val.required");
    const title = { en: sanitizeText(f.title.en, 120), zh: sanitizeText(f.title.zh, 120) };
    const summary = { en: sanitizeText(f.summary.en, 240), zh: sanitizeText(f.summary.zh, 240) };
    if (!title.en) e.titleEn = req;
    if (!title.zh) e.titleZh = req;
    if (!summary.en) e.summaryEn = req;
    if (!summary.zh) e.summaryZh = req;
    if (!isIsoDate(f.date)) e.date = t("admin.err.date");
    if (!isTime(f.startTime)) e.startTime = t("admin.err.time");
    if (!isTime(f.endTime)) e.endTime = t("admin.err.time");
    else if (isTime(f.startTime) && f.endTime <= f.startTime) e.endTime = t("admin.ev.errEnd");
    const minAge = toInt(f.minAge);
    if (minAge === null || minAge > 99) e.minAge = t("admin.err.number");
    const maxAge = f.maxAge.trim() === "" ? undefined : toInt(f.maxAge);
    if (maxAge === null || (maxAge !== undefined && (maxAge > 99 || (minAge !== null && maxAge < minAge)))) e.maxAge = t("admin.ev.errMaxAge");
    const capacity = toInt(f.capacity);
    if (capacity === null || capacity < 1 || capacity > 1000) e.capacity = t("admin.err.number");
    if (!isIsoDate(f.deadline)) e.deadline = t("admin.err.date");
    else if (isIsoDate(f.date) && f.deadline > f.date) e.deadline = t("admin.ev.errDeadline");
    let price: number | null = null;
    if (f.price.trim() !== "") {
      const p = toInt(f.price);
      if (p === null) e.price = t("admin.err.number");
      else price = p;
    }
    setErrors(e);
    if (Object.keys(e).length || minAge === null || capacity === null || maxAge === null) return;

    const descEn = sanitizeText(f.description.en, 1500) || summary.en;
    const descZh = sanitizeText(f.description.zh, 1500) || summary.zh;
    const id = initial?.id ?? uid("evt");
    onSave({
      // keep schedule / organiser / faq of an existing event; new events start with neutral defaults
      schedule: [],
      organizer: { name: siteConfig.name, role: { en: "Organiser", zh: "主辦" } },
      requiredEquipment: [],
      faq: [],
      registered: 0,
      ...initial,
      id,
      slug: initial?.slug ?? `${slugify(title.en) || "event"}-${id.slice(-4)}`,
      type: f.type,
      title,
      summary,
      description: { en: descEn, zh: descZh },
      date: f.date,
      startTime: f.startTime,
      endTime: f.endTime,
      level: f.level,
      minAge,
      maxAge,
      capacity,
      registrationDeadline: f.deadline,
      priceHKD: price,
      featured: f.featured,
      published: f.published,
      isDemo: f.isDemo,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <LocalizedFields id="ev-title" label={t("admin.ev.fTitle")} value={f.title} onChange={(v) => set("title", v)} errors={{ en: errors.titleEn, zh: errors.titleZh }} />
      <LocalizedFields id="ev-summary" label={t("admin.ev.fSummary")} value={f.summary} onChange={(v) => set("summary", v)} errors={{ en: errors.summaryEn, zh: errors.summaryZh }} />
      <LocalizedFields id="ev-desc" label={t("admin.ev.fDescription")} value={f.description} onChange={(v) => set("description", v)} multiline hint={t("admin.ev.descHint")} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("admin.ev.fType")} htmlFor="ev-type">
          <Select id="ev-type" value={f.type} onChange={(e) => set("type", e.target.value as EventType)}>
            {eventTypes.map((x) => (
              <option key={x} value={x}>{t(`evtype.${x}`)}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("label.level")} htmlFor="ev-level">
          <Select id="ev-level" value={f.level} onChange={(e) => set("level", e.target.value as Level | "all")}>
            {(["all", "beginner", "intermediate", "advanced"] as const).map((x) => (
              <option key={x} value={x}>{t(`level.${x}`)}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("label.date")} htmlFor="ev-date" error={errors.date}>
          <Input id="ev-date" type="date" value={f.date} aria-invalid={!!errors.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label={t("admin.ev.fDeadline")} htmlFor="ev-deadline" error={errors.deadline}>
          <Input id="ev-deadline" type="date" value={f.deadline} aria-invalid={!!errors.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </Field>
        <Field label={t("admin.ev.fStart")} htmlFor="ev-start" error={errors.startTime}>
          <Input id="ev-start" type="time" value={f.startTime} aria-invalid={!!errors.startTime} onChange={(e) => set("startTime", e.target.value)} />
        </Field>
        <Field label={t("admin.ev.fEnd")} htmlFor="ev-end" error={errors.endTime}>
          <Input id="ev-end" type="time" value={f.endTime} aria-invalid={!!errors.endTime} onChange={(e) => set("endTime", e.target.value)} />
        </Field>
        <Field label={t("admin.ev.fMinAge")} htmlFor="ev-minage" error={errors.minAge}>
          <Input id="ev-minage" inputMode="numeric" value={f.minAge} aria-invalid={!!errors.minAge} onChange={(e) => set("minAge", e.target.value)} />
        </Field>
        <Field label={`${t("admin.ev.fMaxAge")} (${t("label.optional")})`} htmlFor="ev-maxage" error={errors.maxAge}>
          <Input id="ev-maxage" inputMode="numeric" value={f.maxAge} aria-invalid={!!errors.maxAge} onChange={(e) => set("maxAge", e.target.value)} />
        </Field>
        <Field label={t("admin.ev.fCapacity")} htmlFor="ev-cap" error={errors.capacity}>
          <Input id="ev-cap" inputMode="numeric" value={f.capacity} aria-invalid={!!errors.capacity} onChange={(e) => set("capacity", e.target.value)} />
        </Field>
        <Field label={t("admin.ev.fPrice")} htmlFor="ev-price" error={errors.price} hint={t("admin.ev.priceHint")}>
          <Input id="ev-price" inputMode="numeric" value={f.price} placeholder={t("label.tbc")} aria-invalid={!!errors.price} onChange={(e) => set("price", e.target.value)} />
        </Field>
      </div>

      <Field label={t("admin.ev.fImage")} htmlFor="ev-image" hint={t("admin.ev.imageNote")}>
        <input id="ev-image" type="file" accept="image/*" className="block w-full text-sm text-silver file:mr-3 file:min-h-11 file:rounded-md file:border file:border-graphite-600 file:bg-transparent file:px-4 file:text-bone" />
      </Field>

      <fieldset className="space-y-2 rounded-lg border border-graphite-700 p-3">
        <legend className="px-1 text-xs uppercase tracking-wider text-silver-dim">{t("admin.ev.flags")}</legend>
        <Checkbox id="ev-featured" checked={f.featured} onChange={(v) => set("featured", v)}>{t("admin.ev.fFeatured")}</Checkbox>
        <Checkbox id="ev-published" checked={f.published} onChange={(v) => set("published", v)}>{t("admin.ev.fPublished")}</Checkbox>
        <Checkbox id="ev-demo" checked={f.isDemo} onChange={(v) => set("isDemo", v)}>{t("admin.ev.fDemo")}</Checkbox>
        <p className="pl-8 text-xs text-silver-dim">{t("admin.ev.demoHint")}</p>
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>{t("btn.cancel")}</Button>
        <Button type="submit">{t("btn.save")}</Button>
      </div>
    </form>
  );
}
