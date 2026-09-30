import { BookingFlow } from "@/components/booking/BookingFlow";
import { getServerT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "Book a Ride", zh: "預約騎行" },
    description: { en: "Choose an experience, pick a date and book your ride at AKKI Bike Park. Demonstration booking flow.", zh: "選擇體驗、揀日子，預約丫髻山地單車樂園。示範預約流程。" },
    path: "/booking",
  });
}

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BookingPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { t } = await getServerT();
  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <p className="eyebrow">{t("nav.book")}</p>
      <h1 className="h-section mt-2">{t("booking.title")}</h1>
      <div className="mt-6">
        <BookingFlow
          init={{
            exp: one(sp.exp) ?? one(sp.experience),
            event: one(sp.event),
            date: one(sp.date),
            promo: one(sp.promo) ?? one(sp.ref),
            waitlist: one(sp.waitlist) === "1",
          }}
        />
      </div>
    </div>
  );
}
