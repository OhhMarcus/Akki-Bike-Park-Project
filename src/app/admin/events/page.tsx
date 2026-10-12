import { EventsScreen } from "@/components/admin/plan/EventsScreen";
import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: dictionary["admin.nav.events"],
    description: dictionary["adminPlan.events.lead"],
    path: "/admin/events",
    noindex: true,
  });
}

export default function Page() {
  return <EventsScreen />;
}
