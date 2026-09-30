"use client";

import { Bike, Briefcase, CalendarDays, GraduationCap, Smile, Sprout, Target, Tent, Users } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { Field, Select } from "@/components/ui/input";
import { experiences } from "@/config/pricing";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { ExperienceId, ParkEvent } from "@/types";

const icons: Record<string, typeof Bike> = { Bike, Sprout, Target, Smile, Tent, Users, GraduationCap, Briefcase, CalendarDays };

export function StepExperience({ experienceId, eventId, events, error, onSelect, onEvent }: {
  experienceId?: ExperienceId;
  eventId?: string;
  events: ParkEvent[];
  error?: string;
  onSelect: (id: ExperienceId) => void;
  onEvent: (id: string) => void;
}) {
  const { t, l, money, date } = useI18n();
  return (
    <div className="space-y-6">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {experiences.map((e) => {
          const Icon = icons[e.icon] ?? Bike;
          const selected = experienceId === e.id;
          return (
            <li key={e.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(e.id)}
                className={cn("flex h-full min-h-11 w-full flex-col gap-3 rounded-lg border p-4 text-left", selected ? "border-bone bg-graphite-800" : "border-graphite-700 bg-graphite-900 hover:bg-graphite-800")}
              >
                <span className="flex items-start justify-between gap-2">
                  <Icon className="h-6 w-6 text-silver" aria-hidden />
                  {selected && <span className="rounded-full bg-bone px-2 py-0.5 text-xs font-semibold text-ink">{t("booking.selected")}</span>}
                </span>
                <span className="font-display text-xl font-bold uppercase leading-tight">{l(e.name)}</span>
                <span className="text-sm text-silver">{l(e.blurb)}</span>
                <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-sm">
                  <DifficultyBadge level={e.level} />
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    {e.id === "event" ? t("booking.priceVaries") : <>{t("label.from")} {money(e.priceHKD)} <span className="font-normal text-silver-dim">{t("label.perPerson")}</span></>}
                    <DemoTag />
                  </span>
                </span>
                {e.minParticipants > 1 && <span className="text-xs text-silver-dim">{t("booking.minRiders", { n: e.minParticipants })}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {experienceId === "event" && (
        <div className="surface space-y-2 p-4">
          <Field label={t("booking.chooseEvent")} htmlFor="event-select" error={error} hint={events.length ? undefined : t("booking.noEvents")}>
            <Select id="event-select" value={eventId ?? ""} onChange={(e) => onEvent(e.target.value)} aria-invalid={!!error}>
              <option value="">{t("booking.chooseEventPlaceholder")}</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{date(ev.date)} · {l(ev.title)}</option>)}
            </Select>
          </Field>
        </div>
      )}
      {experienceId !== "event" && error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
