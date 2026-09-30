"use client";

import { Instagram } from "@/components/common/SocialIcons";
import { PhotoPlaceholder } from "@/components/common/PhotoPlaceholder";
import { SectionHeading } from "@/components/common/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";

const tiles = [1, 2, 3, 4, 5, 6];

export function SocialPreview() {
  const { t } = useI18n();
  return (
    <section className="container section-pad" aria-label={t("home.so.title")}>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow={t("home.so.eyebrow")} title={t("home.so.title")} />
        <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary" })}>
          <Instagram className="h-4 w-4" />
          {t("home.so.cta")}
        </a>
      </div>
      <ul className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6">
        {tiles.map((i) => (
          <li key={i}>
            <PhotoPlaceholder alt={t("home.so.tile", { i })} caption={t("demo.placeholder")} className="aspect-square rounded-md" />
          </li>
        ))}
      </ul>
      {siteConfig.showDemoLabels && <p className="mt-4 text-xs text-silver-dim">{t("home.so.note")}</p>}
    </section>
  );
}
