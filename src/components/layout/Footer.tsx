"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube } from "@/components/common/SocialIcons";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { Logo, navLinks } from "./Navigation";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { DemoTag } from "@/components/common/DemoTag";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";

export function Footer() {
  const { t, l } = useI18n();
  const social = [
    { href: siteConfig.social.instagram, label: "Instagram", Icon: Instagram },
    { href: siteConfig.social.facebook, label: "Facebook", Icon: Facebook },
    { href: siteConfig.social.youtube, label: "YouTube", Icon: Youtube },
  ];
  return (
    <footer className="mt-20 border-t border-graphite-800 bg-graphite-950 pb-24 md:pb-0">
      <div className="container grid gap-10 py-14 md:grid-cols-12">
        <div className="space-y-4 md:col-span-4">
          <Logo />
          <p className="text-sm text-silver">{t("footer.tagline")}</p>
          <p className="text-sm text-silver-dim">{l(siteConfig.address)} {!siteConfig.address.verified && <DemoTag label={t("demo.placeholder")} />}</p>
          <div className="flex gap-2">
            {social.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="rounded-md border border-graphite-700 p-2.5 text-silver hover:border-silver hover:text-bone">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <WhatsAppButton variant="secondary" size="sm" />
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-4">
          <div>
            <h2 className="eyebrow mb-3 font-sans">{t("footer.explore")}</h2>
            <ul className="space-y-2 text-sm">
              {navLinks.map((n) => <li key={n.href}><Link className="text-silver hover:text-bone" href={n.href}>{t(n.key)}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow mb-3 font-sans">{t("footer.legal")}</h2>
            <ul className="space-y-2 text-sm">
              <li><Link className="text-silver hover:text-bone" href="/booking">{t("nav.book")}</Link></li>
              <li><Link className="text-silver hover:text-bone" href="/my-bookings">{t("nav.myBookings")}</Link></li>
              <li><Link className="text-silver hover:text-bone" href="/privacy">{t("footer.privacy")}</Link></li>
              <li><Link className="text-silver hover:text-bone" href="/terms">{t("footer.terms")}</Link></li>
              <li><Link className="text-silver hover:text-bone" href="/cancellation">{t("footer.cancellation")}</Link></li>
              <li><Link className="text-silver hover:text-bone" href="/waiver">{t("footer.waiver")}</Link></li>
              <li><Link className="text-silver-dim hover:text-bone" href="/admin">{t("nav.admin")}</Link></li>
            </ul>
          </div>
        </nav>
        <div className="space-y-3 md:col-span-4">
          <h2 className="font-display text-2xl font-bold uppercase">{t("news.title")}</h2>
          <p className="text-sm text-silver">{t("news.body")}</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-graphite-800 py-5 text-center text-xs text-silver-dim">{t("footer.rights")}</div>
    </footer>
  );
}
