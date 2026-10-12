"use client";

import { Info } from "lucide-react";
import { usePrefs } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/** Amber note under placeholder content. Follows the footer's swap-marker toggle, like <Swap />. */
export function PlaceholderNote({ children, className }: { children: React.ReactNode; className?: string }) {
  const [prefs] = usePrefs();
  if (!prefs.swapMarkers) return null;
  return (
    <p className={cn("flex items-start gap-2 rounded-md border border-dashed border-brand-amber/50 bg-brand-amber/5 px-3 py-2 text-xs leading-relaxed text-brand-amber", className)}>
      <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
