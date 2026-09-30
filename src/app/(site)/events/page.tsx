import type { Metadata } from "next";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { getServerT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { dictionary } from "@/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: dictionary["events.meta.title"],
    description: dictionary["events.meta.desc"],
    path: "/events",
  });
}

export default async function EventsPage() {
  const { t } = await getServerT();
  return (
    <>
      <header className="container pb-8 pt-16 md:pt-24">
        <p className="eyebrow">{t("events.eyebrow")}</p>
        <h1 className="h-display mt-3">{t("events.h1")}</h1>
        <p className="mt-4 max-w-xl text-silver">{t("events.lead")}</p>
      </header>
      <EventsExplorer />
    </>
  );
}
