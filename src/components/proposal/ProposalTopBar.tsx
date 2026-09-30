"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { Logo } from "@/components/layout/Navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProposalTopBar() {
  const { t } = useI18n();
  return (
    <div className="no-print sticky top-0 z-40 border-b border-graphite-700 bg-ink/95 backdrop-blur">
      <div className="container flex min-h-14 items-center justify-between gap-3 py-1">
        <div className="flex items-center gap-3">
          <Logo />
          <Badge tone="amber" className="hidden sm:inline-flex">{t("proposal.private")}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/" className={buttonVariants({ variant: "secondary", size: "sm", className: "min-h-11" })}>{t("proposal.viewDemo")}</Link>
        </div>
      </div>
    </div>
  );
}
