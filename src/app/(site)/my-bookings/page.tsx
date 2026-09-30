import { MyBookings } from "@/components/booking/MyBookings";
import { getServerT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "My Bookings", zh: "我的預約" },
    description: { en: "View, add to calendar, change or cancel your AKKI Bike Park bookings.", zh: "查看預約、加入日曆、更改或取消你的 AKKI 單車樂園預約。" },
    path: "/my-bookings",
    noindex: true,
  });
}

export default async function MyBookingsPage() {
  const { t } = await getServerT();
  return (
    <div className="container max-w-4xl py-10 md:py-16">
      <p className="eyebrow">{t("nav.myBookings")}</p>
      <h1 className="h-section mt-2">{t("booking.my.title")}</h1>
      <p className="mt-3 max-w-xl text-silver">{t("booking.my.intro")}</p>
      <div className="mt-10">
        <MyBookings />
      </div>
    </div>
  );
}
