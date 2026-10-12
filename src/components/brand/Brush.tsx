import { brushPaths } from "./brushPaths";
import { cn } from "@/lib/utils";

/** Scratchy hand-painted underline (one per section, never under body text). */
export function BrushUnderline({ className, variant = "underline" }: { className?: string; variant?: "underline" | "underlineAlt" }) {
  const p = brushPaths[variant];
  return (
    <svg aria-hidden viewBox={`0 0 ${p.w} ${p.h}`} preserveAspectRatio="none" className={cn("block h-3 w-40 text-fg/85 sm:w-52", className)}>
      <path d={p.d} fill="currentColor" />
    </svg>
  );
}

/** Rough-edged divider between sections. */
export function BrushDivider({ className }: { className?: string }) {
  const p = brushPaths.divider;
  return (
    <div className={cn("container", className)} aria-hidden>
      <svg viewBox={`0 0 ${p.w} ${p.h}`} preserveAspectRatio="none" className="block h-2.5 w-full max-w-3xl text-line-strong">
        <path d={p.d} fill="currentColor" />
      </svg>
    </div>
  );
}
