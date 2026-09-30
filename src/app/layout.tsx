import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getServerLocale } from "@/i18n/server";
import { Providers } from "@/components/layout/Providers";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const cjk = Noto_Sans_TC({ weight: ["400", "500", "700", "900"], variable: "--font-cjk", display: "swap", preload: false });

export const viewport: Viewport = { themeColor: "#0d0d0e", width: "device-width", initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: `${siteConfig.name[locale]} | AKKI Bike Park`, template: `%s | ${siteConfig.name[locale]}` },
    description: locale === "zh" ? "用不一樣的方式騎遍香港。預約單車樂園、教練課程及活動。" : "Ride Hong Kong differently. Book park entry, coaching and events at AKKI Bike Park.",
    applicationName: "AKKI Bike Park",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  return (
    <html lang={locale === "zh" ? "zh-Hant-HK" : "en"} className={`${display.variable} ${sans.variable} ${cjk.variable}`}>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
