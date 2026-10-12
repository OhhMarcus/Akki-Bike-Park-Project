"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { Logo } from "@/components/brand/Logo";
import { Swap } from "@/components/brand/Swap";
import { buttonVariants } from "@/components/ui/button";
import { mapsLinks } from "@/components/home/status";
import { cn } from "@/lib/utils";

/**
 * Stylised placeholder map: no real tiles until AKKI confirms the address.
 * The pin marks the configured area and the button opens Google Maps.
 */
export function MapPanel({ className }: { className?: string }) {
  const { t, l } = useI18n();
  const area = l(site.location.area);
  return (
    <div className={cn("pattern-dim-bg relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden rounded-lg border border-line", className)}>
      <div role="img" aria-label={t("visit.map.alt", { area })} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(8,8,8,.2)_0%,rgba(8,8,8,.82)_72%)]" />
        <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-fg" aria-hidden>
          <g fill="none" stroke="currentColor" strokeLinecap="round">
            <path d="M-20 232 C 60 212, 120 252, 190 207 S 330 152, 420 167" strokeWidth="11" opacity=".12" />
            <path d="M-20 232 C 60 212, 120 252, 190 207 S 330 152, 420 167" strokeWidth="1" strokeDasharray="7 7" opacity=".25" />
            <path d="M138 -20 C 150 60, 176 108, 200 140 S 232 250, 214 320" strokeWidth="6" opacity=".12" />
            <path d="M262 -10 C 252 58, 300 118, 420 106" strokeWidth="3" opacity=".1" />
            <path d="M-10 92 C 70 100, 110 70, 160 82" strokeWidth="3" opacity=".08" />
            <path d="M200 140 C 238 118, 272 158, 300 196 S 356 258, 410 248" strokeWidth="2" strokeDasharray="1 7" opacity=".45" />
          </g>
        </svg>
        {/* pin: tip sits on (200,140) of the sketch */}
        <div className="absolute left-1/2 top-[46.7%] flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <span className="rounded-md border border-fg/25 bg-ink px-2.5 py-1.5 shadow-lift">
            <Logo variant="nav" className="h-6" />
          </span>
          <span className="-mt-[5px] h-2.5 w-2.5 rotate-45 border-b border-r border-fg/25 bg-ink" />
          <span className="mt-1.5 h-2 w-2 rounded-full bg-fg shadow-[0_0_0_6px_rgba(242,239,234,.14)]" />
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3 p-3 sm:p-4">
        <div className="min-w-0 rounded-md border border-line bg-ink/85 px-3 py-2 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{t("visit.map.preview")}</p>
          <p className="font-semibold">
            {area}
            {site.location.placeholder && <Swap />}
          </p>
        </div>
        <a
          href={mapsLinks(site.location.mapQuery).search}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "secondary", size: "md", font: "sans" }), "bg-ink/85 backdrop-blur-sm")}
        >
          <MapPin aria-hidden className="h-4 w-4" />
          {t("visit.map.open")}
          <ExternalLink aria-hidden className="h-3.5 w-3.5 text-muted" />
          <span className="sr-only">{t("visit.newTab")}</span>
        </a>
      </div>
    </div>
  );
}
