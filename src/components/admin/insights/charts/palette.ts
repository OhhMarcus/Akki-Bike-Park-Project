/**
 * Chart colours for the admin insights screens, taken from the AKKI brand
 * gradient stops and validated on the dark card surface (#141313) with the
 * dataviz palette validator (OKLab ΔE ×100, Machado 2009 CVD simulation).
 *
 * - primary / previous: "emphasis" pair (this period in brand purple, the
 *   comparison period in a recessive grey). CVD ΔE 14.4, normal-vision
 *   ΔE 19.4, contrast 4.30:1 and 2.55:1 (the grey is relieved by printed
 *   values and every chart's table view). Never used for status.
 * - days still to come: primary outline over a light primary fill.
 * - heat: sequential ramp for the busiest-times heatmap, plum → purple →
 *   rose → amber (brand stops, analogous neighbours). OKLCH L 0.42 → 0.79,
 *   every step ≥ 0.08 apart, lowest bin 2.11:1 on the surface. Always shown
 *   with its scale legend.
 */
export const viz = {
  primary: "#A85FA8",
  previous: "#5A5653",
  grid: "#2A2828",
  axis: "#3A3737",
  label: "#9A958F",
  text: "#F2EFEA",
  closed: "#E5484D",
  heat: ["#603F64", "#83518A", "#A85FA8", "#C8829A", "#EBB04A"],
} as const;

/** Heat bin for an occupancy ratio 0…1 (five equal 20% bins). */
export function heatBin(ratio: number) {
  return Math.min(viz.heat.length - 1, Math.max(0, Math.floor(ratio * viz.heat.length)));
}

/** Rounded 0–100 percentage for display. */
export const pct = (ratio: number) => Math.round(ratio * 100);

/** Count-axis ticks: clean steps (1, 2, 5 × 10ⁿ), about four intervals. */
export function countTicks(maxValue: number) {
  const target = 4;
  if (maxValue <= 0) return { max: target, ticks: [0, 2, 4] };
  const raw = maxValue / target;
  const exp = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, [1, 2, 5, 10].map((k) => k * exp).find((s) => s >= raw) ?? 10 * exp);
  const max = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v);
  return { max, ticks };
}

/** SVG path for a column: 4px rounded data end, square at the baseline. */
export function columnPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h}Z`;
}
