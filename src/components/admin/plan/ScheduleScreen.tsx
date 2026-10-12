"use client";

import { useI18n } from "@/i18n/provider";
import { AdminPageHeader } from "@/components/layout/AdminShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useNowHK } from "@/lib/hooks";
import type { MessageKey } from "@/i18n/dictionary";
import { BlocksPanel } from "./BlocksPanel";
import { LessonTimesPanel } from "./LessonTimesPanel";
import { PumpHoursPanel } from "./PumpHoursPanel";

const SECTIONS: { id: string; key: MessageKey }[] = [
  { id: "hours", key: "adminPlan.hours.title" },
  { id: "lessons", key: "adminPlan.lessons.title" },
  { id: "blocks", key: "adminPlan.blocks.title" },
];

/** Admin → Schedule: pump track hours, weekly lesson times and blocks. */
export function ScheduleScreen() {
  const { t } = useI18n();
  const now = useNowHK();
  return (
    <>
      <AdminPageHeader title={t("admin.nav.schedule")} lead={t("adminPlan.schedule.lead")} />
      <nav aria-label={t("adminPlan.jump")} className="-mt-2 mb-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-9 items-center rounded-md border border-line px-3 text-sm font-medium text-muted transition-colors hover:border-line-strong hover:text-fg">
            {t(s.key)}
          </a>
        ))}
      </nav>
      {now ? (
        <div className="space-y-6">
          <PumpHoursPanel now={now} />
          <LessonTimesPanel now={now} />
          <BlocksPanel now={now} />
        </div>
      ) : (
        <PlanSkeleton />
      )}
    </>
  );
}

/** Loading state shared by the planning screens. */
export function PlanSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
