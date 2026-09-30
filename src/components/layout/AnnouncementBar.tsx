"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { useAnnouncement, useHydrated } from "@/lib/store";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function AnnouncementBar() {
  const { l } = useI18n();
  const [a] = useAnnouncement();
  const hydrated = useHydrated();
  if (!hydrated || !a.active) return null;
  const inner = (
    <>
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
      <span>{l(a.text)}</span>
    </>
  );
  const cls = cn("flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium md:text-sm", a.tone === "warning" ? "bg-signal text-ink" : "bg-graphite-800 text-bone");
  return a.linkHref ? <Link href={a.linkHref} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}
