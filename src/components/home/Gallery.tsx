"use client";

import { img } from "@/content/images";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { PhotoPlaceholder } from "@/components/common/PhotoPlaceholder";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { MessageKey } from "@/i18n/dictionary";
import { cn } from "@/lib/utils";

/** Swap images: add `src="/your-photo.jpg"` (file in /public) to any tile below. */
const tiles: { key: "riding" | "coaching" | "kids" | "events" | "trails" | "community"; className: string }[] = [
  { key: "riding", className: "col-span-2 row-span-2 aspect-square" },
  { key: "coaching", className: "aspect-[4/3]" },
  { key: "kids", className: "aspect-[4/3]" },
  { key: "events", className: "aspect-[4/3]" },
  { key: "trails", className: "aspect-[4/3]" },
  { key: "community", className: "col-span-2 aspect-[2/1] md:col-span-4 md:aspect-[4/1]" },
];

export function Gallery() {
  const { t } = useI18n();
  return (
    <section className="border-y border-graphite-800 bg-graphite-950" aria-label={t("home.gal.title")}>
      <div className="container section-pad">
        <SectionHeading eyebrow={t("home.gal.eyebrow")} title={t("home.gal.title")} />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((tile, i) => (
            <Reveal key={tile.key} delay={i * 0.04} className={cn("contents")}>
              <PhotoPlaceholder src={img(`gallery-${tile.key}`)} alt={t(`home.gal.${tile.key}` as MessageKey)} className={cn("rounded-lg", tile.className)} />
            </Reveal>
          ))}
        </div>
        {siteConfig.showDemoLabels && <p className="mt-4 text-xs text-silver-dim">{t("home.gal.note")}</p>}
      </div>
    </section>
  );
}
