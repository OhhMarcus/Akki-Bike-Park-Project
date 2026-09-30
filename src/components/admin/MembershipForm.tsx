"use client";

import { useState } from "react";
import { membershipTiers } from "@/config/pricing";
import { useI18n } from "@/i18n/provider";
import { sanitizeText } from "@/lib/sanitize";
import { addDays, hkToday } from "@/lib/dates";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import type { Membership } from "@/types";
import { isEmail, isIsoDate, toInt } from "./helpers";

type Tier = Exclude<Membership["tier"], "none">;

export function MembershipForm({ initial, onSave, onCancel }: { initial: Membership | null; onSave: (m: Membership) => void; onCancel: () => void }) {
  const { t, l, money } = useI18n();
  const [name, setName] = useState(initial?.riderName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [tier, setTier] = useState<Tier>(initial && initial.tier !== "none" ? initial.tier : "monthly");
  const [status, setStatus] = useState<Membership["status"]>(initial?.status ?? "active");
  const [starts, setStarts] = useState(initial?.startsOn ?? hkToday());
  const [ends, setEnds] = useState(initial?.endsOn ?? addDays(hkToday(), 30));
  const [visits, setVisits] = useState(String(initial?.visits ?? 0));
  const [isDemo, setIsDemo] = useState(initial?.isDemo ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const err: Record<string, string> = {};
    const n = sanitizeText(name, 80);
    if (!n) err.name = t("val.required");
    if (!isEmail(email)) err.email = t("val.email");
    const p = sanitizeText(phone, 30);
    if (p && !/^[+\d][\d\s-]{6,}$/.test(p)) err.phone = t("val.phone");
    if (!isIsoDate(starts)) err.starts = t("admin.err.date");
    if (!isIsoDate(ends)) err.ends = t("admin.err.date");
    else if (isIsoDate(starts) && ends < starts) err.ends = t("admin.me.errEnds");
    const v = toInt(visits);
    if (v === null) err.visits = t("admin.err.number");
    setErrors(err);
    if (Object.keys(err).length || v === null) return;
    onSave({ id: initial?.id ?? uid("mem"), ...initial, riderName: n, email: email.trim().toLowerCase(), phone: p, tier, status, startsOn: starts, endsOn: ends, visits: v, isDemo });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("label.name")} htmlFor="me-name" error={errors.name}>
          <Input id="me-name" value={name} aria-invalid={!!errors.name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t("label.email")} htmlFor="me-email" error={errors.email}>
          <Input id="me-email" type="email" value={email} aria-invalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t("label.phone")} htmlFor="me-phone" error={errors.phone}>
          <Input id="me-phone" type="tel" value={phone} aria-invalid={!!errors.phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label={t("admin.me.tier")} htmlFor="me-tier">
          <Select id="me-tier" value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
            {membershipTiers.map((x) => (
              <option key={x.id} value={x.id}>{l(x.name)} · {money(x.priceHKD)} ({t("demo.tag")})</option>
            ))}
          </Select>
        </Field>
        <Field label={t("label.status")} htmlFor="me-status">
          <Select id="me-status" value={status} onChange={(e) => setStatus(e.target.value as Membership["status"])}>
            {(["active", "pending", "expired"] as const).map((x) => (
              <option key={x} value={x}>{t(`admin.st.${x}`)}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("admin.me.visits")} htmlFor="me-visits" error={errors.visits}>
          <Input id="me-visits" inputMode="numeric" value={visits} aria-invalid={!!errors.visits} onChange={(e) => setVisits(e.target.value)} />
        </Field>
        <Field label={t("admin.me.starts")} htmlFor="me-starts" error={errors.starts}>
          <Input id="me-starts" type="date" value={starts} aria-invalid={!!errors.starts} onChange={(e) => setStarts(e.target.value)} />
        </Field>
        <Field label={t("admin.me.ends")} htmlFor="me-ends" error={errors.ends}>
          <Input id="me-ends" type="date" value={ends} aria-invalid={!!errors.ends} onChange={(e) => setEnds(e.target.value)} />
        </Field>
      </div>
      <Checkbox id="me-demo" checked={isDemo} onChange={setIsDemo}>{t("admin.me.demoRecord")}</Checkbox>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>{t("btn.cancel")}</Button>
        <Button type="submit">{t("btn.save")}</Button>
      </div>
    </form>
  );
}
