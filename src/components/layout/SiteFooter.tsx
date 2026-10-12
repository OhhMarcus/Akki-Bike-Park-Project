"use client";

import Link from "next/link";
import { Instagram, Facebook } from "./SocialIcons";
import { site } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { usePrefs } from "@/lib/hooks";
import { waLink } from "@/lib/phone";
import { Logo } from "@/components/brand/Logo";
import { Swap } from "@/components/brand/Swap";
import { HoursList } from "./HoursList";
import { siteNav } from "./SiteHeader";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function SiteFooter() {
  const { t, l } = useI18n();
  const [prefs, setPrefs] = usePrefs();
  return (
    <footer className="pattern-bg relative isolate mt-24 border-t border-line pb-28 md:pb-0">
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/90 to-ink/80" />
      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="space-y-5 md:col-span-4">
          <Logo variant="hero" className="max-w-[220px]" />
          <p className="h-display text-balance text-2xl">{t("footer.tagline")}</p>
          <p className="text-sm text-muted">
            {l(site.location.area)}
            {site.location.placeholder && <Swap />}
          </p>
        </div>

        <nav aria-label={t("nav.footer")} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-10 gap-y-8 md:col-span-4">
          <div>
            <p className="eyebrow mb-3">{t("footer.ride")}</p>
            <ul className="space-y-2.5 text-[15px]">
              {siteNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-fg/85 hover:text-fg">
                    {t(n.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">{t("footer.contact")}</p>
            <ul className="space-y-2.5 text-[15px]">
              <li>
                <a href={waLink(site.whatsapp.display, t("wa.prefill"))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-fg/85 hover:text-fg">
                  <WhatsAppIcon className="h-4 w-4" />
                  <span className="tabular">{site.whatsapp.display}</span>
                </a>
                {site.whatsapp.placeholder && <Swap />}
              </li>
              <li>
                <a href={`mailto:${site.email.value}`} className="text-fg/85 [overflow-wrap:anywhere] hover:text-fg">
                  {/* if it has to wrap, wrap after the @ */}
                  {site.email.value.split("@")[0]}@<wbr />
                  {site.email.value.split("@")[1]}
                </a>
                {site.email.placeholder && <Swap />}
              </li>
              <li className="flex gap-2 pt-1">
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-lg border border-line text-fg/85 hover:border-fg hover:text-fg">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-lg border border-line text-fg/85 hover:border-fg hover:text-fg">
                  <Facebook className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="md:col-span-4">
          <p className="eyebrow mb-3">
            {t("footer.hours")}
            <Swap />
          </p>
          <HoursList />
        </div>
      </div>

      <div className="border-t border-line/80">
        <div className="container flex flex-col items-start justify-between gap-3 py-5 text-xs text-muted sm:flex-row sm:items-center">
          <p>{t("footer.rights")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin" className="hover:text-fg">
              {t("footer.staff")}
            </Link>
            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, swapMarkers: !prefs.swapMarkers })}
              aria-pressed={prefs.swapMarkers}
              title={prefs.swapMarkers ? t("demo.markersOn") : t("demo.markersOff")}
              className="inline-flex items-center gap-2 rounded-md border border-brand-amber/50 bg-brand-amber/10 px-2.5 py-1 font-semibold text-brand-amber hover:bg-brand-amber/20"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-amber" />
              {t("demo.badge")}
              <span className="font-normal text-brand-amber/80">· {prefs.swapMarkers ? t("demo.markersOn") : t("demo.markersOff")}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
