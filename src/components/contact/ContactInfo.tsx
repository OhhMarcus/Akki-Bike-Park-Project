"use client";

import Link from "next/link";
import { Clock, Mail, Phone, Timer } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { DemoTag } from "@/components/common/DemoTag";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Facebook, Instagram, Youtube } from "@/components/common/SocialIcons";
import { VisitMap } from "@/components/visit/VisitMap";

const socials = [
  { key: "instagram", href: siteConfig.social.instagram, Icon: Instagram },
  { key: "facebook", href: siteConfig.social.facebook, Icon: Facebook },
  { key: "youtube", href: siteConfig.social.youtube, Icon: Youtube },
] as const;

export function ContactInfo() {
  const { t, l } = useI18n();
  return (
    <div className="space-y-6">
      <div className="surface space-y-4 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-bold uppercase">{t("contact.info.title")}</h2>
          {!siteConfig.contact.verified && <DemoTag />}
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-silver" aria-hidden /><span className="text-silver">{t("contact.info.phone")}</span><a className="text-bone underline underline-offset-4" href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}>{siteConfig.contact.phone}</a></li>
          <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-silver" aria-hidden /><span className="text-silver">{t("contact.info.email")}</span><a className="break-all text-bone underline underline-offset-4" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></li>
          <li className="flex items-start gap-3"><Timer className="mt-0.5 h-4 w-4 shrink-0 text-silver" aria-hidden /><span><span className="text-silver">{t("contact.info.response")}: </span>{l(siteConfig.contact.responseTime)}</span></li>
        </ul>
        <WhatsAppButton variant="primary" className="w-full sm:w-auto" />
        <div>
          <p className="eyebrow mb-2">{t("contact.info.follow")}</p>
          <ul className="flex gap-2">
            {socials.map(({ key, href, Icon }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={t(`contact.social.${key}`)} className="flex h-11 w-11 items-center justify-center rounded-md border border-graphite-600 text-silver hover:bg-graphite-800 hover:text-bone">
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="surface p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Clock className="h-5 w-5 text-silver" aria-hidden />
          <h2 className="font-display text-lg font-bold uppercase">{t("contact.info.hours")}</h2>
          {!siteConfig.hours.verified && <DemoTag />}
        </div>
        <dl className="divide-y divide-graphite-700 text-sm">
          {siteConfig.hours.rows.map((r, i) => (
            <div key={i} className="flex justify-between gap-4 py-2">
              <dt className="text-silver">{l(r.day)}</dt>
              <dd>{r.time === "TBC" ? t("label.tbc") : r.time}</dd>
            </div>
          ))}
        </dl>
      </div>

      <VisitMap compact />

      <div className="surface p-5 md:p-6">
        <p className="eyebrow mb-3">{t("contact.info.links")}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/booking" className={buttonVariants({ variant: "primary" })}>{t("contact.info.book")}</Link>
          <Link href="/groups" className={buttonVariants({ variant: "secondary" })}>{t("contact.info.groups")}</Link>
          <Link href="/visit" className={buttonVariants({ variant: "secondary" })}>{t("contact.info.visit")}</Link>
        </div>
      </div>
    </div>
  );
}
