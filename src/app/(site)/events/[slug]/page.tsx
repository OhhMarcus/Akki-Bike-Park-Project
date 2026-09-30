import type { Metadata } from "next";
import { EventDetail } from "@/components/events/EventDetail";
import { getSeedEvents } from "@/content/events";
import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = true;

export function generateStaticParams() {
  return getSeedEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getSeedEvents().find((e) => e.slug === slug);
  return buildMetadata({
    title: event ? event.title : dictionary["events.meta.detailFallbackTitle"],
    description: event ? event.summary : dictionary["events.meta.detailFallbackDesc"],
    path: `/events/${slug}`,
  });
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventDetail slug={slug} />;
}
