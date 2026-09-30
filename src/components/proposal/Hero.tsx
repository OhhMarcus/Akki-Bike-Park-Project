"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { demoAdmin } from "@/config/site";
import { DemoTag } from "@/components/common/DemoTag";
import { buttonVariants } from "@/components/ui/button";
import { ApproveButton } from "./ApproveButton";
import { PrintButton } from "./PrintButton";

export function Hero() {
  const { t } = useI18n();
  const links = [
    { href: "/", label: t("proposal.hero.linkHome") },
    { href: "/booking", label: t("proposal.hero.linkBooking") },
    { href: "/admin", label: t("proposal.hero.linkAdmin") },
  ];
  return (
    <section id="overview" aria-labelledby="overview-title" className="scroll-mt-32 py-12 md:py-16">
      <p className="eyebrow">{t("proposal.hero.eyebrow")}</p>
      <h1 id="overview-title" className="h-display mt-4 max-w-4xl text-4xl sm:text-5xl md:text-7xl">{t("proposal.hero.title")}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-silver md:text-lg">{t("proposal.hero.body")}</p>
      <div className="no-print mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ApproveButton />
        <PrintButton />
      </div>
      <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-graphite-700 bg-graphite-700 md:grid-cols-[1.4fr_1fr]">
        <div className="bg-graphite-900 p-5 md:p-6">
          <p className="eyebrow">{t("proposal.hero.seeDemo")}</p>
          <ul className="mt-3 divide-y divide-graphite-700">
            {links.map((x) => (
              <li key={x.href}>
                <Link href={x.href} className="group flex min-h-12 items-center justify-between gap-3 text-bone hover:text-white">
                  <span className="font-medium">{x.label}</span>
                  <span className="flex items-center gap-2 text-sm text-silver-dim">
                    {x.href}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-graphite-900 p-5 md:p-6">
          <p className="flex items-center gap-2 eyebrow">
            {t("proposal.hero.credentials")} <DemoTag />
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-silver-dim">{t("label.email")}</dt>
              <dd className="break-all font-mono text-bone">{demoAdmin.email}</dd>
            </div>
            <div>
              <dt className="text-silver-dim">{t("proposal.hero.password")}</dt>
              <dd className="break-all font-mono text-bone">{demoAdmin.password}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-silver-dim">{t("proposal.hero.credentialsNote")}</p>
        </div>
      </div>
    </section>
  );
}
