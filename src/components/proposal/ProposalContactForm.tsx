"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { ErrorState, SuccessState } from "@/components/common/States";
import { useToast } from "@/components/ui/toast";
import type { MessageKey } from "@/i18n/dictionary";
import { sendProposalContact } from "./submit";

const EMPTY = { name: "", email: "", message: "", consent: false, website: "" };

export function ProposalContactForm() {
  const { t } = useI18n();
  const toast = useToast();
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFailed(false);
    const res = await sendProposalContact(v);
    setBusy(false);
    if (res.status === "invalid") return setErrors(res.fields);
    setErrors({});
    if (res.status === "rate") return toast(t("state.rateLimited"), "error");
    if (res.status === "error") return setFailed(true);
    setDone(true);
  }

  if (done)
    return (
      <SuccessState
        title={t("proposal.contact.successTitle")}
        body={t("proposal.contact.successBody")}
        action={<Button variant="secondary" onClick={() => { setV(EMPTY); setDone(false); }}>{t("proposal.contact.another")}</Button>}
      />
    );
  if (failed) return <ErrorState onRetry={() => setFailed(false)} />;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("label.name")} htmlFor="pc-name" error={err("name")}>
          <Input id="pc-name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
        </Field>
        <Field label={t("label.email")} htmlFor="pc-email" error={err("email")}>
          <Input id="pc-email" type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />
        </Field>
      </div>
      <Field label={t("label.message")} htmlFor="pc-message" error={err("message")}>
        <Textarea id="pc-message" value={v.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} />
      </Field>
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={v.website} onChange={(e) => set("website", e.target.value)} />
      <Checkbox id="pc-consent" checked={v.consent} onChange={(c) => set("consent", c)} error={err("consent")}>{t("label.consentContact")}</Checkbox>
      <Button type="submit" disabled={busy}>
        <Send className="h-4 w-4" aria-hidden />
        {busy ? t("proposal.contact.sending") : t("proposal.contact.submit")}
      </Button>
    </form>
  );
}
