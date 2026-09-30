"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/dialog";
import { SuccessState } from "@/components/common/States";
import { useToast } from "@/components/ui/toast";
import type { MessageKey } from "@/i18n/dictionary";
import { sendProposalContact } from "./submit";

const STARTS: { value: string; key: MessageKey }[] = [
  { value: "As soon as possible", key: "proposal.approve.startAsap" },
  { value: "Within 1 month", key: "proposal.approve.start1" },
  { value: "Within 3 months", key: "proposal.approve.start3" },
  { value: "To discuss", key: "proposal.approve.startTalk" },
];

function ApproveForm({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [v, setV] = useState({ name: "", email: "", org: "", start: STARTS[0].value, note: "", consent: false, website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (!v.org.trim()) local.org = "val.required";
    const message = `Approve Pilot Project | Organisation: ${v.org.trim()} | Preferred start: ${v.start}${v.note.trim() ? ` | Note: ${v.note.trim()}` : ""}`;
    setBusy(true);
    setFailed(false);
    const res = await sendProposalContact({ name: v.name, email: v.email, message, consent: v.consent, website: v.website });
    setBusy(false);
    if (res.status === "invalid") return setErrors({ ...res.fields, ...local });
    if (Object.keys(local).length) return setErrors(local);
    setErrors({});
    if (res.status === "rate") return toast(t("state.rateLimited"), "error");
    if (res.status === "error") return setFailed(true);
    setDone(true);
  }

  if (done)
    return (
      <SuccessState
        title={t("proposal.approve.successTitle")}
        body={t("proposal.approve.successBody")}
        action={<Button variant="secondary" onClick={onDone}>{t("proposal.approve.close")}</Button>}
      />
    );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label={t("label.name")} htmlFor="ap-name" error={err("name")}>
        <Input id="ap-name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
      </Field>
      <Field label={t("label.email")} htmlFor="ap-email" error={err("email")}>
        <Input id="ap-email" type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />
      </Field>
      <Field label={t("proposal.approve.org")} htmlFor="ap-org" error={err("org")}>
        <Input id="ap-org" autoComplete="organization" value={v.org} onChange={(e) => set("org", e.target.value)} aria-invalid={!!errors.org} />
      </Field>
      <Field label={t("proposal.approve.start")} htmlFor="ap-start">
        <Select id="ap-start" value={v.start} onChange={(e) => set("start", e.target.value)}>
          {STARTS.map((s) => (
            <option key={s.value} value={s.value}>{t(s.key)}</option>
          ))}
        </Select>
      </Field>
      <Field label={t("proposal.approve.note")} htmlFor="ap-note">
        <Textarea id="ap-note" value={v.note} onChange={(e) => set("note", e.target.value)} />
      </Field>
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={v.website} onChange={(e) => set("website", e.target.value)} />
      <Checkbox id="ap-consent" checked={v.consent} onChange={(c) => set("consent", c)} error={err("consent")}>{t("label.consentContact")}</Checkbox>
      {failed && <p role="alert" className="text-sm text-danger">{t("state.errorBody")}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        {busy ? t("label.loading") : t("proposal.approve.submit")}
      </Button>
    </form>
  );
}

/** Button that opens the Approve Pilot Project modal. Used in the hero and the closing CTA. */
export function ApproveButton({ variant = "primary", size = "lg", className }: { variant?: "primary" | "silver"; size?: "default" | "lg"; className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => { setKey((k) => k + 1); setOpen(true); }}>
        {t("proposal.hero.approve")}
      </Button>
      <Modal open={open} onOpenChange={setOpen} title={t("proposal.approve.title")} description={t("proposal.approve.desc")}>
        <ApproveForm key={key} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
