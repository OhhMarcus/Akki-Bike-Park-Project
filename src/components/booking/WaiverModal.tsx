"use client";

import Link from "next/link";
import { DemoTag } from "@/components/common/DemoTag";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";

/** PLACEHOLDER waiver text. Replace with AKKI's legal text before launch. */
export function WaiverModal({ open, onOpenChange, onAccept, hasMinors }: { open: boolean; onOpenChange: (o: boolean) => void; onAccept: () => void; hasMinors: boolean }) {
  const { t } = useI18n();
  const clauses = ["booking.waiver.c1", "booking.waiver.c2", "booking.waiver.c3", "booking.waiver.c4"] as const;
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t("booking.waiver.title")} description={t("booking.waiver.version", { v: siteConfig.waiverVersion })} className="max-w-2xl">
      <div className="space-y-4 text-sm text-silver">
        <p className="flex flex-wrap items-center gap-2 rounded-md border border-signal/40 bg-signal/10 p-3 text-signal">
          <DemoTag label={t("demo.placeholder")} />
          <span>{t("booking.waiver.placeholder")}</span>
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          {clauses.map((c) => <li key={c}>{t(c)}</li>)}
        </ol>
        <div className="rounded-md border border-graphite-600 p-3">
          <p className="font-semibold text-bone">{t("booking.waiver.guardianTitle")}</p>
          <p className="mt-1">{t("booking.waiver.guardianBody")}</p>
          {hasMinors && <p className="mt-2 text-signal">{t("booking.waiver.hasMinors")}</p>}
        </div>
        <div className="rounded-md border border-graphite-600 p-3">
          <p className="font-semibold text-bone">{t("booking.waiver.dataTitle")}</p>
          <p className="mt-1">{t("booking.waiver.dataBody")} <Link href="/privacy" className="underline hover:text-bone">{t("footer.privacy")}</Link></p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>{t("btn.close")}</Button>
        <Button onClick={() => { onAccept(); onOpenChange(false); }}>{t("booking.waiver.accept")}</Button>
      </div>
    </Modal>
  );
}
