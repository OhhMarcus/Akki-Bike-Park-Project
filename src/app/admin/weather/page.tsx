import { WeatherScreen } from "@/components/admin/plan/WeatherScreen";
import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: dictionary["admin.nav.weather"],
    description: dictionary["adminPlan.weather.lead"],
    path: "/admin/weather",
    noindex: true,
  });
}

export default function Page() {
  return <WeatherScreen />;
}
