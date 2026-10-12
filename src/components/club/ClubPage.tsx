"use client";

import { BadgePercent, Bike, Flag, Megaphone } from "lucide-react";
import { site } from "@/config/site";
import type { MessageKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/provider";
import { Headline } from "@/components/brand/Headline";
import { PageHero } from "@/components/brand/PageHero";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";
import { PlaceholderNote } from "@/components/home/PlaceholderNote";
import { buttonVariants } from "@/components/ui/button";
import { JoinForm } from "./JoinForm";

/** Generic placeholder perks: AKKI supplies the real list. */
const PERKS: { icon: typeof Bike; key: MessageKey }[] = [
  { icon: BadgePercent, key: "club.perks.rates" },
  { icon: Bike, key: "club.perks.rides" },
  { icon: Flag, key: "club.perks.early" },
  { icon: Megaphone, key: "club.perks.news" },
];

export function ClubPage() {
  const { t, fmt } = useI18n();
  return (
    <>
      <PageHero
        eyebrow={t("club.hero.eyebrow")}
        title={t("club.hero.title")}
        lead={t("club.hero.lead")}
        actions={
          <a href="#join" className={buttonVariants({ size: "lg" })}>
            {t("club.hero.cta")}
          </a>
        }
        aside={
          <Photo
            slot="club"
            alt={t("club.photo.alt")}
            what={t("club.photo.what")}
            fade="edges"
            priority
            sizes="(min-width: 1024px) 420px, 100vw"
            className="aspect-[16/9] w-full border border-line sm:aspect-[4/3]"
          />
        }
      />

      <div className="container grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="flex items-end gap-1">
              <Headline text={t("club.perks.title")} />
              {site.club.placeholder && <Swap className="mb-1.5" />}
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {PERKS.map(({ icon: Icon, key }) => (
                <li key={key} className="surface flex items-center gap-4 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-card-2">
                    <Icon aria-hidden className="h-5 w-5 text-fg/80" />
                  </span>
                  <span className="font-semibold leading-snug">{t(key)}</span>
                </li>
              ))}
            </ul>
            <PlaceholderNote className="mt-3">{t("club.perks.note")}</PlaceholderNote>
          </div>

          <div className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="shrink-0">
              <p className="eyebrow">{t("club.fee.label")}</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold italic leading-none tabular [font-synthesis:none]">
                  {fmt.money(site.club.annualFeeHKD)}
                </span>
                <span className="text-sm text-muted">{t("club.fee.per")}</span>
                {site.club.placeholder && <Swap />}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted sm:max-w-[16rem]">{t("club.fee.note")}</p>
          </div>
        </div>

        <div id="join" className="scroll-mt-24">
          <JoinForm />
        </div>
      </div>
    </>
  );
}
