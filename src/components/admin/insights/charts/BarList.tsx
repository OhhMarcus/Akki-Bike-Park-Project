import { cn } from "@/lib/utils";
import { viz } from "./palette";

export type BarRow = {
  key: string;
  label: React.ReactNode;
  value: number;
  valueText: string;
  /** small muted text after the value (share, change) */
  detail?: string;
  /** comparison period, drawn as a thinner grey bar underneath */
  prev?: { value: number; text: string };
};

/**
 * Horizontal bars with every value printed, so the list doubles as its own
 * table. Bars are thin with a 4px rounded data end and a square baseline.
 * `scale` = the value of a full-width bar (the total for shares, else the max).
 */
export function BarList({ rows, scale, track, srCurrent, srPrev }: {
  rows: BarRow[];
  scale: number;
  /** draw the 0–100% track behind each bar (part-to-whole shares) */
  track?: boolean;
  /** screen-reader prefixes for the two values, e.g. "This week:" / "Last week:" */
  srCurrent?: string;
  srPrev?: string;
}) {
  const w = (v: number) => `${scale > 0 ? Math.max(0, Math.min(100, (v / scale) * 100)) : 0}%`;
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
      {rows.map((r, i) => (
        <li key={r.key} className={cn("col-span-2 grid grid-cols-subgrid gap-y-1.5", i > 0 && "mt-4")}>
          <span className="col-span-2 flex min-w-0 items-center text-sm text-fg">{r.label}</span>
          <span className={cn("relative h-2.5 self-center", track && "rounded-sm bg-white/[.06]")}>
            <span className="absolute inset-y-0 left-0 rounded-r-[4px]" style={{ width: w(r.value), background: viz.primary }} />
          </span>
          <span className="text-right text-sm leading-none">
            {srCurrent && <span className="sr-only">{srCurrent} </span>}
            <span className="font-semibold tabular text-fg">{r.valueText}</span>
            {r.detail && <span className="ml-1.5 text-xs text-muted tabular">{r.detail}</span>}
          </span>
          {r.prev && (
            <>
              <span className="relative h-1.5 self-center">
                <span className="absolute inset-y-0 left-0 rounded-r-[3px]" style={{ width: w(r.prev.value), background: viz.previous }} />
              </span>
              <span className="text-right text-xs leading-none text-muted tabular">
                {srPrev && <span className="sr-only">{srPrev} </span>}
                {r.prev.text}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
