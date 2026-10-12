import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";
import { TodayScreen } from "@/components/admin/ops/TodayScreen";

export async function generateMetadata() {
  return buildMetadata({ title: dictionary["admin.nav.today"], description: dictionary["adminOps.today.meta"], path: "/admin", noindex: true });
}

export default function Page() {
  return <TodayScreen />;
}
