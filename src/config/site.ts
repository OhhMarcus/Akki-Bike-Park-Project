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

  /** Official AKKI website (from research pack). */
  officialSite: "https://www.akkigroup.co/pages/akki-bike-park",

  /**
   * Area-level address only. Sources disagree on the street number (89 vs 59
   * Ha Mei San Tsuen), so no number is shown until AKKI confirms it in writing.
   */
  address: {
    verified: true,
    en: "Ha Mei San Tsuen, Ping Shan, Yuen Long, New Territories, Hong Kong",
    zh: "香港新界元朗屏山蝦尾新村",
    mapQuery: "AKKI Bike Park Ha Mei San Tsuen Ping Shan Yuen Long Hong Kong",
  },

  contact: {
    /** Phone/WhatsApp is AKKI's published enquiry and booking number. */
    verified: true,
    phone: "+852 9020 5724",
    /** No public email found: placeholder until AKKI supplies one. */
    emailVerified: false,
    email: "hello@akki-demo.example",
    whatsapp: "85290205724", // digits only, international format
    responseTime: { en: "Response time to be confirmed by AKKI", zh: "回覆時間待 AKKI 確認" } as LocalizedText,
  },

  social: {
    verified: false,
    instagram: "https://www.instagram.com/akki.bike.park/",
    // Facebook page name: "AKKI Bike Park 丫髻山地單車樂園" (direct URL not confirmed).
    facebook: "https://www.facebook.com/search/top?q=AKKI%20Bike%20Park%20%E4%B8%AB%E9%AB%BB%E5%B1%B1%E5%9C%B0%E5%96%AE%E8%BB%8A%E6%A8%82%E5%9C%92",
    youtube: "https://www.youtube.com/results?search_query=AKKI+Bike+Park",
  },

  /** Published daily hours (medium-high confidence). Holiday and weather closures are not published. */
  hours: {
    verified: true,
    summary: { en: "Daily 10:00–19:00. WhatsApp before travelling", zh: "每日 10:00–19:00，出發前請先 WhatsApp 查詢" } as LocalizedText,
    rows: [
      { day: { en: "Monday – Sunday", zh: "星期一至日" } as LocalizedText, time: "10:00–19:00" as string },
      { day: { en: "Holidays & bad weather", zh: "假期及惡劣天氣" } as LocalizedText, time: "WhatsApp" as string },
    ],
  },

  /** Booking-prototype session slots, aligned to the published 10:00–19:00 hours. Real session lengths TBC. */
  sessions: {
    verified: false,
    morning: { start: "10:00", end: "14:00" },
    afternoon: { start: "14:00", end: "19:00" },
    fullday: { start: "10:00", end: "19:00" },
  },

  /** Base park capacity per session (placeholder). */
  capacityPerSession: 40,

  parking: {
    verified: false,
    text: { en: "On-site parking is reported. Price, capacity and EV-charging terms to be confirmed by AKKI.", zh: "據報場地設有泊車位。收費、車位數目及電動車充電安排待 AKKI 確認。" } as LocalizedText,
  },

  emergency: {
    verified: false,
    text: {
      en: "In an emergency call 999. AKKI states on-site staff hold first-aid certificates; the incident procedure is to be confirmed by AKKI.",
      zh: "如遇緊急情況請致電 999。AKKI 表示場內職員持有急救證書，事故處理程序待 AKKI 確認。",
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
