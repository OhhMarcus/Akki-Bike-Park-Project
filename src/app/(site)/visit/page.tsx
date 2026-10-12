import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";
import { VisitPage } from "@/components/visit/VisitPage";

export function generateMetadata() {
  return buildMetadata({ title: dictionary["visit.meta.title"], description: dictionary["visit.meta.description"], path: "/visit" });
}

export default function Page() {
  return <VisitPage />;
}
