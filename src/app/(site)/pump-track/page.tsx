import { Suspense } from "react";
import { pumpMessages } from "@/i18n/messages/pump";
import { buildMetadata } from "@/lib/seo";
import { PumpTrackPage } from "@/components/pump/PumpTrackPage";

export async function generateMetadata() {
  return buildMetadata({ title: pumpMessages["pump.meta.title"], description: pumpMessages["pump.meta.description"], path: "/pump-track" });
}

export default function Page() {
  // useSearchParams (?date=) inside needs a Suspense boundary.
  return (
    <Suspense>
      <PumpTrackPage />
    </Suspense>
  );
}
