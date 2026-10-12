import type { Metadata } from "next";
import { site } from "@/config/site";
import { getServerLocale } from "@/i18n/server";
import type { LocalizedText } from "@/types";

/** Per-page bilingual metadata (title, description, Open Graph). */
export async function buildMetadata(o: { title: LocalizedText; description: LocalizedText; path: string; noindex?: boolean }): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = o.title[locale];
  const description = o.description[locale];
  const url = `${site.url}${o.path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: o.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${title} | ${site.name[locale]}`,
      description,
      url,
      siteName: site.name[locale],
      locale: locale === "zh" ? "zh_HK" : "en_HK",
      type: "website",
      images: [{ url: "/brand/akki-logo.png", width: 1317, height: 616, alt: site.name.en }],
    },
  };
}
