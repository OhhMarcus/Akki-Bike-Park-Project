"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/input";
import { useNewsletter } from "@/lib/store";
import { newsletterSchema, fieldErrors } from "@/lib/validation";
import { useToast } from "@/components/ui/toast";
import type { MessageKey } from "@/i18n/dictionary";

export function NewsletterForm() {
  const { t } = useI18n();
  const toast = useToast();
  const [, setList] = useNewsletter();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email, consent, website });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      if (res.status === 429) return toast(t("state.rateLimited"), "error");
      if (!res.ok) throw new Error();
      setList((p) => Array.from(new Set([...p, parsed.data.email])));
      setDone(true);
      toast(t("news.success"));
    } catch {
      toast(t("state.errorBody"), "error");
    } finally {
      setBusy(false);
    }
  }

  if (done) return <p role="status" className="text-sm text-trail-green">{t("news.success")}</p>;
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="nl-email" className="sr-only">{t("label.email")}</label>
        <Input id="nl-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("news.placeholder")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "nl-email-error" : undefined} />
        <Button type="submit" variant="silver" disabled={busy}>{t("news.cta")}</Button>
      </div>
      {err("email") && <p id="nl-email-error" role="alert" className="text-xs text-danger">{err("email")}</p>}
      {/* honeypot */}
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
      <Checkbox id="nl-consent" checked={consent} onChange={setConsent} error={err("consent")}>{t("label.consentContact")}</Checkbox>
    </form>
  );
}
