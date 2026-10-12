import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";
import { LessonBookingPage } from "@/components/lessons/book/LessonBookingPage";

export function generateMetadata() {
  return buildMetadata({ title: dictionary["lessons.bookMeta.title"], description: dictionary["lessons.bookMeta.desc"], path: "/lessons/book" });
}

export default function Page() {
  return <LessonBookingPage />;
}
