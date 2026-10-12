"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Save, Trash } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { dictionary } from "@/i18n/dictionary";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";
import { eventTone } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea, describedBy } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { NumberStepper } from "@/components/ui/stepper";
import { useToast } from "@/components/ui/toast";
import { useAvailability } from "@/lib/hooks";
import { saveEvent, slugify } from "@/lib/services";
import { addDays, toMin, type HKNow } from "@/lib/time";
import { cn, uid } from "@/lib/utils";
import type { EventCategory, EventType, HHmm, ISODate, Locale, LocalizedText, ParkEvent } from "@/types";
import { DateField, ErrorText, RadioChips, Switch, TimeSelect, Warn, halfHours } from "./ui";

const TYPES: EventType[] = ["race", "nightjam", "groupride", "kidscamp"];
const PHOTO_SLOTS = ["events-race", "events-nightjam", "events-groupride", "events-kidscamp"] as const;
type PhotoSlot = (typeof PHOTO_SLOTS)[number];
const photoFor: Record<EventType, PhotoSlot> = { race: "events-race", nightjam: "events-nightjam", groupride: "events-groupride", kidscamp: "events-kidscamp" };
const isPhotoSlot = (s: string | undefined): s is PhotoSlot => !!s && (PHOTO_SLOTS as readonly string[]).includes(s);
/** Usual times per event type, used until staff pick their own. */
const TYPE_TIMES: Record<EventType, [HHmm, HHmm]> = {
  race: ["09:30", "17:00"],
  nightjam: ["19:30", "22:00"],
  groupride: ["08:00", "11:00"],
  kidscamp: ["09:30", "15:30"],
};
const TIMES = halfHours(6 * 60, 23 * 60 + 30);
const LANGS: Locale[] = ["en", "zh"];

type MissingField = "title" | "summary" | "body" | "catName" | "catAges";

/** Every field that is filled in one language but not the other (or in neither). */
export function missingFields(e: Pick<ParkEvent, "title" | "summary" | "body" | "categories">) {
  const out: { lang: Locale; field: MissingField }[] = [];
  for (const lang of LANGS) {
    for (const field of ["title", "summary", "body"] as const) if (!e[field][lang].trim()) out.push({ lang, field });
    if (e.categories.some((c) => !c.name[lang].trim())) out.push({ lang, field: "catName" });
    if (e.categories.some((c) => !c.ages[lang].trim())) out.push({ lang, field: "catAges" });
  }
  return out;
}

/** Which languages still have gaps (for the list row warnings). */
export function missingLangs(e: Pick<ParkEvent, "title" | "summary" | "body" | "categories">) {
  const m = missingFields(e);
  return { en: m.some((x) => x.lang === "en"), zh: m.some((x) => x.lang === "zh") };
}

/** Lowercase-dash slug without stray dashes. */
const cleanSlug = (s: string) => slugify(s).replace(/^-+|-+$/g, "") || "event";

/** A slug no other event uses: race-day, race-day-2, … */
export function uniqueSlug(base: string, events: ParkEvent[], selfId?: string) {
  const taken = new Set(events.filter((e) => e.id !== selfId).map((e) => e.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

type Draft = Omit<ParkEvent, "id" | "createdAt" | "userCreated" | "photoSlot"> & { photoSlot: PhotoSlot };

function blank(today: ISODate): Draft {
  const empty = { en: "", zh: "" };
  return {
    slug: "",
    type: "race",
    title: empty,
    summary: empty,
    body: empty,
    date: addDays(today, 14),
    start: TYPE_TIMES.race[0],
    end: TYPE_TIMES.race[1],
    photoSlot: photoFor.race,
    categories: [{ id: uid("cat"), name: dictionary["adminPlan.editor.defaultCatName"], ages: dictionary["adminPlan.editor.defaultCatAges"], capacity: 20, priceHKD: 0 }],
    published: false,
  };
}

function fromEvent(e: ParkEvent): Draft {
  return {
    slug: e.slug,
    type: e.type,
    title: e.title,
    summary: e.summary,
    body: e.body,
    date: e.date,
    start: e.start,
    end: e.end,
    photoSlot: isPhotoSlot(e.photoSlot) ? e.photoSlot : photoFor[e.type],
    categories: e.categories,
    published: e.published,
  };
}

/** Create or edit an event: English and Chinese side by side, categories, publishing. */
export function EventEditor({
  event, events, now, onClose, onDelete,
}: {
  event: ParkEvent | null; events: ParkEvent[]; now: HKNow; onClose: () => void; onDelete: (e: ParkEvent) => void;
}) {
  const { t, fmt } = useI18n();
  const toast = useToast();
  const avail = useAvailability(now);
  const spots = event ? avail.eventSpots(event) : null;
  const takenFor = (categoryId: string) => spots?.categories.find((c) => c.categoryId === categoryId)?.taken ?? 0;
  const [d, setD] = useState<Draft>(() => (event ? fromEvent(event) : blank(now.date)));
  const [slugTouched, setSlugTouched] = useState(!!event);
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));

  const setTitle = (title: LocalizedText) =>
    setD((x) => ({ ...x, title, slug: slugTouched ? x.slug : uniqueSlug(cleanSlug(title.en || title.zh), events, event?.id) }));
  const setType = (type: EventType) =>
    setD((x) => {
      const [s0, e0] = TYPE_TIMES[x.type];
      const times = x.start === s0 && x.end === e0 ? { start: TYPE_TIMES[type][0], end: TYPE_TIMES[type][1] } : {};
      return { ...x, type, ...times, photoSlot: x.photoSlot === photoFor[x.type] ? photoFor[type] : x.photoSlot };
    });
  const setCat = (id: string, patch: Partial<EventCategory>) => set({ categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCat = () =>
    set({ categories: [...d.categories, { id: uid("cat"), name: { en: "", zh: "" }, ages: { en: "", zh: "" }, capacity: 20, priceHKD: d.categories[d.categories.length - 1]?.priceHKD ?? 0 }] });

  const missing = missingFields(d);
  const incomplete = missing.length > 0;
  const missingList = missing
    .map((m) => t(m.lang === "en" ? "adminPlan.fieldEn" : "adminPlan.fieldZh", { field: t(`adminPlan.field.${m.field}`) }))
    .join(t("adminPlan.listSep"));
  const slug = cleanSlug(d.slug);
  const errors = {
    title: !d.title.en.trim() && !d.title.zh.trim() ? t("adminPlan.editor.errTitle") : undefined,
    time: toMin(d.end) <= toMin(d.start) ? t("adminPlan.errWindow") : undefined,
    slug: events.some((e) => e.id !== event?.id && e.slug === slug) ? t("adminPlan.editor.errSlugTaken") : undefined,
    cat: d.categories.some((c) => !c.name.en.trim() && !c.name.zh.trim()) ? t("adminPlan.editor.errCat") : undefined,
    publish: d.published && incomplete ? t("adminPlan.editor.errPublish") : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (e: string | undefined) => (tried ? e : undefined);

  const save = () => {
    setTried(true);
    if (hasErrors) return;
    const trim = (x: LocalizedText) => ({ en: x.en.trim(), zh: x.zh.trim() });
    const next: ParkEvent = {
      id: event?.id ?? uid("evt"),
      slug,
      type: d.type,
      title: trim(d.title),
      summary: trim(d.summary),
      body: trim(d.body),
      date: d.date,
      start: d.start,
      end: d.end,
      categories: d.categories.map((c) => ({ ...c, name: trim(c.name), ages: trim(c.ages) })),
      published: d.published,
      photoSlot: d.photoSlot,
      createdAt: event?.createdAt ?? new Date().toISOString(),
      userCreated: true,
    };
    saveEvent(next);
    toast(next.published ? t("adminPlan.editor.savedLive") : t("adminPlan.editor.savedDraft"));
    onClose();
  };

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {tried && hasErrors && (
        <p role="alert" className="w-full text-xs font-medium text-state-closed">
          {t("adminPlan.editor.errFix")}
        </p>
      )}
      {event ? (
        <Button
          variant="ghost"
          font="sans"
          onClick={() => onDelete(event)}
          aria-label={t("adminPlan.events.delete")}
          className="px-3 text-state-closed hover:bg-state-closed/10 hover:text-state-closed sm:px-5"
        >
          <Trash className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{t("btn.delete")}</span>
        </Button>
      ) : (
        <span aria-hidden />
      )}
      <div className="flex items-center gap-2">
        <Button variant="ghost" font="sans" onClick={onClose}>
          {t("btn.cancel")}
        </Button>
        <Button font="sans" onClick={save}>
          <Save className="h-4 w-4" aria-hidden />
          {t("adminPlan.editor.save")}
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      wide
      className="sm:max-w-5xl"
      title={event ? t("adminPlan.editor.edit") : t("adminPlan.editor.new")}
      description={t("adminPlan.editor.lead")}
      footer={footer}
    >
      <div className="space-y-8">
        {/* basics */}
        <section aria-labelledby="ev-basics" className="space-y-4">
          <h3 id="ev-basics" className="eyebrow">{t("adminPlan.editor.basics")}</h3>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <RadioChips<EventType>
                name="ev-type"
                legend={t("adminPlan.editor.type")}
                value={d.type}
                onChange={setType}
                options={TYPES.map((type) => ({
                  value: type,
                  label: t(`evtype.${type}`),
                  icon: <span aria-hidden className={cn("h-2 w-2 rotate-45", eventTone[type].dot)} />,
                }))}
              />
              <DateField
                id="ev-date"
                label={t("label.date")}
                value={d.date}
                onChange={(date) => set({ date })}
                min={event && event.date < now.date ? event.date : now.date}
                max={addDays(now.date, 730)}
                today={now.date}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("adminPlan.editor.start")} htmlFor="ev-start">
                  <TimeSelect id="ev-start" value={d.start} options={TIMES} onChange={(start) => set({ start })} invalid={!!errors.time} describedBy={errors.time ? "ev-time-error" : undefined} />
                </Field>
                <Field label={t("adminPlan.editor.end")} htmlFor="ev-end">
                  <TimeSelect id="ev-end" value={d.end} options={TIMES} onChange={(end) => set({ end })} invalid={!!errors.time} describedBy={errors.time ? "ev-time-error" : undefined} />
                </Field>
                {errors.time && <ErrorText id="ev-time-error" className="col-span-2">{errors.time}</ErrorText>}
              </div>
            </div>
            <div className="space-y-3">
              <Field label={t("adminPlan.editor.photo")} htmlFor="ev-photo" hint={t("adminPlan.editor.photoHint")}>
                <Select id="ev-photo" value={d.photoSlot} onChange={(e) => isPhotoSlot(e.target.value) && set({ photoSlot: e.target.value })} aria-describedby="ev-photo-hint">
                  {PHOTO_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {t(`adminPlan.photo.${slot}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Photo slot={d.photoSlot} alt={t(`adminPlan.photo.${d.photoSlot}`)} what={t(`adminPlan.photo.${d.photoSlot}`)} fade="none" sizes="480px" className="h-36 w-full sm:h-40" />
            </div>
          </div>
        </section>

        {/* words, both languages */}
        <section aria-labelledby="ev-words" className="space-y-4">
          <h3 id="ev-words" className="eyebrow">{t("adminPlan.editor.content")}</h3>
          <div aria-hidden className="hidden grid-cols-2 gap-4 border-b border-line pb-2 text-xs font-semibold text-muted md:grid">
            <span>{t("lang.en")}</span>
            <span>{t("lang.zh")}</span>
          </div>
          <BiField id="ev-title" label={t("adminPlan.editor.title")} field="title" value={d.title} onChange={setTitle} error={show(errors.title)} />
          <BiField id="ev-summary" label={t("adminPlan.editor.summary")} field="summary" value={d.summary} onChange={(summary) => set({ summary })} rows={3} hint={t("adminPlan.editor.summaryHint")} />
          <BiField id="ev-body" label={t("adminPlan.editor.body")} field="body" value={d.body} onChange={(body) => set({ body })} rows={7} hint={t("adminPlan.editor.bodyHint")} />
        </section>

        {/* categories */}
        <section aria-labelledby="ev-cats" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 id="ev-cats" className="eyebrow">{t("adminPlan.editor.categories")}</h3>
              <p className="mt-1 text-sm text-muted">{t("adminPlan.editor.categoriesLead")}</p>
            </div>
            <Button variant="subtle" size="sm" font="sans" onClick={addCat}>
              <Plus className="h-4 w-4" aria-hidden />
              {t("adminPlan.editor.catAdd")}
            </Button>
          </div>
          <ol className="space-y-3">
            {d.categories.map((c, i) => {
              const taken = takenFor(c.id);
              const locked = taken > 0;
              const pid = `ev-cat-${c.id}`;
              return (
                <li key={c.id} className="rounded-lg border border-line bg-[#0E0D0D] p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-muted">
                      {t("adminPlan.editor.catLabel", { n: i + 1 })}
                      {locked && ` · ${t("adminPlan.editor.catRegistered", { n: taken })}`}
                    </p>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      font="sans"
                      disabled={locked || d.categories.length === 1}
                      title={locked ? t("adminPlan.editor.catLocked") : undefined}
                      aria-label={t("adminPlan.editor.catRemove", { n: i + 1 })}
                      onClick={() => set({ categories: d.categories.filter((x) => x.id !== c.id) })}
                      className="hover:text-state-closed"
                    >
                      <Trash className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_120px]">
                    {(["name", "ages"] as const).map((key) =>
                      LANGS.map((lang) => {
                        const id = `${pid}-${key}-${lang}`;
                        const other = lang === "en" ? "zh" : "en";
                        const gap = !c[key][lang].trim() && !!c[key][other].trim();
                        return (
                          <div key={id} className="min-w-0 space-y-1">
                            <label htmlFor={id} className="block truncate text-xs font-medium text-muted">
                              {t(key === "name" ? "adminPlan.editor.catName" : "adminPlan.editor.catAges")} · {t(lang === "en" ? "lang.en" : "lang.zh")}
                            </label>
                            <Input
                              id={id}
                              lang={lang === "zh" ? "zh-Hant-HK" : "en"}
                              value={c[key][lang]}
                              onChange={(e) => setCat(c.id, { [key]: { ...c[key], [lang]: e.target.value } })}
                              aria-invalid={tried && key === "name" && !c.name.en.trim() && !c.name.zh.trim() ? true : undefined}
                              className={cn("min-h-10 text-sm", gap && "border-brand-amber/70")}
                            />
                          </div>
                        );
                      }),
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted">{t("adminPlan.editor.catPlaces")}</p>
                      <NumberStepper size="sm" value={c.capacity} onChange={(n) => setCat(c.id, { capacity: n })} min={Math.max(1, taken)} max={500} label={`${t("adminPlan.editor.catLabel", { n: i + 1 })} · ${t("adminPlan.editor.catPlaces")}`} />
                      {locked && c.capacity === taken && <p className="text-[11px] text-muted">{t("adminPlan.editor.catMinPlaces", { n: taken })}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`${pid}-price`} className="block text-xs font-medium text-muted">
                        {t("adminPlan.editor.catPrice")}
                        <Swap />
                      </label>
                      <Input
                        id={`${pid}-price`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={10}
                        value={c.priceHKD}
                        onChange={(e) => setCat(c.id, { priceHKD: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
                        className="min-h-10 text-sm tabular"
                      />
                      {c.priceHKD === 0 && <p className="text-[11px] text-muted">{fmt.money(0)}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {show(errors.cat) && <ErrorText>{errors.cat}</ErrorText>}
        </section>

        {/* link and publishing */}
        <section aria-label={t("adminPlan.editor.publish")} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Field label={t("adminPlan.editor.link")} htmlFor="ev-slug" hint={t("adminPlan.editor.linkHint")} error={errors.slug}>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-line bg-card-2 px-3 text-sm text-muted">/events/</span>
                <Input
                  id="ev-slug"
                  value={d.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set({ slug: e.target.value });
                  }}
                  onBlur={() => set({ slug: cleanSlug(d.slug) })}
                  autoCapitalize="none"
                  spellCheck={false}
                  className="rounded-l-none text-sm"
                  {...describedBy("ev-slug", errors.slug, t("adminPlan.editor.linkHint"))}
                />
              </div>
            </Field>
            {event?.published && (
              <Link href={`/events/${event.slug}`} target="_blank" rel="noopener" className={buttonVariants({ variant: "link", font: "sans", className: "text-sm" })}>
                {t("adminPlan.events.preview")}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">{t("adminPlan.newTab")}</span>
              </Link>
            )}
          </div>
          <div className="space-y-2 rounded-lg border border-line bg-[#0E0D0D] p-3 lg:self-start">
            <Switch
              checked={d.published}
              onChange={(published) => set({ published })}
              disabled={!d.published && incomplete}
              label={t("adminPlan.editor.publish")}
              describedBy="ev-publish-note"
              className="min-h-11"
            >
              {t("adminPlan.editor.publish")}
            </Switch>
            <div id="ev-publish-note">
              {incomplete ? <Warn>{t("adminPlan.editor.cantPublish", { list: missingList })}</Warn> : <p className="text-xs text-muted">{t("adminPlan.editor.publishHint")}</p>}
            </div>
            {show(errors.publish) && <ErrorText>{errors.publish}</ErrorText>}
          </div>
        </section>
      </div>
    </Sheet>
  );
}

/** One field in both languages, side by side from tablet up, with a warning when one side is empty. */
function BiField({
  id, label, field, value, onChange, rows, hint, error,
}: {
  id: string; label: string; field: "title" | "summary" | "body"; value: LocalizedText; onChange: (v: LocalizedText) => void; rows?: number; hint?: string; error?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {LANGS.map((lang) => {
          const fid = `${id}-${lang}`;
          const other = lang === "en" ? "zh" : "en";
          const gap = !value[lang].trim() && !!value[other].trim();
          const note = gap ? `${fid}-missing` : undefined;
          const common = {
            id: fid,
            lang: lang === "zh" ? "zh-Hant-HK" : "en",
            value: value[lang],
            "aria-invalid": error ? true : undefined,
            "aria-describedby": [note, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined,
            className: cn(gap && "border-brand-amber/70", rows && "min-h-0 text-sm"),
          } as const;
          return (
            <div key={lang} className="min-w-0 space-y-1.5">
              <label htmlFor={fid} className="flex items-baseline gap-2 text-sm font-medium">
                {label}
                <span className="text-xs font-normal text-muted">{t(lang === "en" ? "lang.en" : "lang.zh")}</span>
              </label>
              {rows ? (
                <Textarea {...common} rows={rows} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} />
              ) : (
                <Input {...common} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} />
              )}
              {gap && (
                <Warn id={note}>
                  {t("adminPlan.editor.missing", { what: t(lang === "en" ? "adminPlan.fieldEn" : "adminPlan.fieldZh", { field: t(`adminPlan.field.${field}`) }) })}
                </Warn>
              )}
            </div>
          );
        })}
      </div>
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : hint ? <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
