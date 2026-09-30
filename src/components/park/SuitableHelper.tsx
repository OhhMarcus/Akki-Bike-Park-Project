"use client";

import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import type { Level } from "@/types";
import { cn } from "@/lib/utils";

export type HelperChoice = "first" | "regular" | "race";
export const helperLevel: Record<HelperChoice, Level> = { first: "beginner", regular: "intermediate", race: "advanced" };
const choices: HelperChoice[] = ["first", "regular", "race"];

export function SuitableHelper({ choice, onChoice, onShow }: { choice: HelperChoice | null; onChoice: (c: HelperChoice | null) => void; onShow: (level: Level) => void }) {
  const { t } = useI18n();
  return (
    <section aria-labelledby="park-helper-title" className="surface space-y-4 p-5">
      <div>
        <h2 id="park-helper-title" className="font-display text-2xl font-bold uppercase">
          {t("park.helper.title")}
        </h2>
        <p className="mt-1 text-sm text-silver">{t("park.helper.q")}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {choices.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={choice === c}
            onClick={() => onChoice(choice === c ? null : c)}
            className={cn("min-h-11 rounded-md border px-4 py-2 text-sm font-medium transition-colors", choice === c ? "border-bone bg-bone text-ink" : "border-graphite-600 text-silver hover:bg-graphite-800 hover:text-bone")}
          >
            {t(`park.helper.${c}`)}
          </button>
        ))}
      </div>
      {choice && (
        <div role="status" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{t("park.helper.result", { level: t(`level.${helperLevel[choice]}`) })}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => onShow(helperLevel[choice])}>
              {t("park.helper.show")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onChoice(null)}>
              {t("park.helper.reset")}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
