"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { sanitizeText } from "@/lib/sanitize";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import type { PromotionCode } from "@/types";
import { isIsoDate, toInt } from "./helpers";

export function PromoForm({ initial, existing, onSave, onCancel }: { initial: PromotionCode | null; existing: PromotionCode[]; onSave: (p: PromotionCode) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [code, setCode] = useState(initial?.code ?? "");
  const [kind, setKind] = useState<PromotionCode["kind"]>(initial?.kind ?? "percent");
  const [value, setValue] = useState(initial ? String(initial.value) : "");
  const [limit, setLimit] = useState(initial?.usageLimit == null ? "" : String(initial.usageLimit));
  const [expires, setExpires] = useState(initial?.expiresOn ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [referral, setReferral] = useState(!!initial?.referral);
  const [active, setActive] = useState(initial?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const err: Record<string, string> = {};
    const c = sanitizeText(code, 24).toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9_-]{3,24}$/.test(c)) err.code = t("admin.pr.errCode");
    else if (existing.some((p) => p.id !== initial?.id && p.code.toUpperCase() === c)) err.code = t("admin.pr.errDuplicate");
    const v = toInt(value);
    if (v === null || v < 1 || (kind === "percent" && v > 100)) err.value = t(kind === "percent" ? "admin.pr.errPercent" : "admin.err.number");
    let usageLimit: number | null = null;
    if (limit.trim() !== "") {
      const n = toInt(limit);
      if (n === null || n < 1) err.limit = t("admin.err.number");
      else usageLimit = n;
    }
    if (expires && !isIsoDate(expires)) err.expires = t("admin.err.date");
    setErrors(err);
    if (Object.keys(err).length || v === null) return;
    setCode(c);
    onSave({
      id: initial?.id ?? uid("promo"),
      used: initial?.used ?? 0,
      ...initial,
      code: c,
      kind,
      value: v,
      usageLimit,
      expiresOn: expires || undefined,
      description: sanitizeText(description, 160),
      referral,
      active,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label={t("admin.pr.code")} htmlFor="pr-code" error={errors.code} hint={t("admin.pr.codeHint")}>
        <Input id="pr-code" value={code} autoCapitalize="characters" aria-invalid={!!errors.code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono uppercase" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("admin.pr.kind")} htmlFor="pr-kind">
          <Select id="pr-kind" value={kind} onChange={(e) => setKind(e.target.value as PromotionCode["kind"])}>
            <option value="percent">{t("admin.pr.percent")}</option>
            <option value="fixed">{t("admin.pr.fixed")}</option>
          </Select>
        </Field>
        <Field label={t(kind === "percent" ? "admin.pr.valuePercent" : "admin.pr.valueFixed")} htmlFor="pr-value" error={errors.value}>
          <Input id="pr-value" inputMode="numeric" value={value} aria-invalid={!!errors.value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label={t("admin.pr.limit")} htmlFor="pr-limit" error={errors.limit} hint={t("admin.pr.limitHint")}>
          <Input id="pr-limit" inputMode="numeric" value={limit} aria-invalid={!!errors.limit} onChange={(e) => setLimit(e.target.value)} />
        </Field>
        <Field label={`${t("admin.pr.expires")} (${t("label.optional")})`} htmlFor="pr-expires" error={errors.expires}>
          <Input id="pr-expires" type="date" value={expires} aria-invalid={!!errors.expires} onChange={(e) => setExpires(e.target.value)} />
        </Field>
      </div>
      <Field label={t("admin.pr.description")} htmlFor="pr-desc">
        <Input id="pr-desc" value={description} maxLength={160} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="space-y-2">
        <Checkbox id="pr-referral" checked={referral} onChange={setReferral}>{t("admin.pr.referral")}</Checkbox>
        <Checkbox id="pr-active" checked={active} onChange={setActive}>{t("admin.pr.active")}</Checkbox>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>{t("btn.cancel")}</Button>
        <Button type="submit">{t("btn.save")}</Button>
      </div>
    </form>
  );
}
