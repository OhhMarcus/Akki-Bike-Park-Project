"use client";

import { Camera, Check, GraduationCap, Bike, UtensilsCrossed } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { addOnKeys, type AddOnKey } from "./segments";

const icons = { coaching: GraduationCap, rental: Bike, catering: UtensilsCrossed, photography: Camera };

export function AddOnCards({ value, onChange }: { value: AddOnKey[]; onChange: (v: AddOnKey[]) => void }) {
  const { t } = useI18n();
  const toggle = (k: AddOnKey) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <div>
      <h3 className="font-display text-xl font-bold uppercase">{t("groups.addons.title")}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {addOnKeys.map((k) => {
          const on = value.includes(k);
          const Icon = icons[k];
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(k)}
              className={cn("flex min-h-11 items-start gap-3 rounded-lg border p-4 text-left transition-colors", on ? "border-bone bg-graphite-800" : "border-graphite-700 bg-graphite-900 hover:border-graphite-600")}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-silver" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{t(`groups.addons.${k}`)}</span>
                <span className="block text-sm text-silver">{t(`groups.addons.${k}Desc`)}</span>
                <span className="mt-1 block text-xs text-silver-dim">{t("groups.addons.quote")}</span>
              </span>
              {on && <Check className="h-4 w-4 shrink-0 text-trail-green" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
