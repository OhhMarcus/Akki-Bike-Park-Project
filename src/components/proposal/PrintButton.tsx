"use client";

import { Printer } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";

export function PrintButton({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Button variant="ghost" size="lg" className={className} onClick={() => window.print()}>
      <Printer className="h-4 w-4" aria-hidden />
      {t("proposal.print")}
    </Button>
  );
}
