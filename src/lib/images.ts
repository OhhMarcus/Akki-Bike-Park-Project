import manifest from "@/content/imageManifest.json";

/**
 * Photo slots. Drop a file named after the slot into /public/images
 * (jpg, png, webp or avif) and restart `npm run dev`. Missing slots show a
 * marked placeholder. Slot list: /public/images/README.md
 */
const files = manifest as Record<string, string>;

export function img(slot: string): string | undefined {
  const f = files[slot.toLowerCase()];
  return f ? `/images/${f}` : undefined;
}
