"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/config/site";
import type { MessageKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/provider";
import { useSavedRider } from "@/lib/hooks";
import { normalizeHKPhone, waLink } from "@/lib/phone";
import { submitClubApplication } from "@/lib/services";
import { validate } from "@/lib/validation";
import type { Experience } from "@/types";
import { Headline } from "@/components/brand/Headline";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, OptionCards, PhoneInput, describedBy } from "@/components/ui/field";

type Form = { name: string; phone: string; email: string; age: string; level?: Experience; consent: boolean };
type Key = keyof Form;

const EMPTY: Form = { name: "", phone: "", email: "", age: "", level: undefined, consent: false };
const LEVELS: Experience[] = ["new", "some", "regular", "racer"];
const AGE = { min: 4, max: 90 };
/** Visual order of the fields, so the first error gets focus. */
const ORDER: Key[] = ["name", "phone", "email", "age", "level", "consent"];

function check(f: Form): Partial<Record<Key, MessageKey>> {
  return {
    name: validate.name(f.name),
    phone: validate.phone(f.phone),
    email: validate.email(f.email),
    age: validate.age(f.age, AGE.min, AGE.max),
    level: f.level ? undefined : "club.val.level",
    consent: f.consent ? undefined : "val.consent",
  };
}

/** Focus a field and centre it, so its label never hides under the sticky header. */
function focusField(k: Key) {
  const el =
    k === "level"
      ? document.querySelector<HTMLInputElement>('input[name="club-level"]')
      : document.getElementById(`club-${k}`);
  if (!el) return;
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "center", behavior: "smooth" });
}

/** AKKI Bike Club application: validates inline, writes through submitClubApplication, then shows next steps. */
export function JoinForm() {
  const { t } = useI18n();
  const [saved, setSaved] = useSavedRider();
  const [form, setForm] = useState<Form>(EMPTY);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ name: string; phone: string } | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // Prefill from a booking made earlier on this device.
  useEffect(() => {
    if (saved) setForm((f) => (f.name || f.phone ? f : { ...f, name: saved.name, phone: saved.phone.replace(/^\+852\s?/, "") }));
  }, [saved]);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const keys = tried ? check(form) : {};
  const err = (k: Key) => {
    const key = keys[k];
    return key ? t(key, AGE) : undefined;
  };
  const set = <K extends Key>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    const found = check(form);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      focusField(first);
      return;
    }
    const phone = normalizeHKPhone(form.phone) ?? form.phone;
    const name = form.name.trim();
    submitClubApplication({ name, phone, email: form.email.trim(), age: Number(form.age), level: form.level as Experience });
    setSaved({ name, phone });
    setDone({ name, phone });
  };

  const again = () => {
    setForm(EMPTY);
    setTried(false);
    setDone(null);
    requestAnimationFrame(() => focusField("name"));
  };

  if (done) {
    const name = done.name.replace(/\*/g, "");
    return (
      <div className="surface animate-fade-up p-6 sm:p-8">
        <div ref={doneRef} tabIndex={-1} className="scroll-mt-24 rounded-md outline-none">
          <Headline as="h2" text={t("club.done.title", { name })} className="text-4xl [overflow-wrap:anywhere] sm:text-5xl" />
        </div>
        <p className="mt-5 text-fg/85">{t("club.done.body")}</p>
        <ol className="mt-4 space-y-3">
          {[t("club.done.step1"), t("club.done.step2", { phone: done.phone }), t("club.done.step3")].map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-card-2 font-display text-lg font-extrabold italic leading-none [font-synthesis:none]">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-md border border-dashed border-brand-amber/50 bg-brand-amber/5 px-3 py-2 text-xs text-brand-amber">{t("club.done.demo")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={waLink(site.whatsapp.display, t("club.done.waPrefill", { name }))}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "lg" })}
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t("book.done.whatsapp")}
            <span className="sr-only">{t("visit.newTab")}</span>
          </a>
          <Link href="/admin/riders" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            {t("club.done.dashboard")}
          </Link>
          <Button variant="ghost" size="lg" font="sans" onClick={again}>
            {t("club.done.another")}
          </Button>
        </div>
      </div>
    );
  }

  const ageNum = Number(form.age);
  const minor = form.age !== "" && Number.isInteger(ageNum) && ageNum >= AGE.min && ageNum < 18;
  const phoneHint = t("label.phoneHint");
  const ageHint = minor ? t("club.form.minor") : undefined;

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="club-join-title" className="surface space-y-6 p-5 sm:p-8">
      <div className="space-y-2">
        <div id="club-join-title">
          <Headline as="h2" text={t("club.form.title")} />
        </div>
        <p className="text-muted">{t("club.form.lead")}</p>
      </div>

      <Field label={t("label.name")} htmlFor="club-name" error={err("name")}>
        <Input
          id="club-name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          {...describedBy("club-name", err("name"))}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("label.phone")} htmlFor="club-phone" error={err("phone")} hint={phoneHint}>
          <PhoneInput
            id="club-phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            {...describedBy("club-phone", err("phone"), phoneHint)}
          />
        </Field>
        <Field label={t("label.email")} htmlFor="club-email" error={err("email")}>
          <Input
            id="club-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            {...describedBy("club-email", err("email"))}
          />
        </Field>
      </div>

      <Field label={t("label.age")} htmlFor="club-age" error={err("age")} hint={ageHint}>
        <Input
          id="club-age"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          className="max-w-[7.5rem] tabular"
          value={form.age}
          onChange={(e) => set("age", e.target.value.replace(/\D/g, "").slice(0, 2))}
          {...describedBy("club-age", err("age"), ageHint)}
        />
      </Field>

      {/* OptionCards hides its radios; show the brand focus ring on the card that holds keyboard focus. */}
      <div className="[&_label:has(input:focus-visible)]:shadow-[0_0_0_2px_#080808,0_0_0_4px_#ebb04a]">
        <OptionCards
          name="club-level"
          legend={t("label.experience")}
          value={form.level}
          onChange={(v) => set("level", v)}
          columns={2}
          options={LEVELS.map((v) => ({ value: v, title: t(`exp.${v}`) }))}
        />
        {err("level") && (
          <p id="club-level-error" role="alert" className="mt-1.5 text-xs font-medium text-state-closed">
            {err("level")}
          </p>
        )}
      </div>

      <Checkbox id="club-consent" checked={form.consent} onChange={(v) => set("consent", v)} error={err("consent")}>
        {t("club.form.consent")}
      </Checkbox>

      <div className="space-y-3 border-t border-line pt-6">
        <Button type="submit" size="xl" className="w-full sm:w-auto">
          {t("club.form.submit")}
        </Button>
        <p className="text-xs text-muted">{t("club.form.demo")}</p>
      </div>
    </form>
  );
}
