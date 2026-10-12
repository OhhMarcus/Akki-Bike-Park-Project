import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";
import { AddBookingScreen } from "@/components/admin/ops/AddBookingScreen";

export async function generateMetadata() {
  return buildMetadata({ title: dictionary["admin.nav.add"], description: dictionary["adminOps.add.meta"], path: "/admin/bookings/new", noindex: true });
}

export default function Page() {
  return <AddBookingScreen />;
}
