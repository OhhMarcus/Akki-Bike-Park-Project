"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Ticking countdown (d h m s). Renders placeholders until hydrated so SSR markup matches. */
export function Countdown({ to, className, size = "md" }: { to: number; className?: string; size?: "sm" | "md" }) {
  const { t, fmt } = useI18n();
  const hydrated = useHydrated();
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!hydrated) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hydrated]);
  const c = fmt.countdown(now ? to - now : 0);
  const units = [
    { v: c.d, l: t("fmt.cd.d") },
    { v: c.h, l: t("fmt.cd.h") },
    { v: c.m, l: t("fmt.cd.m") },
    { v: c.s, l: t("fmt.cd.s") },
  ];
  return (
    <div className={cn("flex gap-1.5", className)} role="timer" aria-live="off">
      {units.map((u, i) => (
        <div key={i} className={cn("flex min-w-0 flex-1 flex-col items-center rounded-md border border-line bg-ink/60", size === "sm" ? "px-1.5 py-1" : "px-2 py-1.5")}>
          <span className={cn("font-display font-extrabold italic leading-none tabular [font-synthesis:none]", size === "sm" ? "text-xl" : "text-2xl")}>
            {now ? String(u.v).padStart(2, "0") : "--"}
          </span>
          <span className="text-[10px] font-semibold uppercase text-muted">{u.l}</span>
        </div>
      ))}
    </div>
  );
}
