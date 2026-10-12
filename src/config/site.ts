import type { LocalizedText } from "@/types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  AKKI DEMO — EVERY PLACEHOLDER LIVES IN THIS FILE.
 *  Swap a value, then flip its `placeholder` flag to false so the
 *  amber "SWAP" marker disappears from the site.
 *
 *  Also placeholders, but edited elsewhere:
 *   • Opening hours, session length, capacity → src/config/schedule.ts
 *     (and live in Admin → Schedule)
 *   • Photos → drop files in /public/images (see README there)
 * ════════════════════════════════════════════════════════════════════
 */

export const site = {
  name: { en: "AKKI Bike Park", zh: "丫髻山地單車樂園" } as LocalizedText,
  /** set in next.config.mjs: NEXT_PUBLIC_SITE_URL, else the Vercel address, else localhost */
  url: process.env.AKKI_SITE_URL ?? "http://localhost:3000",

  location: {
    placeholder: true,
    /** Area as given in the brief. Exact address still to come. */
    area: { en: "Sheung Shui, near Shek Wu San Tsuen", zh: "上水石湖新村附近" } as LocalizedText,
    address: { en: "Full address to be confirmed", zh: "詳細地址待確認" } as LocalizedText,
    mapQuery: "AKKI Bike Park Sheung Shui Hong Kong",
    station: { en: "Sheung Shui Station (East Rail Line)", zh: "港鐵上水站（東鐵綫）" } as LocalizedText,
  },

  whatsapp: {
    placeholder: true,
    /** Shown on the site, +852 format */
    display: "+852 0000 0000",
  },

  email: { placeholder: true, value: "hello@akki-bikepark.example" },

  social: {
    placeholder: true,
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },

  /** All prices in HK$. PLACEHOLDERS until AKKI confirms a price list. */
  prices: {
    placeholder: true,
    lesson: { foundation: 480, advanced: 580 },
    pack5: { foundation: 2100, advanced: 2550 },
    pumpPerRider: 120,
    bikeRental: 100,
    helmetRental: 20,
  },

  /** AKKI Bike Club. PLACEHOLDER details. */
  club: {
    placeholder: true,
    annualFeeHKD: 300,
  },

  /** Sample weather. Production: HK Observatory open data (rhrread / warnsum). */
  weather: { sample: true },
} as const;

export type Site = typeof site;
