"use client";

import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Checkbox } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { STEP_KEYS } from "./draft";

/** OptionCards hide their radios; this shows the focus ring on the card when one is focused by keyboard. */
export const optionFocus = "[&_label:has(input:focus-visible)]:shadow-[0_0_0_2px_#080808,0_0_0_4px_#ebb04a]";

export const stepTitleId = (step: number) => `lesson-step-${step}-title`;

/** "Step 2 of 6" + the step title. The title takes focus when the step changes. */
export function StepHeading({ step, title, lead, srOnly }: { step: number; title: string; lead?: string; srOnly?: boolean }) {
  const { t } = useI18n();
  if (srOnly) {
    return (
      <h2 id={stepTitleId(step)} tabIndex={-1} className="sr-only">
        {title}
      </h2>
    );
  }
  return (
    <div className="mb-7">
      <p className="eyebrow">{t("lessons.steps.count", { n: step + 1, total: STEP_KEYS.length })}</p>
      <h2 id={stepTitleId(step)} tabIndex={-1} className="h-display mt-2 text-3xl focus-visible:shadow-none sm:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{lead}</p>}
    </div>
  );
}

/** Inline error/notice box (booking engine messages). */
export function InlineAlert({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="alert" className={cn("flex items-start gap-3 rounded-lg border border-state-closed/50 bg-state-closed/10 px-4 py-3 text-sm", className)}>
      <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-state-closed" />
      <div className="min-w-0">
        {title && <p className="font-semibold text-fg">{title}</p>}
        <div className={cn("text-fg/90", title && "mt-0.5")}>{children}</div>
      </div>
    </div>
  );
}

/** A tick-box card (gear hire, pack credit). The whole card is the tap target. */
export function ToggleCard({
  id, checked, onChange, title, detail, children,
}: {
  id: string; checked: boolean; onChange: (v: boolean) => void; title: string; detail?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border bg-card transition-colors", checked ? "border-fg/40" : "border-line hover:border-line-strong")}>
      <Checkbox
        id={id}
        checked={checked}
        onChange={onChange}
        className="[&>label]:min-h-[60px] [&>label]:items-center [&>label]:px-4 [&>label]:py-3"
      >
        <span className="block font-semibold text-fg">{title}</span>
        {detail && <span className="mt-0.5 block text-xs text-muted">{detail}</span>}
      </Checkbox>
      {children && <div className="border-t border-line px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}
