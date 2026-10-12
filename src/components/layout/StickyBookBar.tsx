"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Mobile sticky Book bar. Hidden inside booking flows so it never covers their own action bar. */
export function StickyBookBar() {
  const { t } = useI18n();
  const pathname = usePathname();
  if (pathname.startsWith("/lessons/book")) return null;
  return (
    <div
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-3 pt-3 backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2">
        <span className="h-display shrink-0 pr-1 text-lg text-muted">{t("sticky.label")}</span>
        <Link href="/lessons" className={cn(buttonVariants({ variant: "secondary", size: "md" }), "flex-1")}>
          {t("sticky.lesson")}
        </Link>
        <Link href="/pump-track" className={cn(buttonVariants({ size: "md" }), "flex-1")}>
          {t("sticky.pump")}
        </Link>
      </div>
    </div>
  );
}
