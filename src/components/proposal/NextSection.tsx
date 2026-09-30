"use client";

import { useI18n } from "@/i18n/provider";
import { ApproveButton } from "./ApproveButton";
import { ProposalContactForm } from "./ProposalContactForm";

export function NextSection() {
  const { t } = useI18n();
  return (
    <section id="next" aria-labelledby="next-title" className="scroll-mt-32 border-t border-graphite-700 py-12 md:py-16 print:break-inside-avoid-page">
      <div className="topo rounded-lg border border-graphite-700 p-6 md:p-10">
        <h2 id="next-title" className="h-section max-w-2xl">{t("proposal.cta.title")}</h2>
        <p className="mt-3 max-w-xl text-silver md:text-lg">{t("proposal.cta.body")}</p>
        <div className="no-print mt-6">
          <ApproveButton />
        </div>
      </div>
      <div className="no-print mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          <p className="eyebrow">{t("proposal.contact.eyebrow")}</p>
          <h2 className="h-section">{t("proposal.contact.title")}</h2>
          <p className="text-silver">{t("proposal.contact.body")}</p>
        </div>
        <div className="surface p-5 md:p-6">
          <ProposalContactForm />
        </div>
      </div>
    </section>
  );
}
