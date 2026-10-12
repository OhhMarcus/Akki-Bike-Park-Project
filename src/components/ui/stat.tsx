import { cn } from "@/lib/utils";

/** KPI tile for admin screens. `accent` puts the brand gradient on the top edge. */
export function StatTile({
  label, value, sub, accent, icon, className,
}: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; accent?: boolean; icon?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("surface relative overflow-hidden p-4", className)}>
      {accent && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-grad" />}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-4xl font-extrabold italic leading-none tabular [font-synthesis:none]">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
