"use client";

import { useAvailability, useNowHK } from "@/lib/hooks";
import { BrushDivider } from "@/components/brand/Brush";
import { PatternDivider } from "@/components/brand/Pattern";
import { ClubTeaser } from "./ClubTeaser";
import { EventsTeaser } from "./EventsTeaser";
import { Hero } from "./Hero";
import { LessonsTeaser } from "./LessonsTeaser";
import { PumpTeaser } from "./PumpTeaser";
import { RideBand } from "./RideBand";
import { VisitTeaser } from "./VisitTeaser";

/** Home: one HK clock and one availability view shared by every live section. */
export function HomePage() {
  const now = useNowHK();
  const avail = useAvailability(now);
  return (
    <>
      <Hero now={now} avail={avail} />
      <PumpTeaser now={now} avail={avail} />
      <BrushDivider />
      <LessonsTeaser now={now} avail={avail} />
      <RideBand />
      <EventsTeaser now={now} avail={avail} />
      <ClubTeaser />
      <PatternDivider className="mt-8 sm:mt-10" />
      <VisitTeaser />
    </>
  );
}
