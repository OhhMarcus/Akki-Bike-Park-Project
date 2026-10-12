import { cn } from "@/lib/utils";

/** Empty state on the dimmed triangle pattern. */
export function EmptyState({ title, body, action, className, icon }: { title: string; body?: string; action?: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <div className={cn("pattern-dim-bg relative overflow-hidden rounded-lg border border-line", className)}>
      <div className="relative flex flex-col items-center gap-3 bg-ink/60 px-6 py-12 text-center">
        {icon}
        <p className="h-display text-2xl">{title}</p>
        {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
        {action}
      </div>
    </div>
  );
}
