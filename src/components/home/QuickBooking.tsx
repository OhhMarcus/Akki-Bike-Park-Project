"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { experiences } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { getSlot } from "@/lib/availability";
import { hkToday } from "@/lib/dates";
import { useBookings, useHydrated, useOverrides } from "@/lib/store";
import type { DayPeriod, ExperienceId } from "@/types";

const options = experiences.filter((e) => e.id !== "event");

export function QuickBooking() {
  const { t, l } = useI18n();
  const router = useRouter();
  const hydrated = useHydrated();
  const [bookings] = useBookings();
  const [overrides] = useOverrides();
  const [expId, setExpId] = useState<ExperienceId>("beginner");
  const [dateInput, setDateInput] = useState("");
  const [periodInput, setPeriodInput] = useState<DayPeriod>("morning");
  const [riders, setRiders] = useState(1);
  const [error, setError] = useState("");

  const exp = options.find((e) => e.id === expId) ?? options[0];
  const today = hydrated ? hkToday() : "";
  const date = dateInput || today;
  const period = exp.periods.includes(periodInput) ? periodInput : exp.periods[0];
  const count = Math.min(exp.maxParticipants, Math.max(exp.minParticipants, riders));

  const changeExp = (id: ExperienceId) => {
    setExpId(id);
    const next = options.find((e) => e.id === id);
    if (next) setRiders((r) => Math.min(next.maxParticipants, Math.max(next.minParticipants, r)));
  };

  let hint = "";
  if (!hydrated) hint = t("home.qb.hintLoading");
  else if (exp.quoteOnly) hint = t("home.qb.quoteOnly");
  else if (date && date >= today) {
    const slot = getSlot(date, period, bookings, overrides);
    if (slot.status === "closed") hint = t("home.qb.hintClosed");
    else if (slot.status === "full") hint = t("home.qb.hintFull");
    else if (slot.remaining < count) hint = t("home.qb.hintFew", { n: slot.remaining, riders: count });
    else hint = t("home.qb.hintOk", { n: slot.remaining });
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || date < hkToday()) {
      setError(t("home.qb.pastDate"));
      return;
    }
    setError("");
    router.push(`/booking?exp=${encodeURIComponent(exp.id)}&date=${encodeURIComponent(date)}`);
  };

  return (
    <section aria-labelledby="home-qb-title" className="container relative z-10 -mt-6">
      <form onSubmit={submit} noValidate className="surface space-y-5 p-5 shadow-2xl shadow-black/40 md:p-6">
        <h2 id="home-qb-title" className="font-display text-xl font-bold uppercase tracking-tight">
          {t("home.qb.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t("home.qb.experience")} htmlFor="qb-exp">
            <Select id="qb-exp" value={exp.id} onChange={(e) => changeExp(e.target.value as ExperienceId)}>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {l(o.name)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("home.qb.date")} htmlFor="qb-date" error={error}>
            <Input id="qb-date" type="date" min={today || undefined} value={date} onChange={(e) => { setDateInput(e.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "qb-date-error" : undefined} />
          </Field>
          <Field label={t("home.qb.period")} htmlFor="qb-period">
            <Select id="qb-period" value={period} onChange={(e) => setPeriodInput(e.target.value as DayPeriod)}>
              {exp.periods.map((p) => (
                <option key={p} value={p}>
                  {t(`period.${p}`)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="space-y-1.5">
            <span id="qb-riders-label" className="block text-sm font-medium">{t("home.qb.riders")}</span>
            <div role="group" aria-labelledby="qb-riders-label" className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="icon" aria-label={t("home.qb.fewer")} disabled={count <= exp.minParticipants} onClick={() => setRiders(count - 1)}>
                <Minus className="h-4 w-4" aria-hidden />
              </Button>
              <output aria-live="polite" className="min-w-10 flex-1 text-center text-lg font-semibold tabular-nums">{count}</output>
              <Button type="button" variant="secondary" size="icon" aria-label={t("home.qb.more")} disabled={count >= exp.maxParticipants} onClick={() => setRiders(count + 1)}>
                <Plus className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p aria-live="polite" className="min-h-5 text-sm text-silver">{hint}</p>
          <Button type="submit" size="lg" className="w-full md:w-auto">
            {t("home.qb.cta")}
          </Button>
        </div>
      </form>
    </section>
  );
}
