"use client";

import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { waLink } from "@/lib/phone";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Floating WhatsApp button on every public page. Sits above the mobile Book bar. */
export function WhatsAppFab() {
  const { t } = useI18n();
  return (
    <a
      href={waLink(site.whatsapp.display, t("wa.prefill"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("wa.fab")}
      className="no-print fixed bottom-[88px] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-[#0b2b17] shadow-lift transition-transform hover:scale-105 md:bottom-6 md:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
