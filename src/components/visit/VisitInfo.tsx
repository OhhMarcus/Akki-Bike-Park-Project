"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Accessibility, Clock, Mail, ParkingCircle, Phone, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { useParkStatus } from "@/lib/store";
import { DemoTag } from "@/components/common/DemoTag";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";

const rules = ["visit.rules.1", "visit.rules.2", "visit.rules.3", "visit.rules.4", "visit.rules.5"] as const;

function Block({ icon: Icon, title, tag, children }: { icon: typeof Clock; title: string; tag?: boolean; children: React.ReactNode }) {
  return (
    <div className="surface p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Icon className="h-5 w-5 text-silver" aria-hidden />
        <h3 className="font-display text-lg font-bold uppercase">{title}</h3>
        {tag && <DemoTag />}
      </div>
      {children}
    </div>
  );
}

export function ParkStatusCard() {
  const { t, l } = useI18n();
  const [status] = useParkStatus();
  return (
    <div className="surface p-5 md:p-6" aria-live="polite">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-xl font-bold uppercase">{t("visit.status.title")}</h3>
        <Badge tone={status.open ? "green" : "red"}>
          {status.open ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : <AlertTriangle className="h-3 w-3" aria-hidden />}
          {status.open ? t("status.open") : t("status.closed")}
        </Badge>
      </div>
      <p className="mt-3 text-bone">{l(status.note)}</p>
      <p className="mt-3 text-sm leading-relaxed text-silver">{t("visit.status.body")}</p>
      <Link href="/cancellation" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-bone underline underline-offset-4">
        {t("visit.status.policy")}
      </Link>
    </div>
  );
}

export function VisitInfo() {
  const { t, l } = useI18n();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Block icon={ParkingCircle} title={t("visit.parking")} tag={!siteConfig.parking.verified}>
        <p className="text-sm text-silver">{l(siteConfig.parking.text)}</p>
      </Block>
      <Block icon={Clock} title={t("visit.hours")} tag={!siteConfig.hours.verified}>
        <p className="mb-2 text-sm text-silver">{l(siteConfig.hours.summary)}</p>
        <dl className="divide-y divide-graphite-700 text-sm">
          {siteConfig.hours.rows.map((r, i) => (
            <div key={i} className="flex justify-between gap-4 py-2">
              <dt className="text-silver">{l(r.day)}</dt>
              <dd className="text-bone">{r.time === "TBC" ? t("label.tbc") : r.time}</dd>
            </div>
          ))}
        </dl>
      </Block>
      <Block icon={Phone} title={t("visit.contact")} tag={!siteConfig.contact.verified}>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2 text-silver"><Phone className="h-4 w-4" aria-hidden />{t("visit.contact.phone")}: <a className="text-bone underline underline-offset-4" href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}>{siteConfig.contact.phone}</a></li>
          <li className="flex items-center gap-2 text-silver"><Mail className="h-4 w-4" aria-hidden />{t("visit.contact.email")}: <a className="break-all text-bone underline underline-offset-4" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>{!siteConfig.contact.emailVerified && <DemoTag />}</li>
        </ul>
      </Block>
      <Block icon={Accessibility} title={t("visit.access.title")} tag>
        <p className="text-sm leading-relaxed text-silver">{t("visit.access.body")}</p>
        <div className="mt-3"><WhatsAppButton size="sm" /></div>
      </Block>
      <div className="md:col-span-2">
        <Block icon={ShieldCheck} title={t("visit.rules.title")}>
          <ul className="grid gap-2 text-sm text-bone/90 sm:grid-cols-2">
            {rules.map((k) => (
              <li key={k} className="flex gap-2"><span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-silver" />{t(k)}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-silver-dim">{t("visit.rules.note")}</p>
        </Block>
      </div>
    </div>
  );
}
