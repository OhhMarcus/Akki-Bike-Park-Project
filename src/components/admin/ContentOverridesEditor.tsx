"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { useStored } from "@/lib/store";
import { sanitizeText } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { LocalizedText } from "@/types";
import { LocalizedFields } from "./LocalizedFields";

export type ContentOverrides = Record<string, LocalizedText>;
const NO_OVERRIDES: ContentOverrides = {};

const fields = [
  { id: "home.hero.title", label: "admin.ct.fHeroTitle" },
  { id: "home.hero.subtitle", label: "admin.ct.fHeroSubtitle" },
  { id: "home.hero.cta", label: "admin.ct.fHeroCta" },
  { id: "home.intro.body", label: "admin.ct.fIntro" },
] as const;

function Form({ initial, onSave }: { initial: ContentOverrides; onSave: (o: ContentOverrides) => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(initial);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const next: ContentOverrides = {};
        for (const f of fields) {
          const v = draft[f.id];
          const en = sanitizeText(v?.en, 400);
          const zh = sanitizeText(v?.zh, 400);
          if (en || zh) next[f.id] = { en, zh };
        }
        onSave(next);
      }}
    >
      {fields.map((f) => (
        <LocalizedFields key={f.id} id={`co-${f.id}`} label={t(f.label)} value={draft[f.id] ?? { en: "", zh: "" }} onChange={(v) => setDraft({ ...draft, [f.id]: v })} multiline={f.id === "home.intro.body"} />
      ))}
      <Button type="submit">{t("btn.save")}</Button>
    </form>
  );
}

/** Homepage copy overrides, stored locally under `contentOverrides`. */
export function ContentOverridesEditor() {
  const { t } = useI18n();
  const toast = useToast();
  const [overrides, setOverrides, resetOverrides] = useStored<ContentOverrides>("contentOverrides", NO_OVERRIDES);
  return (
    <section aria-labelledby="ct-copy" className="surface space-y-4 p-5">
      <div>
        <h2 id="ct-copy" className="font-display text-2xl font-bold uppercase">{t("admin.ct.copy")}</h2>
        <p className="mt-1 text-sm text-silver">{t("admin.ct.copyNote")}</p>
        <p className="mt-2 rounded-md border border-graphite-700 bg-graphite-950 p-3 text-xs text-silver">{t("admin.ct.wireNote")}</p>
      </div>
      <Form
        key={JSON.stringify(overrides)}
        initial={overrides}
        onSave={(o) => {
          setOverrides(o);
          toast(t("state.saved"), "success");
        }}
      />
      <Button variant="ghost" onClick={() => { resetOverrides(); toast(t("admin.ct.copyCleared"), "info"); }}>
        {t("admin.ct.copyClear")}
      </Button>
    </section>
  );
}
