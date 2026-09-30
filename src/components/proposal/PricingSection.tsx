"use client";

import { useState } from "react";
import { Check, Pencil, RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { supportTiers, websiteTiers, type PricingTier } from "@/config/proposal";
import { useStored } from "@/lib/store";
import { DemoTag } from "@/components/common/DemoTag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Section } from "./Section";

type Overrides = Record<string, number | null>;
const NO_OVERRIDES: Overrides = {};

function TierCard({ tier, price, edit, onEdit, selected, onSelect, monthly }: { tier: PricingTier; price: number | null; edit: boolean; onEdit: (v: number | null) => void; selected?: boolean; onSelect?: () => void; monthly?: boolean }) {
  const { t, l, money } = useI18n();
  const inputId = `price-${tier.id}`;
  return (
    <li className={cn("surface flex flex-col p-5 md:p-6 print:break-inside-avoid", selected && "border-bone")}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display text-xl font-bold uppercase">{l(tier.name)}</h4>
        <DemoTag label={t("proposal.pricing.tag")} className="shrink-0" />
      </div>
      <p className="mt-4 font-display text-3xl font-bold">
        {price === null ? <span className="text-xl text-silver">{t("proposal.pricing.tbc")}</span> : money(price)}
        {monthly && price !== null && <span className="ml-1 text-sm font-medium text-silver-dim">{t("proposal.pricing.perMonth")}</span>}
      </p>
      {edit && (
        <div className="no-print mt-3">
          <label htmlFor={inputId} className="mb-1 block text-xs text-silver-dim">{t("proposal.pricing.amount")}</label>
          <Input id={inputId} type="number" inputMode="numeric" min={0} step={100} value={price ?? ""} onChange={(e) => onEdit(e.target.value === "" ? null : Math.max(0, Number(e.target.value)))} />
        </div>
      )}
      <p className="mt-3 text-sm text-silver-dim">{l(tier.note)}</p>
      <p className="eyebrow mt-5">{t("proposal.pricing.included")}</p>
      <ul className="mt-2 flex-1 space-y-2 text-sm text-silver">
        {tier.included.map((i) => (
          <li key={i.en} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-trail-green" aria-hidden />
            {l(i)}
          </li>
        ))}
      </ul>
      {onSelect && (
        <Button variant={selected ? "primary" : "secondary"} size="sm" className="no-print mt-5 min-h-11" aria-pressed={selected} onClick={onSelect}>
          {selected ? t("proposal.pricing.selected") : t("proposal.pricing.select")}
        </Button>
      )}
    </li>
  );
}

export function PricingSection() {
  const { t, money } = useI18n();
  const [overrides, setOverrides] = useStored<Overrides>("proposalPricing", NO_OVERRIDES);
  const [edit, setEdit] = useState(false);
  const [support, setSupport] = useState(supportTiers[0].id);

  const priceOf = (tier: PricingTier): number | null => (tier.id in overrides ? overrides[tier.id] : tier.priceHKD);
  const setPrice = (id: string, v: number | null) => setOverrides((p) => ({ ...p, [id]: v }));

  const oneOffItems = websiteTiers.map(priceOf);
  const oneOff = oneOffItems.reduce<number>((s, v) => s + (v ?? 0), 0);
  const missing = oneOffItems.some((v) => v === null);
  const selectedSupport = supportTiers.find((s) => s.id === support) ?? supportTiers[0];
  const monthly = priceOf(selectedSupport);
  const anyEntered = oneOffItems.some((v) => v !== null);
  const firstYear = anyEntered || monthly !== null ? oneOff + 12 * (monthly ?? 0) : null;
  const show = (v: number | null) => (v === null ? t("proposal.pricing.tbc") : money(v));

  return (
    <Section id="pricing" eyebrow={t("proposal.pricing.eyebrow")} title={t("proposal.pricing.title")} body={t("proposal.pricing.body")}>
      <div className="no-print mb-6 flex flex-wrap items-center gap-3">
        <Button variant={edit ? "primary" : "secondary"} aria-pressed={edit} onClick={() => setEdit((e) => !e)}>
          <Pencil className="h-4 w-4" aria-hidden />
          {edit ? t("proposal.pricing.editOn") : t("proposal.pricing.editOff")}
        </Button>
        {edit && (
          <Button variant="ghost" onClick={() => setOverrides(NO_OVERRIDES)}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t("proposal.pricing.reset")}
          </Button>
        )}
        {edit && <p className="text-sm text-silver-dim">{t("proposal.pricing.editHint")}</p>}
      </div>

      <h3 className="mb-4 font-display text-2xl font-bold uppercase">{t("proposal.pricing.website")}</h3>
      <ul className="grid gap-4 md:grid-cols-3">
        {websiteTiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} price={priceOf(tier)} edit={edit} onEdit={(v) => setPrice(tier.id, v)} />
        ))}
      </ul>

      <h3 className="mb-4 mt-10 font-display text-2xl font-bold uppercase">{t("proposal.pricing.support")}</h3>
      <ul className="grid gap-4 md:grid-cols-3">
        {supportTiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} monthly price={priceOf(tier)} edit={edit} onEdit={(v) => setPrice(tier.id, v)} selected={tier.id === support} onSelect={() => setSupport(tier.id)} />
        ))}
      </ul>

      <div className="mt-8 rounded-lg border border-graphite-600 bg-graphite-950 p-5 md:p-6 print:break-inside-avoid" aria-live="polite">
        <p className="eyebrow">{t("proposal.pricing.totals")}</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-silver-dim">{t("proposal.pricing.oneOff")}</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{show(anyEntered ? oneOff : null)}</dd>
          </div>
          <div>
            <dt className="text-sm text-silver-dim">{t("proposal.pricing.monthly")}</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{show(monthly)}</dd>
          </div>
          <div>
            <dt className="text-sm text-silver-dim">{t("proposal.pricing.firstYear")}</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{show(firstYear)}</dd>
          </div>
        </dl>
        {(missing || monthly === null) && firstYear !== null && <p className="mt-4 text-xs text-silver-dim">{t("proposal.pricing.partial")}</p>}
      </div>
    </Section>
  );
}
