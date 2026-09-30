import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getServerLocale } from "@/i18n/server";
import type { LocalizedText } from "@/types";

/** Per-page bilingual metadata. `path` is the canonical route (e.g. "/park"). */
export async function buildMetadata(opts: { title: LocalizedText; description: LocalizedText; path: string; noindex?: boolean }): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = opts.title[locale];
  const description = opts.description[locale];
  const url = `${siteConfig.url}${opts.path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${title} | ${siteConfig.name[locale]}`,
      description,
      url,
      siteName: siteConfig.name[locale],
      locale: locale === "zh" ? "zh_HK" : "en_HK",
      alternateLocale: locale === "zh" ? ["en_HK"] : ["zh_HK"],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
