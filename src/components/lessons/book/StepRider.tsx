"use client";

import { Bike, Info, Ticket } from "lucide-react";
import { site } from "@/config/site";
import { lessons, pack5 } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import { BIKE_SIZES } from "@/lib/sizing";
import type { BikeSize, Experience, PackHolding } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, Input, OptionCards, PhoneInput, Select, describedBy } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { InlineAlert, ToggleCard, optionFocus } from "./bits";
import { EXPERIENCE, type Draft } from "./draft";

export type RiderErrors = Partial<Record<"name" | "phone" | "age" | "height" | "experience", string>>;

/** Rider details, live bike-size suggestion, gear hire and pack credit. */
export function StepRider({
  draft, patch, errors, suggested, bikeSize, pack, minor, prefilled, notice, onSwitchFoundation,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  /** only filled once the rider has pressed Continue on this step */
  errors: RiderErrors;
  suggested: BikeSize | null;
  bikeSize: BikeSize | null;
  /** a pack on this phone number that covers this class (not offered while buying a new pack) */
  pack?: PackHolding;
  minor: boolean;
  prefilled: boolean;
  notice: string | null;
  onSwitchFoundation: () => void;
}) {
  const { t, l, fmt } = useI18n();
  const lesson = lessons[draft.lessonId];
  const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
  const ageHint = minor ? t("lessons.rider.minor") : t("lessons.rider.ageHint", { lesson: l(lesson.name), n: lesson.minAge });
  const heightHint = t("label.heightHint");

  return (
    <div className="max-w-2xl space-y-9">
      {notice && <InlineAlert title={t("lessons.pay.errorTitle")}>{notice}</InlineAlert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("label.name")} htmlFor="rider-name" error={errors.name} className="sm:col-span-2">
          <Input
            id="rider-name"
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
            autoComplete="name"
            enterKeyHint="next"
            {...describedBy("rider-name", errors.name)}
          />
        </Field>
        <Field label={t("label.phone")} htmlFor="rider-phone" error={errors.phone} hint={t("label.phoneHint")}>
          <PhoneInput
            id="rider-phone"
            value={draft.phone}
            onChange={(e) => patch({ phone: e.target.value.replace(/[^\d\s+]/g, "").slice(0, 16) })}
            placeholder="9123 4567"
            enterKeyHint="next"
            {...describedBy("rider-phone", errors.phone, t("label.phoneHint"))}
          />
        </Field>
        <Field
          label={t("label.age")}
          htmlFor="rider-age"
          error={errors.age}
          hint={ageHint}
        >
          <Input
            id="rider-age"
            inputMode="numeric"
            pattern="[0-9]*"
            value={draft.age}
            onChange={(e) => patch({ age: digits(e.target.value, 2) })}
            enterKeyHint="next"
            {...describedBy("rider-age", errors.age, ageHint)}
          />
        </Field>
        <Field label={t("label.height")} htmlFor="rider-height" error={errors.height} hint={heightHint}>
          <Input
            id="rider-height"
            inputMode="numeric"
            pattern="[0-9]*"
            value={draft.height}
            onChange={(e) => patch({ height: digits(e.target.value, 3) })}
            enterKeyHint="done"
            {...describedBy("rider-height", errors.height, heightHint)}
          />
        </Field>
        <div aria-live="polite" className="flex items-start gap-3 rounded-lg border border-line bg-card px-4 py-3 sm:mt-7 sm:self-start">
          <Bike aria-hidden className={cn("mt-0.5 h-5 w-5 shrink-0", suggested ? "text-fg" : "text-muted")} />
          {suggested ? (
            <p className="text-sm">
              <span className="block font-semibold">{t("lessons.rider.sizeTitle", { size: t(`size.${suggested}`) })}</span>
              <span className="mt-0.5 block text-xs text-muted">{t("lessons.rider.sizeWhy", { cm: draft.height })}</span>
            </p>
          ) : (
            <p className="text-sm text-muted">{t("lessons.rider.sizeWait")}</p>
          )}
        </div>
      </div>

      <div>
        <OptionCards<Experience>
          name="rider-exp"
          legend={t("label.experience")}
          value={draft.experience ?? undefined}
          onChange={(experience) => patch({ experience })}
          columns={2}
          className={optionFocus}
          options={EXPERIENCE.map((e) => ({ value: e, title: t(`exp.${e}`) }))}
        />
        {errors.experience && (
          <p id="rider-exp-error" role="alert" className="mt-1.5 text-xs font-medium text-state-closed">
            {errors.experience}
          </p>
        )}
        {draft.lessonId === "advanced" && draft.experience === "new" && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-brand-amber/40 bg-brand-amber/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2.5 text-sm text-fg/90">
              <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
              {t("lessons.rider.advWarn")}
            </p>
            <Button variant="secondary" font="sans" className="shrink-0" onClick={onSwitchFoundation}>
              {t("lessons.rider.switch")}
            </Button>
          </div>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("label.rentals")}</legend>
        <div className="space-y-2">
          <ToggleCard
            id="rent-bike"
            checked={draft.rentBike}
            onChange={(rentBike) => patch({ rentBike })}
            title={t("book.rent.bike")}
            detail={t("book.rent.perBike", { price: fmt.money(site.prices.bikeRental) })}
          >
            {draft.rentBike ? (
              <Field label={t("size.label")} htmlFor="rent-size">
                <Select id="rent-size" value={bikeSize ?? ""} onChange={(e) => patch({ bikeSize: e.target.value as BikeSize })}>
                  {!bikeSize && (
                    <option value="" disabled>
                      {t("size.label")}
                    </option>
                  )}
                  {BIKE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s === suggested ? t("lessons.rent.suggestedOpt", { size: t(`size.${s}`) }) : t(`size.${s}`)}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
          </ToggleCard>
          <ToggleCard
            id="rent-helmet"
            checked={draft.rentHelmet}
            onChange={(rentHelmet) => patch({ rentHelmet })}
            title={t("book.rent.helmet")}
            detail={t("book.rent.perHelmet", { price: fmt.money(site.prices.helmetRental) })}
          />
        </div>
      </fieldset>

      {draft.buyPack ? (
        <p className="flex items-start gap-3 rounded-lg border border-line bg-card px-4 py-3 text-sm text-fg/90">
          <Ticket aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          {t("lessons.pack.buying", { n: pack5.classes - 1 })}
        </p>
      ) : pack ? (
        <ToggleCard
          id="use-pack"
          checked={draft.usePack}
          onChange={(usePack) => patch({ usePack })}
          title={t("lessons.pack.use", { n: pack.remaining })}
          detail={t("lessons.pack.useDetail", { lesson: l(lesson.name), date: fmt.date(pack.expiresOn) })}
        />
      ) : null}

      <p className="text-xs text-muted">{prefilled ? `${t("lessons.rider.prefilled")} ${t("book.saved")}` : t("book.saved")}</p>
    </div>
  );
}
