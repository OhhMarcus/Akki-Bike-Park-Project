"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useAnnouncement } from "@/lib/store";
import { sanitizeText } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { Announcement } from "@/types";
import { LocalizedFields } from "./LocalizedFields";
import { cn } from "@/lib/utils";

function Form({ initial, onSave }: { initial: Announcement; onSave: (a: Announcement) => void }) {
  const { t, l } = useI18n();
  const [a, setA] = useState(initial);
  const [href, setHref] = useState(initial.linkHref ?? "");
  const [errors, setErrors] = useState<{ en?: string; zh?: string; href?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = { en: sanitizeText(a.text.en, 200), zh: sanitizeText(a.text.zh, 200) };
    const link = sanitizeText(href, 200);
    const err: typeof errors = {};
    if (a.active && !text.en) err.en = t("val.required");
    if (a.active && !text.zh) err.zh = t("val.required");
    if (link && !/^(\/[A-Za-z0-9/_\-?=&#.]*|https:\/\/[^\s]+)$/.test(link)) err.href = t("admin.ct.errLink");
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({ ...a, text, linkHref: link || undefined, updatedAt: new Date().toISOString() });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Checkbox id="an-active" checked={a.active} onChange={(v) => setA({ ...a, active: v })}>{t("admin.ct.annActive")}</Checkbox>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("admin.ct.annTone")} htmlFor="an-tone">
          <Select id="an-tone" value={a.tone} onChange={(e) => setA({ ...a, tone: e.target.value as Announcement["tone"] })}>
            <option value="info">{t("admin.ct.toneInfo")}</option>
            <option value="warning">{t("admin.ct.toneWarning")}</option>
          </Select>
        </Field>
        <Field label={t("admin.ct.annLink")} htmlFor="an-link" error={errors.href} hint={t("admin.ct.annLinkHint")}>
          <Input id="an-link" value={href} aria-invalid={!!errors.href} onChange={(e) => setHref(e.target.value)} />
        </Field>
      </div>
      <LocalizedFields id="an-text" label={t("admin.ct.annText")} value={a.text} onChange={(v) => setA({ ...a, text: v })} errors={errors} />
      <div>
        <p className="mb-1.5 text-sm font-medium">{t("admin.ct.preview")}</p>
        {a.active ? (
          <div className={cn("flex items-center justify-center gap-2 rounded-md px-4 py-2 text-center text-xs font-medium md:text-sm", a.tone === "warning" ? "bg-signal text-ink" : "bg-graphite-800 text-bone")}>
            <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
            <span>{l(a.text) || t("admin.ct.previewEmpty")}</span>
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-graphite-600 p-3 text-center text-sm text-silver-dim">{t("admin.ct.annOff")}</p>
        )}
      </div>
      <Button type="submit">{t("btn.save")}</Button>
    </form>
  );
}

export function AnnouncementEditor() {
  const { t } = useI18n();
  const toast = useToast();
  const [ann, setAnn] = useAnnouncement();
  return (
    <section aria-labelledby="ct-ann" className="surface space-y-4 p-5">
      <h2 id="ct-ann" className="font-display text-2xl font-bold uppercase">{t("admin.ct.announcement")}</h2>
      <Form
        key={ann.updatedAt}
        initial={ann}
        onSave={(a) => {
          setAnn(a);
          toast(t("state.saved"), "success");
        }}
      />
    </section>
  );
}
