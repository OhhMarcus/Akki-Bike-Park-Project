import type { LocalizedText } from "@/types";

/**
 * SINGLE SOURCE OF TRUTH for business information that has not been verified.
 * Every value with `verified: false` is a placeholder. Replace it with official
 * AKKI information, then set `verified: true`. Nothing else in the codebase
 * hard-codes an address, phone number, email or opening hour.
 */
export const siteConfig = {
  name: { en: "AKKI Bike Park", zh: "丫髻山地單車樂園" } as LocalizedText,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  showDemoLabels: process.env.NEXT_PUBLIC_SHOW_DEMO_LABELS !== "false",

  address: {
    verified: false,
    en: "Address to be confirmed from official AKKI information, Hong Kong",
    zh: "地址待根據 AKKI 官方資料確認，香港",
    // Coordinates deliberately omitted until confirmed.
    mapQuery: "AKKI Bike Park Hong Kong",
  },

  contact: {
    verified: false,
    phone: "+852 0000 0000",
    email: "hello@akki-demo.example",
    whatsapp: "85200000000", // digits only, international format
    responseTime: { en: "Response time to be confirmed (placeholder)", zh: "回覆時間待確認（預留）" } as LocalizedText,
  },

  social: {
    verified: false,
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
  },

  /** Placeholder opening hours. Shown with a DEMO label until verified. */
  hours: {
    verified: false,
    summary: { en: "Opening hours to be confirmed by AKKI", zh: "開放時間待 AKKI 確認" } as LocalizedText,
    rows: [
      { day: { en: "Weekdays", zh: "平日" } as LocalizedText, time: "TBC" },
      { day: { en: "Weekends & public holidays", zh: "週末及公眾假期" } as LocalizedText, time: "TBC" },
    ],
  },

  /** Session times used by the booking prototype. Placeholder values. */
  sessions: {
    verified: false,
    morning: { start: "09:00", end: "12:30" },
    afternoon: { start: "13:30", end: "17:00" },
    fullday: { start: "09:00", end: "17:00" },
  },

  /** Base park capacity per session (placeholder). */
  capacityPerSession: 40,

  parking: {
    verified: false,
    text: { en: "Parking information to be confirmed by AKKI.", zh: "泊車資訊待 AKKI 確認。" } as LocalizedText,
  },

  emergency: {
    verified: false,
    text: {
      en: "In an emergency call 999. On-site first-aid and incident procedure to be confirmed by AKKI.",
      zh: "如遇緊急情況請致電 999。場內急救及事故處理程序待 AKKI 確認。",
    } as LocalizedText,
  },

  weatherPlaceholder: { en: "Weather feed coming soon", zh: "天氣資訊即將推出" } as LocalizedText,

  /** Set true once a real park map PDF is placed at /public/akki-park-map.pdf */
  parkMapPdf: { available: false, href: "/akki-park-map.pdf" },

  waiverVersion: "demo-v0.1",
  cancellationWindowHours: 48,
} as const;

export const demoAdmin = {
  email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@akki-demo.hk",
  password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "akki-demo-2025",
};

export function whatsappUrl(text?: string) {
  const base = `https://wa.me/${siteConfig.contact.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
