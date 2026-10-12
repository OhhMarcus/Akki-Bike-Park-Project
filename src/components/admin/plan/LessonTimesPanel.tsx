"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { coachById, coaches, lessonList, lessons } from "@/content/catalogue";
import { Swap } from "@/components/brand/Swap";
import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Field, OptionCards, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { ConfirmDialog, Sheet } from "@/components/ui/sheet";
import { NumberStepper } from "@/components/ui/stepper";
import { useToast } from "@/components/ui/toast";
import { useBookings, useSettings } from "@/lib/hooks";
import { parseTargetId } from "@/lib/schedule";
import { updateSettings } from "@/lib/services";
import { fromMin, overlaps, toMin, weekdayOf, type HKNow } from "@/lib/time";
import { cn, uid } from "@/lib/utils";
import type { Booking, HHmm, LessonId, LessonTemplate, TeachingLanguage } from "@/types";
import { ErrorText, Panel, Switch, TimeSelect, Warn, halfHours, tally, upcomingFrom } from "./ui";

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const LESSON_STARTS = halfHours(7 * 60, 21 * 60);
const tplKey = (lessonId: LessonId, weekday: number, start: HHmm) => `${lessonId}|${weekday}|${start}`;
const endOf = (tpl: Pick<LessonTemplate, "lessonId" | "start">) => fromMin(toMin(tpl.start) + lessons[tpl.lessonId].durationMin);
const sortTemplates = (a: LessonTemplate, b: LessonTemplate) =>
  ORDER.indexOf(a.weekday) - ORDER.indexOf(b.weekday) || toMin(a.start) - toMin(b.start) || a.lessonId.localeCompare(b.lessonId);

/** Upcoming confirmed lesson bookings, grouped by class + weekday + start. */
function useAhead(now: HKNow) {
  const [bookings] = useBookings();
  return useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (b.kind !== "lesson" || b.status !== "confirmed" || !upcomingFrom(b, now)) continue;
      const ref = parseTargetId(b.targetId);
      if (ref?.kind !== "lesson") continue;
      const k = tplKey(ref.lessonId, weekdayOf(ref.date), ref.start);
      map.set(k, [...(map.get(k) ?? []), b]);
    }
    return (tpl: Pick<LessonTemplate, "lessonId" | "weekday" | "start">) => map.get(tplKey(tpl.lessonId, tpl.weekday, tpl.start)) ?? [];
  }, [bookings, now]);
}

export function LessonTimesPanel({ now }: { now: HKNow }) {
  const { t, tn, l, fmt } = useI18n();
  const toast = useToast();
  const [settings] = useSettings();
  const ahead = useAhead(now);
  const templates = useMemo(() => [...settings.lessonTemplates].sort(sortTemplates), [settings.lessonTemplates]);
  const [editing, setEditing] = useState<LessonTemplate | "new" | null>(null);
  const [deleting, setDeleting] = useState<LessonTemplate | null>(null);
  const [pausing, setPausing] = useState<LessonTemplate | null>(null);

  const nameOf = (tpl: LessonTemplate) => l(lessons[tpl.lessonId].name);
  const whenOf = (tpl: LessonTemplate) => `${fmt.weekday(tpl.weekday, "long")} ${fmt.timeRange(tpl.start, endOf(tpl))}`;
  const countText = (list: Booking[]) => {
    const c = tally(list);
    return t("adminPlan.withRiders", { bookings: tn("adminPlan.bookings", c.bookings), riders: tn("riders.count", c.riders) });
  };

  const setActive = (tpl: LessonTemplate, active: boolean) => {
    updateSettings((s) => ({ ...s, lessonTemplates: s.lessonTemplates.map((x) => (x.id === tpl.id ? { ...x, active } : x)) }));
    toast(active ? t("adminPlan.lessons.resumedToast") : t("adminPlan.lessons.pausedToast"));
  };
  const toggle = (tpl: LessonTemplate, active: boolean) => {
    if (!active && ahead(tpl).length) setPausing(tpl);
    else setActive(tpl, active);
  };

  const actions = (tpl: LessonTemplate) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="iconSm" font="sans" onClick={() => setEditing(tpl)} aria-label={t("adminPlan.lessons.editLabel", { name: nameOf(tpl), when: whenOf(tpl) })}>
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>
      <Button variant="ghost" size="iconSm" font="sans" onClick={() => setDeleting(tpl)} aria-label={t("adminPlan.lessons.deleteLabel", { name: nameOf(tpl), when: whenOf(tpl) })} className="hover:text-state-closed">
        <Trash className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );

  const activeSwitch = (tpl: LessonTemplate) => (
    <Switch checked={tpl.active} onChange={(v) => toggle(tpl, v)} label={t("adminPlan.lessons.activeToggle", { name: nameOf(tpl), when: whenOf(tpl) })}>
      <span className={tpl.active ? "text-fg" : "text-muted"}>{tpl.active ? t("adminPlan.lessons.active") : t("adminPlan.lessons.paused")}</span>
    </Switch>
  );

  return (
    <Panel
      id="lessons"
      title={t("adminPlan.lessons.title")}
      lead={t("adminPlan.lessons.lead", { duration: fmt.duration(lessons.foundation.durationMin) })}
      actions={
        <Button variant="subtle" font="sans" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" aria-hidden />
          {t("adminPlan.lessons.add")}
        </Button>
      }
    >
      {templates.length === 0 ? (
        <EmptyState title={t("adminPlan.lessons.emptyTitle")} body={t("adminPlan.lessons.emptyBody")} />
      ) : (
        <>
          <table className="hidden w-full border-collapse text-sm md:table">
            <caption className="sr-only">{t("adminPlan.lessons.title")}</caption>
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th scope="col" className="py-2 pr-3 font-semibold">{t("adminPlan.lessons.colClass")}</th>
                <th scope="col" className="px-3 py-2 font-semibold">{t("adminPlan.lessons.colWhen")}</th>
                <th scope="col" className="px-3 py-2 font-semibold">{t("label.language")}</th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  {t("label.coach")}
                  <Swap />
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">{t("label.groupSize")}</th>
                <th scope="col" className="px-3 py-2 font-semibold">{t("adminPlan.lessons.colActive")}</th>
                <th scope="col" className="py-2 pl-3 text-right font-semibold"><span className="sr-only">{t("adminPlan.lessons.colActions")}</span></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => {
                const n = ahead(tpl).length;
                const coach = coachById(tpl.coachId);
                return (
                  <tr key={tpl.id} className={cn("border-b border-line/70 last:border-0", !tpl.active && "text-muted")}>
                    <td className="py-3 pr-3 align-top">
                      <p className="font-semibold">{nameOf(tpl)}</p>
                      <p className="text-xs text-muted">{tn("adminPlan.lessons.ahead", n)}</p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p>{t("adminPlan.lessons.every", { day: fmt.weekday(tpl.weekday, "long") })}</p>
                      <p className="whitespace-nowrap tabular text-xs text-muted">{fmt.timeRange(tpl.start, endOf(tpl))}</p>
                    </td>
                    <td className="px-3 py-3 align-top">{t(`tlang.${tpl.language}`)}</td>
                    <td className="px-3 py-3 align-top">{coach ? l(coach.name) : "—"}</td>
                    <td className="px-3 py-3 align-top tabular">{t("spots.max", { n: tpl.capacity })}</td>
                    <td className="px-3 py-2 align-top">{activeSwitch(tpl)}</td>
                    <td className="py-2 pl-3 align-top">{actions(tpl)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ul className="space-y-2 md:hidden">
            {templates.map((tpl) => {
              const coach = coachById(tpl.coachId);
              return (
                <li key={tpl.id} className={cn("rounded-lg border border-line bg-[#0E0D0D] p-3", !tpl.active && "text-muted")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{nameOf(tpl)}</p>
                      <p className="text-sm">
                        {t("adminPlan.lessons.every", { day: fmt.weekday(tpl.weekday, "long") })} · <span className="whitespace-nowrap tabular">{fmt.timeRange(tpl.start, endOf(tpl))}</span>
                      </p>
                    </div>
                    {actions(tpl)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Chip>{t(`tlang.${tpl.language}`)}</Chip>
                    <Chip>
                      {coach ? l(coach.name) : "—"}
                      <Swap className="ml-1" />
                    </Chip>
                    <Chip>{t("spots.max", { n: tpl.capacity })}</Chip>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-2">
                    {activeSwitch(tpl)}
                    <span className="text-xs text-muted">{tn("adminPlan.lessons.ahead", ahead(tpl).length)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {editing && (
        <TemplateSheet
          key={editing === "new" ? "new" : editing.id}
          template={editing === "new" ? null : editing}
          templates={settings.lessonTemplates}
          aheadOf={ahead}
          countText={countText}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("adminPlan.lessons.deleteTitle")}
        danger
        confirmLabel={t("btn.delete")}
        onConfirm={() => {
          if (!deleting) return;
          updateSettings((s) => ({ ...s, lessonTemplates: s.lessonTemplates.filter((x) => x.id !== deleting.id) }));
          toast(t("adminPlan.lessons.deleted"));
        }}
        body={
          deleting && (
            <div className="space-y-2">
              <p>{t("adminPlan.lessons.deleteBody", { name: nameOf(deleting), when: whenOf(deleting) })}</p>
              {ahead(deleting).length > 0 && <Warn className="text-sm">{t("adminPlan.lessons.bookedOn", { count: countText(ahead(deleting)) })}</Warn>}
            </div>
          )
        }
      />

      <ConfirmDialog
        open={!!pausing}
        onOpenChange={(o) => !o && setPausing(null)}
        title={t("adminPlan.lessons.pauseTitle")}
        confirmLabel={t("adminPlan.lessons.pause")}
        onConfirm={() => pausing && setActive(pausing, false)}
        body={
          pausing && (
            <div className="space-y-2">
              <p>{t("adminPlan.lessons.pauseBody", { name: nameOf(pausing), when: whenOf(pausing) })}</p>
              <Warn className="text-sm">{t("adminPlan.lessons.bookedOn", { count: countText(ahead(pausing)) })}</Warn>
            </div>
          )
        }
      />
    </Panel>
  );
}

type Form = Omit<LessonTemplate, "id">;

function TemplateSheet({
  template, templates, aheadOf, countText, onClose,
}: {
  template: LessonTemplate | null;
  templates: LessonTemplate[];
  aheadOf: (tpl: Pick<LessonTemplate, "lessonId" | "weekday" | "start">) => Booking[];
  countText: (list: Booking[]) => string;
  onClose: () => void;
}) {
  const { t, l, fmt } = useI18n();
  const toast = useToast();
  const [f, setF] = useState<Form>(() =>
    template
      ? { lessonId: template.lessonId, weekday: template.weekday, start: template.start, language: template.language, coachId: template.coachId, capacity: template.capacity, active: template.active }
      : { lessonId: "foundation", weekday: 6, start: "10:00", language: "yue", coachId: coaches[0].id, capacity: lessons.foundation.capacity, active: true },
  );
  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));
  const lesson = lessons[f.lessonId];
  const end = endOf(f);
  const others = templates.filter((x) => x.id !== template?.id);
  const duplicate = others.find((x) => x.lessonId === f.lessonId && x.weekday === f.weekday && x.start === f.start);
  const overlap = others.filter(
    (x) => x !== duplicate && x.active && x.weekday === f.weekday && overlaps(toMin(f.start), toMin(end), toMin(x.start), toMin(endOf(x))),
  );
  const moved = template && (template.lessonId !== f.lessonId || template.weekday !== f.weekday || template.start !== f.start) ? aheadOf(template) : [];

  const save = () => {
    if (duplicate) return;
    updateSettings((s) => ({
      ...s,
      lessonTemplates: template
        ? s.lessonTemplates.map((x) => (x.id === template.id ? { ...f, id: template.id } : x))
        : [...s.lessonTemplates, { ...f, id: uid("tpl") }],
    }));
    toast(template ? t("adminPlan.lessons.saved") : t("adminPlan.lessons.added"));
    onClose();
  };

  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={template ? t("adminPlan.lessons.sheetEdit") : t("adminPlan.lessons.sheetNew")}
      description={t("adminPlan.lessons.sheetLead")}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" font="sans" onClick={onClose}>
            {t("btn.cancel")}
          </Button>
          <Button font="sans" onClick={save} disabled={!!duplicate}>
            {t("adminPlan.lessons.save")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <OptionCards<LessonId>
          name="tpl-lesson"
          legend={t("adminPlan.lessons.class")}
          value={f.lessonId}
          onChange={(v) => set({ lessonId: v, capacity: template ? f.capacity : lessons[v].capacity })}
          options={lessonList.map((x) => ({ value: x.id, title: l(x.name), detail: `${t(`level.${x.level}`)} · ${fmt.duration(x.durationMin)}` }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("adminPlan.lessons.day")} htmlFor="tpl-day">
            <Select id="tpl-day" value={String(f.weekday)} onChange={(e) => set({ weekday: Number(e.target.value) })}>
              {ORDER.map((wd) => (
                <option key={wd} value={wd}>
                  {fmt.weekday(wd, "long")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("adminPlan.lessons.start")} htmlFor="tpl-start">
            <TimeSelect id="tpl-start" value={f.start} options={LESSON_STARTS} onChange={(v) => set({ start: v })} invalid={!!duplicate} describedBy={duplicate ? "tpl-clash" : undefined} />
          </Field>
        </div>
        <div className="-mt-2 space-y-1.5">
          <p className="text-xs text-muted">{t("adminPlan.lessons.ends", { time: fmt.time(end), duration: fmt.duration(lesson.durationMin) })}</p>
          {duplicate && <ErrorText id="tpl-clash">{t("adminPlan.lessons.errDuplicate", { name: l(lesson.name) })}</ErrorText>}
          {overlap.map((x) => (
            <Warn key={x.id}>{t("adminPlan.lessons.warnOverlap", { name: l(lessons[x.lessonId].name), time: fmt.timeRange(x.start, endOf(x)) })}</Warn>
          ))}
          {moved.length > 0 && <Warn>{t("adminPlan.lessons.warnMove", { count: countText(moved) })}</Warn>}
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium">{t("label.language")}</p>
          <Segmented<TeachingLanguage>
            label={t("label.language")}
            value={f.language}
            onChange={(v) => set({ language: v })}
            options={[{ value: "yue", label: t("tlang.yue") }, { value: "en", label: t("tlang.en") }]}
            className="w-full"
          />
        </div>
        <Field label={t("label.coach")} htmlFor="tpl-coach" hint={t("adminPlan.lessons.coachHint")}>
          <Select id="tpl-coach" value={f.coachId} onChange={(e) => set({ coachId: e.target.value })} aria-describedby="tpl-coach-hint">
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {l(c.name)} · {l(c.role)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-sm font-medium">{t("label.groupSize")}</p>
            <NumberStepper value={f.capacity} onChange={(n) => set({ capacity: n })} min={1} max={16} label={t("label.groupSize")} />
          </div>
          <Switch checked={f.active} onChange={(v) => set({ active: v })} label={t("adminPlan.lessons.showOnSite")} className="min-h-11">
            {t("adminPlan.lessons.showOnSite")}
          </Switch>
        </div>
      </div>
    </Sheet>
  );
}
