"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { DemoTag } from "@/components/common/DemoTag";
import { legalDocs, legalOrder, type LegalDocId } from "./content";

/** Shared layout for the four placeholder legal pages. */
export function LegalPage({ doc }: { doc: LegalDocId }) {
  const { t, l } = useI18n();
  const sections = legalDocs[doc];
  return (
    <>
      <section className="topo border-b border-graphite-800">
        <div className="container py-14 md:py-20">
          <p className="eyebrow">{t("footer.legal")}</p>
          <h1 className="h-display mt-3">{t(`legal.${doc}.title`)}</h1>
          <p className="mt-3 text-sm text-silver-dim">{t("legal.version", { v: siteConfig.waiverVersion })}</p>
        </div>
      </section>
      <div className="container py-10 md:py-16 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label={t("legal.toc")} className="mb-8 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <p className="eyebrow mb-3">{t("legal.toc")}</p>
          <ul className="space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex min-h-11 items-center text-silver hover:text-bone">{l(s.h)}</a>
              </li>
            ))}
          </ul>
        </nav>
        <article className="max-w-2xl">
          <div role="note" className="mb-10 flex gap-3 rounded-lg border border-signal/40 bg-signal/5 p-4 text-sm">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
            <p>
              <span className="mr-2 inline-block align-middle"><DemoTag label={t("legal.placeholderTitle")} /></span>
              {t("legal.placeholder")}
            </p>
          </div>
          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24 border-t border-graphite-800 py-6 first:border-t-0 first:pt-0">
              <h2 id={`${s.id}-h`} className="font-display text-2xl font-bold uppercase">{l(s.h)}</h2>
              {s.p?.map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-silver">{l(p)}</p>
              ))}
              {s.ul && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-silver marker:text-silver-dim">
                  {s.ul.map((u, i) => (
                    <li key={i}>{l(u)}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <div className="mt-10 border-t border-graphite-800 pt-6">
            <p className="eyebrow mb-3">{t("legal.related")}</p>
            <div className="flex flex-wrap gap-2">
              {legalOrder.filter((d) => d.id !== doc).map((d) => (
                <Link key={d.id} href={d.href} className={buttonVariants({ variant: "secondary" })}>{t(`legal.${d.id}.title`)}</Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-silver">
              {t("legal.questions")}{" "}
              <Link href="/contact" className="font-semibold text-bone underline underline-offset-4">{t("legal.contactUs")}</Link>
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
