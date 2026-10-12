import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";
import { HomePage } from "@/components/home/HomePage";

export function generateMetadata() {
  return buildMetadata({ title: dictionary["home.meta.title"], description: dictionary["home.meta.description"], path: "/" });
}

export default function Page() {
  return <HomePage />;
}
