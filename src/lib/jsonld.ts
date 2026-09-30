import { siteConfig } from "@/config/site";
import type { Locale, ParkEvent } from "@/types";

/**
 * LocalBusiness + SportsActivityLocation. Address/phone/hours are only emitted
 * once verified in src/config/site.ts, so search engines never see placeholders.
 */
export function localBusinessJsonLd(locale: Locale) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    name: siteConfig.name[locale],
    alternateName: [siteConfig.name.en, siteConfig.name.zh],
    url: siteConfig.url,
    sport: "Mountain biking",
    inLanguage: ["en", "zh-Hant-HK"],
    areaServed: "Hong Kong",
  };
  if (siteConfig.address.verified) data.address = { "@type": "PostalAddress", streetAddress: siteConfig.address[locale], addressCountry: "HK" };
  if (siteConfig.contact.verified) {
    data.telephone = siteConfig.contact.phone;
    data.email = siteConfig.contact.email;
  }
  return data;
}

/** Event JSON-LD for real (non-demo), published events only. Returns null for demos. */
export function eventJsonLd(e: ParkEvent, locale: "en" | "zh") {
  if (e.isDemo || !e.published) return null;
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: e.title[locale],
    description: e.summary[locale],
    startDate: `${e.date}T${e.startTime}:00+08:00`,
    endDate: `${e.date}T${e.endTime}:00+08:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: siteConfig.name[locale], address: siteConfig.address[locale] },
    ...(e.priceHKD != null
      ? { offers: { "@type": "Offer", price: e.priceHKD, priceCurrency: "HKD", url: `${siteConfig.url}/events/${e.slug}`, availability: "https://schema.org/InStock" } }
      : {}),
    url: `${siteConfig.url}/events/${e.slug}`,
  };
}
