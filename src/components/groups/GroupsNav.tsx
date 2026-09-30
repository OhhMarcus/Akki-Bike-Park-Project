"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { segments, segmentMsgKey } from "./segments";

/** Sticky in-page nav: side list on desktop, scrolling chips on mobile. */
export function GroupsNav() {
  const { t } = useI18n();
  const [active, setActive] = useState<string>(segments[0].anchor);

  useEffect(() => {
    const els = segments.map((s) => document.getElementById(s.anchor)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const link = (a: string, label: string, chip: boolean) => (
    <a
      key={a}
      href={`#${a}`}
      aria-current={active === a ? "true" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center whitespace-nowrap text-sm transition-colors",
        chip ? "rounded-full border px-4" : "border-l-2 px-4",
        active === a ? (chip ? "border-bone bg-bone text-ink" : "border-bone text-bone") : chip ? "border-graphite-600 text-silver" : "border-graphite-700 text-silver-dim hover:text-bone",
      )}
    >
      {label}
    </a>
  );

  return (
    <nav aria-label={t("groups.navLabel")}>
      <div className="sticky top-16 z-30 -mx-4 border-b border-graphite-800 bg-ink/95 px-4 backdrop-blur md:-mx-6 md:px-6 lg:hidden">
        <div className="flex gap-2 overflow-x-auto py-2">{segments.map((s) => link(s.anchor, t(segmentMsgKey(s.key)), true))}</div>
      </div>
      <div className="sticky top-28 hidden flex-col lg:flex">
        <p className="eyebrow mb-3">{t("groups.navLabel")}</p>
        {segments.map((s) => link(s.anchor, t(segmentMsgKey(s.key)), false))}
        {link("plan", t("groups.planner.eyebrow"), false)}
        {link("enquiry", t("groups.form.title"), false)}
      </div>
    </nav>
  );
}
