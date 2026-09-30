"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { DemoTag } from "@/components/common/DemoTag";
import { cn } from "@/lib/utils";

export const mapsUrl = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.mapQuery)}`;

/** Topographic map placeholder with a pin and a link out to Google Maps. */
export function VisitMap({ className, compact }: { className?: string; compact?: boolean }) {
  const { t, l } = useI18n();
  return (
    <div className={cn("surface overflow-hidden", className)}>
      <div role="img" aria-label={t("visit.map.label")} className={cn("topo relative bg-graphite-900", compact ? "h-44" : "h-56 md:h-72")}>
        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
          <path d="M-10 190 C80 140 140 220 220 160 S340 100 420 140" fill="none" stroke="#b8bcc4" strokeOpacity=".25" strokeWidth="2" />
          <path d="M-10 215 C90 175 160 240 240 190 S350 140 420 175" fill="none" stroke="#b8bcc4" strokeOpacity=".15" strokeWidth="2" />
          <path d="M-10 120 C70 90 130 130 200 100 S330 60 420 90" fill="none" stroke="#b8bcc4" strokeOpacity=".18" strokeWidth="2" />
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin className="h-9 w-9 fill-bone text-ink" aria-hidden />
        </div>
        <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-[11px] text-silver">{t("visit.map.placeholder")}</span>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="eyebrow mb-1 flex items-center gap-2">{t("visit.address")} {!siteConfig.address.verified && <DemoTag />}</p>
          <p className="text-bone">{l(siteConfig.address)}</p>
        </div>
        <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary" })}>
          <ExternalLink className="h-4 w-4" aria-hidden />
          {t("visit.map.open")}
        </a>
      </div>
    </div>
  );
}
