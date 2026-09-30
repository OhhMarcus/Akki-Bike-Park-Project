import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getSeedEvents } from "@/content/events";

const routes = ["", "/park", "/booking", "/events", "/coaching", "/groups", "/visit", "/contact", "/my-bookings", "/privacy", "/terms", "/cancellation", "/waiver"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...routes.map((r) => ({ url: `${siteConfig.url}${r}`, lastModified: now, changeFrequency: "weekly" as const, priority: r === "" ? 1 : 0.7 })),
    ...getSeedEvents().map((e) => ({ url: `${siteConfig.url}/events/${e.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
