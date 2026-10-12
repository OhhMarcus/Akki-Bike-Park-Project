import { RidersScreen } from "@/components/admin/insights/RidersScreen";
import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: dictionary["adminInsights.riders.title"],
    description: dictionary["adminInsights.riders.lead"],
    path: "/admin/riders",
    noindex: true,
  });
}

export default function Page() {
  return <RidersScreen />;
}
