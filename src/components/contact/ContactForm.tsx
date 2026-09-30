"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ErrorState, SuccessState } from "@/components/common/States";
import { useEnquiries } from "@/lib/store";
import { enquirySchema, fieldErrors } from "@/lib/validation";
import { uid } from "@/lib/utils";
import type { Enquiry } from "@/types";
import type { MessageKey } from "@/i18n/dictionary";

import { parseTopic, topics, type Topic } from "./topics";

const empty = { name: "", email: "", phone: "", message: "" };

export function ContactForm({ initialTopic = "general" }: { initialTopic?: Topic }) {
  const { t } = useI18n();
  const toast = useToast();
  const [, setEnquiries] = useEnquiries();
  const [topic, setTopic] = useState<Topic>(initialTopic);
  const [f, setF] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [doneName, setDoneName] = useState<string | null>(null);

  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = enquirySchema.safeParse({ topic, ...f, consent, website });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFailed(false);
    setBusy(true);
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      if (res.status === 422) {
        const body = (await res.json().catch(() => null)) as { fields?: Record<string, string> } | null;
        setErrors(body?.fields ?? {});
        return;
      }
      if (res.status === 429) {
        toast(t("state.rateLimited"), "error");
        return;
      }
      if (!res.ok) throw new Error("failed");
      const d = parsed.data;
      setEnquiries((p) => [{ id: uid("enq"), topic: d.topic, name: d.name, email: d.email, phone: d.phone || undefined, message: d.message, status: "new", consent: true, createdAt: new Date().toISOString(), isDemo: true }, ...p]);
      setDoneName(d.name);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (doneName) {
    return (
      <SuccessState
        title={t("contact.form.doneTitle")}
        body={t("contact.form.doneBody", { name: doneName })}
        action={<Button variant="secondary" onClick={() => { setDoneName(null); setF(empty); setConsent(false); }}>{t("contact.form.another")}</Button>}
      />
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby="contact-form-h" className="surface space-y-5 p-5 md:p-8">
      <h2 id="contact-form-h" className="h-section">{t("contact.form.title")}</h2>
      {failed && <ErrorState className="p-5" />}
      <Field label={t("contact.form.topic")} htmlFor="ct-topic" error={err("topic")}>
        <Select id="ct-topic" value={topic} onChange={(e) => setTopic(e.target.value as Topic)} aria-describedby="ct-topic-help">
          {topics.map((x) => (
            <option key={x} value={x}>{t(`contact.topic.${x}`)}</option>
          ))}
        </Select>
        <p id="ct-topic-help" className="text-xs text-silver-dim">
          {t(`contact.help.${topic}`)}{" "}
          {topic === "group" && <Link href="/groups#enquiry" className="font-semibold text-bone underline underline-offset-4">{t("contact.help.groupLink")}</Link>}
          {topic === "booking" && <Link href="/my-bookings" className="font-semibold text-bone underline underline-offset-4">{t("nav.myBookings")}</Link>}
        </p>
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("label.name")} htmlFor="ct-name" error={err("name")}>
          <Input id="ct-name" autoComplete="name" value={f.name} onChange={up("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "ct-name-error" : undefined} />
        </Field>
        <Field label={t("label.email")} htmlFor="ct-email" error={err("email")}>
          <Input id="ct-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={up("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "ct-email-error" : undefined} />
        </Field>
      </div>
      <Field label={`${t("label.phone")} (${t("label.optional")})`} htmlFor="ct-phone" error={err("phone")}>
        <Input id="ct-phone" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={up("phone")} />
      </Field>
      <Field label={t("label.message")} htmlFor="ct-message" error={err("message")}>
        <Textarea id="ct-message" value={f.message} onChange={up("message")} placeholder={t("contact.form.messagePh")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "ct-message-error" : undefined} />
      </Field>
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
      <Checkbox id="ct-consent" checked={consent} onChange={setConsent} error={err("consent")}>{t("label.consentContact")}</Checkbox>
      <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
        {busy ? t("contact.form.sending") : t("contact.form.send")}
      </Button>
    </form>
  );
}
