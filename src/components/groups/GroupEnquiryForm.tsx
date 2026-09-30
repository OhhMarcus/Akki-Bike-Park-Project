"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { whatsappUrl } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ErrorState, SuccessState } from "@/components/common/States";
import { useGroupEnquiries } from "@/lib/store";
import { fieldErrors, groupEnquirySchema } from "@/lib/validation";
import { bookingReference, uid } from "@/lib/utils";
import type { MessageKey } from "@/i18n/dictionary";
import { addOnKeys, segments, segmentMsgKey, type AddOnKey, type SegmentKey } from "./segments";
import { MAX_SIZE, MIN_SIZE } from "./GroupSizeSelector";

type Props = { segment: SegmentKey; onSegment: (s: SegmentKey) => void; size: number; onSize: (n: number) => void; addOns: AddOnKey[]; onAddOns: (a: AddOnKey[]) => void };

export function GroupEnquiryForm({ segment, onSegment, size, onSize, addOns, onAddOns }: Props) {
  const { t } = useI18n();
  const toast = useToast();
  const [, setEnquiries] = useGroupEnquiries();
  const [f, setF] = useState({ organisation: "", contactName: "", email: "", phone: "", preferredDate: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const err = (k: string) => (errors[k] ? t(errors[k] as MessageKey) : undefined);
  const toggleAddOn = (k: AddOnKey) => onAddOns(addOns.includes(k) ? addOns.filter((x) => x !== k) : [...addOns, k]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = groupEnquirySchema.safeParse({ segment, ...f, groupSize: size, addOns, consent, website });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailed(false);
    setBusy(true);
    try {
      const res = await fetch("/api/group-enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
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
      setEnquiries((p) => [
        { id: uid("grp"), segment: d.segment, organisation: d.organisation, contactName: d.contactName, email: d.email, phone: d.phone, groupSize: d.groupSize, preferredDate: d.preferredDate || undefined, addOns: d.addOns, message: d.message ?? "", status: "new", createdAt: new Date().toISOString(), isDemo: true },
        ...p,
      ]);
      setRef(bookingReference());
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (ref) {
    return (
      <div id="enquiry" tabIndex={-1} className="scroll-mt-32">
        <SuccessState
          title={t("groups.form.doneTitle")}
          body={t("groups.form.doneBody", { ref })}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <a href={whatsappUrl(t("groups.form.waText", { ref }))} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-md bg-bone px-5 text-sm font-semibold text-ink hover:bg-white">
                {t("groups.form.doneWa")}
              </a>
              <Button variant="secondary" onClick={() => { setRef(null); setConsent(false); setF({ organisation: "", contactName: "", email: "", phone: "", preferredDate: "", message: "" }); }}>
                {t("groups.form.another")}
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <form id="enquiry" onSubmit={submit} noValidate aria-labelledby="enquiry-h" className="surface scroll-mt-32 space-y-5 p-5 md:p-8">
      <div>
        <h2 id="enquiry-h" className="h-section">{t("groups.form.title")}</h2>
        <p className="mt-2 text-silver">{t("groups.form.lead")}</p>
      </div>
      {failed && <ErrorState className="p-5" />}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("groups.form.segment")} htmlFor="ge-segment" error={err("segment")}>
          <Select id="ge-segment" value={segment} onChange={(e) => onSegment(e.target.value as SegmentKey)} aria-invalid={!!errors.segment}>
            {segments.map((s) => (
              <option key={s.key} value={s.key}>{t(segmentMsgKey(s.key))}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("groups.form.organisation")} htmlFor="ge-organisation" error={err("organisation")}>
          <Input id="ge-organisation" autoComplete="organization" value={f.organisation} onChange={up("organisation")} aria-invalid={!!errors.organisation} aria-describedby={errors.organisation ? "ge-organisation-error" : undefined} />
        </Field>
        <Field label={t("groups.form.contact")} htmlFor="ge-contact" error={err("contactName")}>
          <Input id="ge-contact" autoComplete="name" value={f.contactName} onChange={up("contactName")} aria-invalid={!!errors.contactName} aria-describedby={errors.contactName ? "ge-contact-error" : undefined} />
        </Field>
        <Field label={t("label.email")} htmlFor="ge-email" error={err("email")}>
          <Input id="ge-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={up("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "ge-email-error" : undefined} />
        </Field>
        <Field label={t("label.phone")} htmlFor="ge-phone" error={err("phone")}>
          <Input id="ge-phone" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={up("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "ge-phone-error" : undefined} />
        </Field>
        <Field label={t("groups.form.size")} htmlFor="ge-size" error={err("groupSize")}>
          <Input id="ge-size" type="number" inputMode="numeric" min={MIN_SIZE} max={MAX_SIZE * 5} value={size} onChange={(e) => onSize(Number(e.target.value))} aria-invalid={!!errors.groupSize} aria-describedby={errors.groupSize ? "ge-size-error" : undefined} />
        </Field>
        <Field label={`${t("groups.form.date")} (${t("label.optional")})`} htmlFor="ge-date" error={err("preferredDate")}>
          <Input id="ge-date" type="date" value={f.preferredDate} onChange={up("preferredDate")} />
        </Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("groups.form.addons")} ({t("label.optional")})</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {addOnKeys.map((k) => (
            <Checkbox key={k} id={`ge-addon-${k}`} checked={addOns.includes(k)} onChange={() => toggleAddOn(k)} className="min-h-11 rounded-md border border-graphite-700 p-3">
              {t(`groups.addons.${k}`)}
            </Checkbox>
          ))}
        </div>
      </fieldset>
      <Field label={`${t("groups.form.message")} (${t("label.optional")})`} htmlFor="ge-message" error={err("message")}>
        <Textarea id="ge-message" value={f.message} onChange={up("message")} />
      </Field>
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
      <Checkbox id="ge-consent" checked={consent} onChange={setConsent} error={err("consent")}>{t("label.consentContact")}</Checkbox>
      <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
        {busy ? t("groups.form.sending") : t("groups.form.send")}
      </Button>
    </form>
  );
}
