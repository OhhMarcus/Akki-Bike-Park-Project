import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";
import { LessonsPage } from "@/components/lessons/LessonsPage";

export function generateMetadata() {
  return buildMetadata({ title: dictionary["lessons.meta.title"], description: dictionary["lessons.meta.desc"], path: "/lessons" });
}

export default function Page() {
  return <LessonsPage />;
}
