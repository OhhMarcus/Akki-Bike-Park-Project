"use client";

import { AlertTriangle, CheckCircle2, Inbox } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EmptyState({ title, body, action, className }: { title?: string; body?: string; action?: React.ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-lg border border-dashed border-graphite-600 p-10 text-center", className)}>
      <Inbox className="h-8 w-8 text-silver-dim" aria-hidden />
      <p className="font-semibold">{title ?? t("state.empty")}</p>
      {body && <p className="max-w-md text-sm text-silver">{body}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title, body, onRetry, className }: { title?: string; body?: string; onRetry?: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 rounded-lg border border-danger/40 bg-danger/5 p-10 text-center", className)}>
      <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
      <p className="font-semibold">{title ?? t("state.errorTitle")}</p>
      <p className="max-w-md text-sm text-silver">{body ?? t("state.errorBody")}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t("btn.retry")}
        </Button>
      )}
    </div>
  );
}

export function SuccessState({ title, body, action, className }: { title: string; body?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div role="status" className={cn("flex flex-col items-center gap-3 rounded-lg border border-trail-green/40 bg-trail-green/5 p-8 text-center", className)}>
      <CheckCircle2 className="h-8 w-8 text-trail-green" aria-hidden />
      <p className="font-display text-2xl font-bold uppercase">{title}</p>
      {body && <p className="max-w-md text-sm text-silver">{body}</p>}
      {action}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-56" />
      ))}
    </div>
  );
}
