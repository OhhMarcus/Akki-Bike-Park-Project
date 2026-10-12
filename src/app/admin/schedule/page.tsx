import { ScheduleScreen } from "@/components/admin/plan/ScheduleScreen";
import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: dictionary["admin.nav.schedule"],
    description: dictionary["adminPlan.schedule.lead"],
    path: "/admin/schedule",
    noindex: true,
  });
}

export default function Page() {
  return <ScheduleScreen />;
}
