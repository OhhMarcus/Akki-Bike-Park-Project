"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { AddOnCards } from "./AddOnCards";
import { GroupDocs } from "./GroupDocs";
import { GroupEnquiryForm } from "./GroupEnquiryForm";
import { GroupSizeSelector } from "./GroupSizeSelector";
import { GroupsNav } from "./GroupsNav";
import { SegmentSection } from "./SegmentSection";
import { resolveSegment, segments, type AddOnKey, type Segment, type SegmentKey } from "./segments";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";

export function GroupsExperience() {
  const { t } = useI18n();
  const [segment, setSegment] = useState<SegmentKey>("school");
  const [size, setSize] = useState(20);
  const [addOns, setAddOns] = useState<AddOnKey[]>([]);

  // Preselect from ?segment= or #hash (segment key or anchor id).
  useEffect(() => {
    const fromQuery = resolveSegment(new URLSearchParams(window.location.search).get("segment"));
    const fromHash = resolveSegment(window.location.hash);
    const s = fromQuery ?? fromHash;
    if (s) setSegment(s);
    if (fromQuery) requestAnimationFrame(() => document.getElementById("enquiry")?.scrollIntoView());
  }, []);

  const quote = useCallback((s: Segment) => {
    setSegment(s.key);
    history.replaceState(null, "", "#enquiry");
    const el = document.getElementById("enquiry");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("ge-organisation")?.focus({ preventScroll: true }), 450);
  }, []);

  return (
    <div className="container section-pad lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:pt-2">
        <GroupsNav />
      </aside>
      <div className="min-w-0">
        {segments.map((s) => (
          <SegmentSection key={s.key} segment={s} onQuote={quote} />
        ))}
        <section id="plan" aria-labelledby="plan-h" className="scroll-mt-32 space-y-8 border-b border-graphite-800 py-12 md:py-16">
          <div className="max-w-2xl space-y-3">
            <p className="eyebrow">{t("groups.planner.eyebrow")}</p>
            <h2 id="plan-h" className="h-section">{t("groups.planner.title")}</h2>
            <p className="text-silver">{t("groups.planner.lead")}</p>
          </div>
          <GroupSizeSelector segment={segment} onSegment={setSegment} size={size} onSize={setSize} />
          <AddOnCards value={addOns} onChange={setAddOns} />
          <GroupDocs segment={segment} size={size} addOns={addOns} />
        </section>
        <div className="py-12 md:py-16">
          <GroupEnquiryForm segment={segment} onSegment={setSegment} size={size} onSize={setSize} addOns={addOns} onAddOns={setAddOns} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-silver">{t("groups.bottomBook")}</p>
            <Link href="/booking?exp=private" className={buttonVariants({ variant: "secondary" })}>{t("nav.book")}</Link>
            <WhatsAppButton />
          </div>
        </div>
      </div>
    </div>
  );
}
