"use client";

import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

export function ConfirmDialog({ open, onOpenChange, title, body, confirmLabel, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; body: string; confirmLabel?: string; onConfirm: () => void }) {
  const { t } = useI18n();
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={body} className="max-w-md">
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          {t("btn.cancel")}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel ?? t("btn.delete")}
        </Button>
      </div>
    </Modal>
  );
}
