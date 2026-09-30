"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function Modal({ open, onOpenChange, title, description, children, className }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: React.ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className={cn("fixed left-1/2 top-1/2 z-[80] max-h-[88vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-graphite-600 bg-graphite-900 p-6 shadow-2xl", className)}>
          <Dialog.Title className="font-display text-2xl font-bold uppercase">{title}</Dialog.Title>
          {description ? <Dialog.Description className="mt-1 text-sm text-silver">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
          <div className="mt-4">{children}</div>
          <Dialog.Close aria-label={t("btn.close")} className="absolute right-3 top-3 rounded-md p-2 text-silver hover:bg-graphite-800 hover:text-bone">
            <X className="h-5 w-5" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
