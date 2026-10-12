import type { Metadata } from "next";
import { seedEvents } from "@/content/events";
import { eventsMessages } from "@/i18n/messages/events";
import { getServerLocale } from "@/i18n/server";
import { eventJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { hkToday } from "@/lib/time";
import { JsonLd } from "@/components/common/JsonLd";
import { EventDetail } from "@/components/events/EventDetail";

type Props = { params: Promise<{ slug: string }> };

/** Events created in Admin → Events live in the browser store, so unknown slugs still render (the client looks them up). */
export const dynamicParams = true;

const seedEvent = (slug: string) => seedEvents(hkToday()).find((e) => e.slug === slug && e.published);

export function generateStaticParams() {
  return seedEvents(hkToday()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = seedEvent(slug);
  return buildMetadata({
    title: event?.title ?? eventsMessages["events.meta.title"],
    description: event?.summary ?? eventsMessages["events.meta.desc"],
    path: `/events/${slug}`,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const event = seedEvent(slug);
  const locale = await getServerLocale();
  return (
    <>
      {event && <JsonLd data={eventJsonLd(event, locale)} />}
      <EventDetail slug={slug} />
    </>
  );
}
