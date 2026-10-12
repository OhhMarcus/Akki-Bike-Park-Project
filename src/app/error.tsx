"use client";

import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="container grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="space-y-4">
        <h1 className="h2">{t("state.errorTitle")}</h1>
        <p className="text-muted">{t("state.errorBody")}</p>
        <Button onClick={reset}>{t("btn.retry")}</Button>
      </div>
    </div>
  );
}
