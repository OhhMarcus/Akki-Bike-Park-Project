"use client";

import Link from "next/link";
import { Backpack, CloudRain, HardHat, Handshake, Siren, Users, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { DemoTag } from "@/components/common/DemoTag";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Reveal } from "@/components/common/Reveal";

function InfoCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="surface h-full space-y-3 p-5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-silver" aria-hidden />
        <h3 className="font-display text-xl font-bold uppercase">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Bullets({ keys }: { keys: MessageKey[] }) {
  const { t } = useI18n();
  return (
    <ul className="space-y-2 text-sm text-silver">
      {keys.map((k) => (
        <li key={k} className="flex gap-2">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-silver-dim" />
          {t(k)}
        </li>
      ))}
    </ul>
  );
}

const linkCls = "inline-flex min-h-11 items-center text-sm text-bone underline underline-offset-4";

export function ParkInfo() {
  const { t, l } = useI18n();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Reveal>
        <InfoCard icon={Backpack} title={t("park.bring.title")}>
          <Bullets keys={["park.bring.1", "park.bring.2", "park.bring.3", "park.bring.4", "park.bring.5"]} />
        </InfoCard>
      </Reveal>
      <Reveal delay={0.05}>
        <InfoCard icon={HardHat} title={t("park.gear.title")}>
          <p className="text-sm font-semibold">{t("park.gear.helmet")}</p>
          <Bullets keys={["park.gear.recommended", "park.gear.rental"]} />
          <p className="flex items-start gap-2 text-xs text-silver-dim">
            <DemoTag />
            {t("park.gear.rentalPrice")}
          </p>
        </InfoCard>
      </Reveal>
      <Reveal delay={0.1}>
        <InfoCard icon={CloudRain} title={t("park.weather.title")}>
          <Bullets keys={["park.weather.1", "park.weather.2", "park.weather.3"]} />
          <Link href="/cancellation" className={linkCls}>
            {t("park.weather.link")}
          </Link>
        </InfoCard>
      </Reveal>
      <Reveal>
        <InfoCard icon={Handshake} title={t("park.etiquette.title")}>
          <Bullets keys={["park.etiquette.1", "park.etiquette.2", "park.etiquette.3", "park.etiquette.4", "park.etiquette.5"]} />
        </InfoCard>
      </Reveal>
      <Reveal delay={0.05}>
        <InfoCard icon={Users} title={t("park.age.title")}>
          <Bullets keys={["park.age.1", "park.age.2", "park.age.3"]} />
          <Link href="/coaching" className={linkCls}>
            {t("park.age.link")}
          </Link>
        </InfoCard>
      </Reveal>
      <Reveal delay={0.1}>
        <InfoCard icon={Siren} title={t("park.emergency.title")}>
          <p className="text-sm text-silver">{l(siteConfig.emergency.text)}</p>
          {!siteConfig.emergency.verified && (
            <p className="flex items-start gap-2 text-xs text-silver-dim">
              <DemoTag label={t("demo.placeholder")} />
              {t("park.emergency.unverified")}
            </p>
          )}
          <WhatsAppButton variant="secondary" text={t("park.emergency.whatsapp")} />
        </InfoCard>
      </Reveal>
    </div>
  );
}
