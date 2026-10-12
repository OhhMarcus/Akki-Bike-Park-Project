import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";
import { ClubPage } from "@/components/club/ClubPage";

export function generateMetadata() {
  return buildMetadata({ title: dictionary["club.meta.title"], description: dictionary["club.meta.description"], path: "/club" });
}

export default function Page() {
  return <ClubPage />;
}
