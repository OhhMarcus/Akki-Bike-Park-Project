import { cn } from "@/lib/utils";

/** Open = pulsing dot, closed = red hatched square (shape differs, so colour is never the only signal). */
export function StateMark({ open, className }: { open: boolean; className?: string }) {
  if (open) {
    return (
      <span aria-hidden className={cn("relative inline-flex h-3 w-3 shrink-0", className)}>
        <span className="absolute inset-0 animate-ping rounded-full bg-state-ok opacity-60" />
        <span className="relative inline-flex h-full w-full rounded-full bg-state-ok" />
      </span>
    );
  }
  return <span aria-hidden className={cn("inline-flex h-3 w-3 shrink-0 rounded-sm border border-state-closed hatch-closed", className)} />;
}
