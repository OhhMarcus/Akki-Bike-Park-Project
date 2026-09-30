import { cn } from "@/lib/utils";

export type BarDatum = { id: string; label: string; value: number; display: string; ariaLabel: string; alert?: boolean };

/** Small hand-built horizontal bar chart (SVG bars, real text labels). `max` defaults to the largest value. */
export function BarChart({ data, max, ariaLabel }: { data: BarDatum[]; max?: number; ariaLabel: string }) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <ul aria-label={ariaLabel} className="space-y-2.5">
      {data.map((d) => {
        const pct = Math.max(0, Math.min(100, (d.value / top) * 100));
        return (
          <li key={d.id} className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[7rem_1fr_4rem]">
            <span className="truncate text-silver">{d.label}</span>
            <div role="meter" aria-label={d.ariaLabel} aria-valuemin={0} aria-valuemax={top} aria-valuenow={d.value} aria-valuetext={d.display}>
              <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-2.5 w-full" aria-hidden>
                <rect x="0" y="0" width="100" height="10" rx="2" className="fill-graphite-800" />
                <rect x="0" y="0" width={pct} height="10" rx="2" className={cn(d.alert ? "fill-signal" : "fill-silver")} />
              </svg>
            </div>
            <span className="text-right font-medium tabular-nums">{d.display}</span>
          </li>
        );
      })}
    </ul>
  );
}
