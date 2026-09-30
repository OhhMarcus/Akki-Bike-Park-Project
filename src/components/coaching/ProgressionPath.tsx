"use client";

import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";

const steps: { title: MessageKey; body: MessageKey }[] = [
  { title: "coaching.path.1", body: "coaching.path.1d" },
  { title: "coaching.path.2", body: "coaching.path.2d" },
  { title: "coaching.path.3", body: "coaching.path.3d" },
  { title: "coaching.path.4", body: "coaching.path.4d" },
  { title: "coaching.path.5", body: "coaching.path.5d" },
];

export function ProgressionPath() {
  const { t } = useI18n();
  return (
    <ol className="grid gap-px overflow-hidden rounded-lg border border-graphite-700 bg-graphite-700 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((s, i) => (
        <li key={s.title} className="bg-graphite-900 p-5">
          <span className="font-display text-3xl font-bold text-silver-dim" aria-hidden>
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-2 font-display text-xl font-bold uppercase">{t(s.title)}</h3>
          <p className="mt-1 text-sm text-silver">{t(s.body)}</p>
        </li>
      ))}
    </ol>
  );
}
