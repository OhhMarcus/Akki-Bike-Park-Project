import type { LocalizedText } from "@/types";

/**
 * PLACEHOLDER quotes only. Do NOT present these as real reviews.
 * To go live: replace each entry with a real, permissioned quote and set
 * `isPlaceholder: false` (the "Placeholder" tag then disappears).
 */
const L = (en: string, zh: string): LocalizedText => ({ en, zh });

export type Testimonial = {
  id: string;
  quote: LocalizedText;
  author: LocalizedText;
  isPlaceholder: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: "tq1",
    quote: L(
      "Rider quote placeholder: add a real, permissioned review from a first-time rider.",
      "車手評語預留：請加入首次騎行車手的真實、已獲授權評語。",
    ),
    author: L("First-time rider (placeholder)", "首次騎行車手（預留）"),
    isPlaceholder: true,
  },
  {
    id: "tq2",
    quote: L(
      "Rider quote placeholder: add a real, permissioned review from a parent or guardian.",
      "車手評語預留：請加入家長或監護人的真實、已獲授權評語。",
    ),
    author: L("Parent (placeholder)", "家長（預留）"),
    isPlaceholder: true,
  },
  {
    id: "tq3",
    quote: L(
      "Rider quote placeholder: add a real, permissioned review from an experienced rider or coach.",
      "車手評語預留：請加入資深車手或教練的真實、已獲授權評語。",
    ),
    author: L("Experienced rider (placeholder)", "資深車手（預留）"),
    isPlaceholder: true,
  },
];
