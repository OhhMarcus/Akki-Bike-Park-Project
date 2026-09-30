"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Persistent mobile "Book Now" (hidden inside the booking flow itself). */
export function MobileBookBar() {
  const { t } = useI18n();
  const pathname = usePathname();
  if (pathname.startsWith("/booking")) return null;
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-graphite-700 bg-ink/95 p-3 backdrop-blur md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <Link href="/booking" className={cn(buttonVariants({ size: "lg" }), "w-full")}>{t("cta.bookNow")}</Link>
    </div>
  );
}
