import type { Metadata } from "next";
import { eventsMessages } from "@/i18n/messages/events";
import { buildMetadata } from "@/lib/seo";
import { EventsPage } from "@/components/events/EventsPage";

export function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: eventsMessages["events.meta.title"], description: eventsMessages["events.meta.desc"], path: "/events" });
}

export default function Page() {
  return <EventsPage />;
}
