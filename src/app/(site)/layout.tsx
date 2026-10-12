import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StickyBookBar } from "@/components/layout/StickyBookBar";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { JsonLd } from "@/components/common/JsonLd";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { getServerT } from "@/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getServerT();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-fg focus:px-4 focus:py-2 focus:text-ink">
        {t("nav.skip")}
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <StickyBookBar />
      <WhatsAppFab />
      <JsonLd data={localBusinessJsonLd(locale)} />
    </>
  );
}
