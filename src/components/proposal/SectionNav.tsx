"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { cn } from "@/lib/utils";

export const proposalSections: { id: string; key: MessageKey }[] = [
  { id: "overview", key: "proposal.nav.overview" },
  { id: "friction", key: "proposal.nav.friction" },
  { id: "benefits", key: "proposal.nav.benefits" },
  { id: "journey", key: "proposal.nav.journey" },
  { id: "phases", key: "proposal.nav.phases" },
  { id: "pricing", key: "proposal.nav.pricing" },
  { id: "roadmap", key: "proposal.nav.roadmap" },
  { id: "needs", key: "proposal.nav.needs" },
  { id: "next", key: "proposal.nav.next" },
];

/** Sticky rail on desktop, horizontally scrolling bar on small screens. */
export function SectionNav() {
  const { t } = useI18n();
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const els = proposalSections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label={t("proposal.navLabel")} className="no-print sticky top-14 z-30 -mx-4 border-b border-graphite-700 bg-ink/95 px-4 backdrop-blur md:-mx-6 md:px-6 lg:top-24 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <ul className="flex gap-1 overflow-x-auto py-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-l lg:border-graphite-700 lg:py-0">
        {proposalSections.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={cn("flex min-h-11 items-center whitespace-nowrap px-3 text-sm transition-colors hover:text-bone lg:-ml-px lg:border-l-2 lg:border-transparent", active === s.id ? "font-semibold text-bone lg:border-bone" : "text-silver-dim")}
            >
              {t(s.key)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
