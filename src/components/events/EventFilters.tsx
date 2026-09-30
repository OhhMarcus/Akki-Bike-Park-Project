"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { useI18n } from "@/i18n/provider";
import { eventTypes } from "@/content/events";
import type { EventType, Level } from "@/types";

export type WhenFilter = "upcoming" | "week" | "month" | "custom";
export type Filters = { type: EventType | "all"; level: Level | "all"; age: number | null; when: WhenFilter; from: string };
export const defaultFilters: Filters = { type: "all", level: "all", age: null, when: "upcoming", from: "" };

const ages = Array.from({ length: 13 }, (_, i) => i + 5); // 5..17

export function EventFilters({ value, onChange, showWhen, dirty }: { value: Filters; onChange: (f: Filters) => void; showWhen: boolean; dirty: boolean }) {
  const { t } = useI18n();
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...value, [k]: v });
  return (
    <div role="group" aria-label={t("events.filter.label")} className="space-y-4">
      <div role="group" aria-label={t("events.filter.type")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {(["all", ...eventTypes] as const).map((ty) => {
          const on = value.type === ty;
          return (
            <button
              key={ty}
              type="button"
              aria-pressed={on}
              onClick={() => set("type", ty)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-silver ${on ? "border-bone bg-bone text-ink" : "border-graphite-600 text-silver hover:bg-graphite-800"}`}
            >
              {ty === "all" ? t("label.all") : t(`evtype.${ty}`)}
            </button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={t("events.filter.level")} htmlFor="ev-level">
          <Select id="ev-level" value={value.level} onChange={(e) => set("level", e.target.value as Filters["level"])}>
            <option value="all">{t("label.all")}</option>
            <option value="beginner">{t("level.beginner")}</option>
            <option value="intermediate">{t("level.intermediate")}</option>
            <option value="advanced">{t("level.advanced")}</option>
          </Select>
        </Field>
        <Field label={t("events.filter.age")} htmlFor="ev-age">
          <Select id="ev-age" value={value.age ?? ""} onChange={(e) => set("age", e.target.value === "" ? null : Number(e.target.value))}>
            <option value="">{t("events.filter.anyAge")}</option>
            {ages.map((a) => (
              <option key={a} value={a}>{t("events.filter.ageN", { n: a })}</option>
            ))}
            <option value={18}>{t("events.filter.age18")}</option>
          </Select>
        </Field>
        {showWhen && (
          <Field label={t("events.filter.when")} htmlFor="ev-when">
            <Select id="ev-when" value={value.when} onChange={(e) => set("when", e.target.value as WhenFilter)}>
              <option value="upcoming">{t("events.filter.upcoming")}</option>
              <option value="week">{t("events.filter.week")}</option>
              <option value="month">{t("events.filter.month")}</option>
              <option value="custom">{t("events.filter.custom")}</option>
            </Select>
          </Field>
        )}
        {showWhen && value.when === "custom" && (
          <Field label={t("events.filter.from")} htmlFor="ev-from">
            <Input id="ev-from" type="date" value={value.from} onChange={(e) => set("from", e.target.value)} />
          </Field>
        )}
      </div>
      {dirty && (
        <Button variant="ghost" onClick={() => onChange(defaultFilters)}>
          {t("btn.clear")}
        </Button>
      )}
    </div>
  );
}
