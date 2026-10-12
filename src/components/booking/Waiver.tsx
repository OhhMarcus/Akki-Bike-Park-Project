"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { Checkbox } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { Swap } from "@/components/brand/Swap";
import { SignaturePad } from "./SignaturePad";

export type WaiverValue = { agreed: boolean; guardian: boolean; signature: string | null };
export const emptyWaiver: WaiverValue = { agreed: false, guardian: false, signature: null };

export function waiverErrors(v: WaiverValue, minor: boolean) {
  return {
    agreed: v.agreed ? undefined : ("val.consent" as const),
    guardian: minor && !v.guardian ? ("val.consent" as const) : undefined,
    signature: v.signature ? undefined : ("val.signature" as const),
  };
}

/** Full digital waiver: text, tick box, guardian tick for minors, finger signature. */
export function WaiverBlock({
  value, onChange, minor, errors,
}: {
  value: WaiverValue;
  onChange: (v: WaiverValue) => void;
  minor: boolean;
  errors?: Partial<Record<keyof WaiverValue, string>>;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <div className="surface max-h-56 overflow-y-auto p-4 text-sm leading-relaxed text-fg/85">
        <p className="mb-2 flex items-center font-semibold text-fg">
          {t("book.waiver.title")}
          <Swap />
        </p>
        <p>{t("book.waiver.body")}</p>
        <p className="mt-3 text-xs text-muted">{t("book.waiver.sample")}</p>
      </div>
      <Checkbox id="waiver-agree" checked={value.agreed} onChange={(agreed) => onChange({ ...value, agreed })} error={errors?.agreed}>
        {t("book.waiver.agree")}
      </Checkbox>
      {minor && (
        <Checkbox id="waiver-guardian" checked={value.guardian} onChange={(guardian) => onChange({ ...value, guardian })} error={errors?.guardian}>
          {t("book.waiver.guardian")}
        </Checkbox>
      )}
      <SignaturePad onChange={(signature) => onChange({ ...value, signature })} error={errors?.signature} />
    </div>
  );
}

/** One-tick waiver for quick flows, with the full text one tap away. */
export function WaiverQuick({ checked, onChange, error, id = "waiver-quick" }: { checked: boolean; onChange: (v: boolean) => void; error?: string; id?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Checkbox id={id} checked={checked} onChange={onChange} error={error}>
        {t("book.waiver.quick")}{" "}
        <button type="button" onClick={(e) => { e.preventDefault(); setOpen(true); }} className="font-semibold underline decoration-fg/30 underline-offset-4 hover:decoration-fg">
          {t("book.waiver.read")}
        </button>
      </Checkbox>
      <Sheet open={open} onOpenChange={setOpen} title={t("book.waiver.title")}>
        <p className="text-sm leading-relaxed text-fg/85">{t("book.waiver.body")}</p>
        <p className="mt-3 text-xs text-muted">{t("book.waiver.sample")}</p>
      </Sheet>
    </div>
  );
}
