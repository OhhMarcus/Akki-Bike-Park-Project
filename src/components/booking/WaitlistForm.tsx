"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { SuccessState } from "@/components/common/States";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { useWaitlist } from "@/lib/store";
import { fieldErrors, waitlistSchema } from "@/lib/validation";
import { uid } from "@/lib/utils";
import type { DayPeriod, ExperienceId } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  experienceId: ExperienceId;
  date: string;
  period: DayPeriod;
  partySize: number;
  defaults?: { name: string; email: string; phone: string };
};

export function WaitlistForm({ open, onOpenChange, ...rest }: Props) {
  const { t, date } = useI18n();
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("booking.waitlistTitle")} description={`${t(`exp.${rest.experienceId}`)} · ${date(rest.date)} · ${t(`period.${rest.period}`)}`}>
      <WaitlistBody {...rest} onDone={() => onOpenChange(false)} />
    </Modal>
  );
}

function WaitlistBody({ experienceId, date, period, partySize, defaults, onDone }: Omit<Props, "open" | "onOpenChange"> & { onDone: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [, setWaitlist] = useWaitlist();
  const [name, setName] = useState(defaults?.name ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [phone, setPhone] = useState(defaults?.phone ?? "");
  const [party, setParty] = useState(String(partySize));
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = waitlistSchema.safeParse({ name, email, phone, experienceId, date, period, partySize: party, consent });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFailed(false);
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      if (res.status === 429) return toast(t("state.rateLimited"), "error");
      if (res.status === 422) {
        const body = (await res.json()) as { fields?: Record<string, string> };
        return setErrors(body.fields ?? {});
      }
      if (!res.ok) throw new Error("waitlist");
      const d = parsed.data;
      setWaitlist((p) => [{ id: uid("wl"), name: d.name, email: d.email, phone: d.phone, experienceId: d.experienceId, date: d.date, period: d.period, partySize: d.partySize, status: "waiting", createdAt: new Date().toISOString(), isDemo: true }, ...p]);
      setDone(true);
      toast(t("booking.waitlistSuccess"));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <SuccessState title={t("booking.waitlistSuccess")} body={t("booking.waitlistSuccessBody")} action={<Button onClick={onDone}>{t("btn.close")}</Button>} />;
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="text-sm text-silver">{t("booking.waitlistIntro")}</p>
      <Field label={t("label.name")} htmlFor="wl-name" error={err("name")}>
        <Input id="wl-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "wl-name-error" : undefined} />
      </Field>
      <Field label={t("label.email")} htmlFor="wl-email" error={err("email")}>
        <Input id="wl-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "wl-email-error" : undefined} />
      </Field>
      <Field label={t("label.phone")} htmlFor="wl-phone" error={err("phone")}>
        <Input id="wl-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "wl-phone-error" : undefined} />
      </Field>
      <Field label={t("booking.partySize")} htmlFor="wl-party" error={err("partySize")}>
        <Input id="wl-party" type="number" min={1} max={40} inputMode="numeric" value={party} onChange={(e) => setParty(e.target.value)} aria-invalid={!!errors.partySize} />
      </Field>
      <Checkbox id="wl-consent" checked={consent} onChange={setConsent} error={err("consent")}>{t("booking.waitlistConsent")}</Checkbox>
      {failed && <p role="alert" className="text-sm text-danger">{t("state.errorBody")}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? t("booking.processing") : t("btn.joinWaitlist")}</Button>
    </form>
  );
}
