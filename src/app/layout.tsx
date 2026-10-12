import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { getServerLocale } from "@/i18n/server";
import { Providers } from "@/components/layout/Providers";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const cjk = Noto_Sans_TC({ weight: ["400", "500", "700", "900"], variable: "--font-cjk", display: "swap", preload: false });

export const viewport: Viewport = { themeColor: "#080808", width: "device-width", initialScale: 1, viewportFit: "cover" };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    metadataBase: new URL(site.url),
    title: { default: site.name[locale], template: `%s | ${site.name[locale]}` },
    description:
      locale === "zh"
        ? "上水 Pump Track、跳台同山徑。網上預約課程同 Pump Track 時段，睇最新活動同比賽。"
        : "Pump track, jumps and trails in Sheung Shui. Book lessons and pump track sessions online, and catch the next race.",
    applicationName: site.name.en,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  return (
    <html lang={locale === "zh" ? "zh-Hant-HK" : "en-HK"} className={`${display.variable} ${sans.variable} ${cjk.variable}`}>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
