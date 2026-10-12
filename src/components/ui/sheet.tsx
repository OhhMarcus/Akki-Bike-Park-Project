"use client";

import { useLayoutEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet on phones, centred panel on larger screens.
 * Use for quick flows (pump track booking, event registration, admin edits).
 */
export function Sheet({
  open, onOpenChange, title, description, children, footer, className, wide,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  const { t } = useI18n();
  // Controlled sheets have no Radix trigger, so remember what had focus and give it back on close.
  const opener = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open && document.activeElement instanceof HTMLElement && document.activeElement !== document.body) opener.current = document.activeElement;
  }, [open]);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-[2px] data-[state=open]:animate-fade-up" />
        <Dialog.Content
          onCloseAutoFocus={(e) => {
            const el = opener.current;
            if (el && document.contains(el)) {
              e.preventDefault();
              el.focus();
            }
          }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[90] flex max-h-[92svh] flex-col rounded-t-xl border border-line bg-card shadow-lift outline-none data-[state=open]:animate-sheet-in",
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
            wide ? "sm:max-w-2xl" : "sm:max-w-lg",
            className,
          )}
        >
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong sm:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-3 sm:pt-5">
            <div className="min-w-0">
              <Dialog.Title className="h-display text-2xl">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{typeof title === "string" ? title : ""}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="-mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-fg" aria-label={t("btn.close")}>
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && <div className="border-t border-line px-5 py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Small confirmation dialog. */
export function ConfirmDialog({
  open, onOpenChange, title, body, confirmLabel, onConfirm, danger,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; body?: React.ReactNode; confirmLabel: string; onConfirm: () => void; danger?: boolean;
}) {
  const { t } = useI18n();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/75" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-card p-5 shadow-lift outline-none">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          {body ? <Dialog.Description asChild><div className="mt-2 text-sm text-muted">{body}</div></Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="min-h-10 rounded-lg px-4 text-sm font-semibold text-muted hover:bg-white/5 hover:text-fg">{t("btn.cancel")}</Dialog.Close>
            <button
              type="button"
              onClick={() => { onConfirm(); onOpenChange(false); }}
              className={cn("min-h-10 rounded-lg px-4 text-sm font-semibold text-ink", danger ? "bg-state-closed" : "bg-fg")}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
