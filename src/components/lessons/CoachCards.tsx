"use client";

import { coaches } from "@/content/catalogue";
import { useI18n } from "@/i18n/provider";
import { SectionTitle } from "@/components/brand/Headline";
import { Photo } from "@/components/brand/Photo";
import { Swap } from "@/components/brand/Swap";

/** Placeholder coach cards: names, roles and portraits come from AKKI (see catalogue + /public/images). */
export function CoachCards() {
  const { t, l } = useI18n();
  return (
    <section className="container py-16 sm:py-20">
      <SectionTitle eyebrow={t("lessons.coaches.eyebrow")} title={t("lessons.coaches.title")} lead={t("lessons.coaches.lead")} />
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {coaches.map((c) => {
          const name = l(c.name);
          return (
            <li key={c.id} className="surface flex overflow-hidden sm:flex-col">
              <Photo
                slot={c.photoSlot}
                alt={t("lessons.coaches.photoAlt", { name })}
                what={name}
                fade="bottom"
                rounded={false}
                sizes="(min-width: 640px) 33vw, 140px"
                className="aspect-[4/5] w-[140px] shrink-0 sm:aspect-square sm:w-full"
              />
              <div className="min-w-0 flex-1 self-center p-4 sm:self-auto sm:p-5">
                <h3 className="h3 flex flex-wrap items-center">
                  {name}
                  <Swap />
                </h3>
                <p className="mt-1.5 text-sm text-fg/85">{l(c.role)}</p>
                <p className="mt-3 text-xs text-muted">
                  {t("lessons.coaches.teaches", { langs: c.languages.map((x) => t(`tlang.${x}`)).join(" / ") })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
