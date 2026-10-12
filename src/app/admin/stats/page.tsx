import { StatsScreen } from "@/components/admin/insights/StatsScreen";
import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: dictionary["adminInsights.stats.title"],
    description: dictionary["adminInsights.stats.lead"],
    path: "/admin/stats",
    noindex: true,
  });
}

export default function Page() {
  return <StatsScreen />;
}
