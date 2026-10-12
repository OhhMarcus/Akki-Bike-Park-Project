import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { seedEvents } from "@/content/events";
import { hkToday } from "@/lib/time";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/lessons", "/lessons/book", "/pump-track", "/events", "/club", "/visit"];
  return [
    ...routes.map((r) => ({ url: `${site.url}${r}`, lastModified: now, changeFrequency: "daily" as const, priority: r === "" ? 1 : 0.8 })),
    ...seedEvents(hkToday()).map((e) => ({ url: `${site.url}/events/${e.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
  ];
}
