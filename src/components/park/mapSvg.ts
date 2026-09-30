import { difficultyColors, trails } from "@/content/trails";
import type { Locale } from "@/types";
import { CLOSED_COLOR, CLOSED_DASH, difficultyDash } from "./trailStyle";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Placeholder SVG map generated from trail data (light background so it prints). */
export function buildPlaceholderMapSvg(locale: Locale, title: string, footer: string, closedLabel: string): string {
  const paths = trails
    .map((tr, i) => {
      const color = tr.open ? difficultyColors[tr.difficulty] : CLOSED_COLOR;
      const stroke = tr.open && tr.difficulty === "advanced" ? "#111113" : color;
      const dash = tr.open ? difficultyDash[tr.difficulty] : CLOSED_DASH;
      return (
        `<path d="${tr.path}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>` +
        `<circle cx="${tr.label.x}" cy="${tr.label.y}" r="11" fill="#fff" stroke="#111113"/>` +
        `<text x="${tr.label.x}" y="${tr.label.y + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#111113">${i + 1}</text>`
      );
    })
    .join("");
  const legend = trails
    .map((tr, i) => `<text x="16" y="${420 + i * 18}" font-size="12" fill="#111113">${i + 1}. ${esc(tr.name[locale])}${tr.open ? "" : ` (${esc(closedLabel)})`}</text>`)
    .join("");
  const height = 420 + trails.length * 18 + 40;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ${height}" width="600" height="${height}" font-family="sans-serif">` +
    `<rect width="600" height="${height}" fill="#f4f3ef"/>` +
    `<text x="16" y="26" font-size="16" font-weight="700" fill="#111113">${esc(title)}</text>` +
    `<g transform="translate(0 30)">${paths}</g>` +
    `<g transform="translate(0 0)">${legend}</g>` +
    `<text x="16" y="${height - 14}" font-size="11" fill="#8a6d00">${esc(footer)}</text>` +
    `</svg>`
  );
}
