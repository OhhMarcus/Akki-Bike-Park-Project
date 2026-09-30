import { DemoTag } from "@/components/common/DemoTag";
import { cn } from "@/lib/utils";

export function StatTile({ label, value, hint, demo, alert }: { label: string; value: string; hint?: string; demo?: boolean; alert?: boolean }) {
  return (
    <div className={cn("surface p-4", alert && "border-signal/50")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-silver-dim">{label}</p>
        {demo && <DemoTag label="DEMO DATA" />}
      </div>
      <p className="mt-2 font-display text-3xl font-bold leading-none">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-silver-dim">{hint}</p>}
    </div>
  );
}
