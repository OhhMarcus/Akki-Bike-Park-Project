import { buildMetadata } from "@/lib/seo";
import { getServerT } from "@/i18n/server";
import { ContactForm, parseTopic } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "Contact", zh: "聯絡我們" },
    description: { en: "Get in touch with AKKI Bike Park about bookings, groups, sponsorship and partnerships.", zh: "就預約、團體、贊助及合作夥伴查詢聯絡丫髻山地單車樂園。" },
    path: "/contact",
  });
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string | string[] }> }) {
  const { t } = await getServerT();
  const sp = await searchParams;
  const topic = parseTopic(Array.isArray(sp.topic) ? sp.topic[0] : sp.topic);
  return (
    <>
      <section className="topo border-b border-graphite-800">
        <div className="container py-16 md:py-24">
          <p className="eyebrow">{t("contact.eyebrow")}</p>
          <h1 className="h-display mt-3">{t("contact.title")}</h1>
          <p className="mt-4 max-w-xl text-lg text-silver">{t("contact.lead")}</p>
        </div>
      </section>
      <div className="container grid gap-8 py-12 md:py-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
        <ContactForm initialTopic={topic} />
        <ContactInfo />
      </div>
    </>
  );
}
