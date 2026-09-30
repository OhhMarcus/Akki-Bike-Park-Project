import dynamic from "next/dynamic";
import { buildMetadata } from "@/lib/seo";
import { getServerT } from "@/i18n/server";
import { Hero } from "@/components/home/Hero";
import { QuickBooking } from "@/components/home/QuickBooking";
import { AudienceCards } from "@/components/home/AudienceCards";
import { ExperienceHighlights } from "@/components/home/ExperienceHighlights";

// Below-the-fold sections are code-split.
const TrailPreview = dynamic(() => import("@/components/home/TrailPreview").then((m) => m.TrailPreview));
const EventsCarousel = dynamic(() => import("@/components/home/EventsCarousel").then((m) => m.EventsCarousel));
const CoachingPreview = dynamic(() => import("@/components/home/CoachingPreview").then((m) => m.CoachingPreview));
const Gallery = dynamic(() => import("@/components/home/Gallery").then((m) => m.Gallery));
const TestimonialSlider = dynamic(() => import("@/components/home/TestimonialSlider").then((m) => m.TestimonialSlider));
const LocationTransport = dynamic(() => import("@/components/home/LocationTransport").then((m) => m.LocationTransport));
const SocialPreview = dynamic(() => import("@/components/home/SocialPreview").then((m) => m.SocialPreview));
const MembershipTeaser = dynamic(() => import("@/components/home/MembershipTeaser").then((m) => m.MembershipTeaser));
const FinalCTA = dynamic(() => import("@/components/home/FinalCTA").then((m) => m.FinalCTA));

export async function generateMetadata() {
  const { t, locale } = await getServerT();
  return buildMetadata({
    title: { en: "Mountain Bike Park in Hong Kong", zh: "香港山地單車樂園" },
    description: {
      en: "Ride, learn and belong at AKKI Bike Park. Book a first ride, join a coaching programme or bring your group.",
      zh: "在丫髻山地單車樂園騎行、學習、結識同好。預約首次騎行、報讀教練課程，或帶同團體到訪。",
    },
    path: "/",
  }).then((meta) => {
    void t;
    void locale;
    return meta;
  });
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickBooking />
      <AudienceCards />
      <ExperienceHighlights />
      <TrailPreview />
      <EventsCarousel />
      <CoachingPreview />
      <Gallery />
      <TestimonialSlider />
      <LocationTransport />
      <SocialPreview />
      <MembershipTeaser />
      <FinalCTA />
    </>
  );
}
