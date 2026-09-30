"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useDraft } from "@/lib/store";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Subtle, dismissible reminder: appears once per session after ~40s on the page
 * or on desktop exit-intent. Resume link if an abandoned booking is saved,
 * otherwise the first-visit offer. Never shown inside the booking flow.
 */
export function BookingReminder() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [draft] = useDraft();
  const [show, setShow] = useState(false);

  const trigger = useCallback(() => {
    try {
      if (sessionStorage.getItem("akki:reminderShown")) return;
      sessionStorage.setItem("akki:reminderShown", "1");
    } catch {}
    setShow(true);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/booking")) return;
    const timer = setTimeout(trigger, 40_000);
    const onLeave = (e: MouseEvent) => e.clientY <= 0 && trigger();
    document.addEventListener("mouseleave", onLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [pathname, trigger]);

  if (pathname.startsWith("/booking")) return null;
  const hasDraft = !!draft && draft.step > 0;
  return (
    <AnimatePresence>
      {show && (
        <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          aria-label={t("reminder.title")} className="no-print fixed bottom-20 left-4 right-4 z-40 max-w-sm rounded-lg border border-graphite-600 bg-graphite-900 p-4 shadow-2xl md:bottom-6 md:right-auto">
          <button aria-label={t("reminder.dismiss")} onClick={() => setShow(false)} className="absolute right-2 top-2 rounded p-1.5 text-silver-dim hover:text-bone"><X className="h-4 w-4" /></button>
          <p className="pr-6 font-display text-xl font-bold uppercase">{t("reminder.title")}</p>
          <p className="mt-1 text-sm text-silver">{hasDraft ? t("reminder.body") : t("reminder.firstVisit")}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/booking" onClick={() => setShow(false)} className={cn(buttonVariants({ size: "sm" }))}>{hasDraft ? t("reminder.resume") : t("cta.bookNow")}</Link>
            <button onClick={() => setShow(false)} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>{t("reminder.dismiss")}</button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
