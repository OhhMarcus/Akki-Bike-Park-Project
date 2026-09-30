"use client";

import { useState } from "react";
import { CircleCheck, CircleSlash } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useParkStatus } from "@/lib/store";
import { sanitizeText } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { LocalizedText } from "@/types";
import { LocalizedFields } from "./LocalizedFields";
import { cn } from "@/lib/utils";

function NoteForm({ initial, onSave }: { initial: LocalizedText; onSave: (n: LocalizedText) => void }) {
  const { t } = useI18n();
  const [note, setNote] = useState(initial);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ en: sanitizeText(note.en, 200), zh: sanitizeText(note.zh, 200) });
      }}
    >
      <LocalizedFields id="park-note" label={t("admin.ca.note")} value={note} onChange={setNote} hint={t("admin.ca.noteHint")} />
      <Button type="submit" variant="secondary">{t("admin.ca.saveNote")}</Button>
    </form>
  );
}

/** Prominent park open/closed control. Feeds the public status bar. */
export function ParkStatusCard() {
  const { t, l, date } = useI18n();
  const toast = useToast();
  const [status, setStatus] = useParkStatus();

  const save = (open: boolean, note: LocalizedText) => setStatus({ open, note, updatedAt: new Date().toISOString() });

  return (
    <section aria-labelledby="park-status-h" className={cn("rounded-lg border p-5 md:p-6", status.open ? "border-trail-green/40 bg-trail-green/5" : "border-danger/50 bg-danger/5")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {status.open ? <CircleCheck className="h-9 w-9 text-trail-green" aria-hidden /> : <CircleSlash className="h-9 w-9 text-danger" aria-hidden />}
          <div>
            <h2 id="park-status-h" className="font-display text-3xl font-bold uppercase leading-none">
              {t(status.open ? "admin.ca.parkOpen" : "admin.ca.parkClosed")}
            </h2>
            <p className="mt-1 text-xs text-silver-dim">{t("admin.ca.updated", { date: date(status.updatedAt.slice(0, 10)) })}</p>
          </div>
        </div>
        <Button
          variant={status.open ? "danger" : "primary"}
          size="lg"
          aria-pressed={!status.open}
          onClick={() => {
            save(!status.open, status.note);
            toast(t(status.open ? "admin.ca.nowClosed" : "admin.ca.nowOpen"), "success");
          }}
        >
          {t(status.open ? "admin.ca.closePark" : "admin.ca.openPark")}
        </Button>
      </div>
      <p className="mt-3 text-sm text-silver">{t("admin.ca.publicNote", { note: l(status.note) })}</p>
      <div className="mt-4 border-t border-graphite-700 pt-4">
        <NoteForm
          key={`${status.updatedAt}-${status.note.en}-${status.note.zh}`}
          initial={status.note}
          onSave={(n) => {
            save(status.open, n);
            toast(t("state.saved"), "success");
          }}
        />
      </div>
    </section>
  );
}
