import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { MobileBookBar } from "@/components/layout/MobileBookBar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { BookingReminder } from "@/components/layout/BookingReminder";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { JsonLd } from "@/components/common/JsonLd";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { getServerT } from "@/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getServerT();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">{t("nav.skip")}</a>
      <DemoBanner />
      <AnnouncementBar />
      <Navigation />
      <main id="main">{children}</main>
      <Footer />
      <MobileBookBar />
      <BookingReminder />
      <JsonLd data={localBusinessJsonLd(locale)} />
    </>
  );
}
