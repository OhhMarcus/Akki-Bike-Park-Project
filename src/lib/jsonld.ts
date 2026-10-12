import { site } from "@/config/site";
import type { Locale, ParkEvent } from "@/types";

/** LocalBusiness + SportsActivityLocation. Address/phone are left out while they are placeholders. */
export function localBusinessJsonLd(locale: Locale) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    name: site.name[locale],
    alternateName: [site.name.en, site.name.zh],
    url: site.url,
    sport: "Mountain biking",
    areaServed: "Hong Kong",
  };
  if (!site.location.placeholder) data.address = { "@type": "PostalAddress", streetAddress: site.location.address[locale], addressCountry: "HK" };
  if (!site.whatsapp.placeholder) data.telephone = site.whatsapp.display;
  return data;
}

export function eventJsonLd(e: ParkEvent, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: e.title[locale],
    description: e.summary[locale],
    startDate: `${e.date}T${e.start}:00+08:00`,
    endDate: `${e.date}T${e.end}:00+08:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: site.name[locale], address: site.location.area[locale] },
    url: `${site.url}/events/${e.slug}`,
  };
}
