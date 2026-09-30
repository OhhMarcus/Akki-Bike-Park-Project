import { Hero } from "@/components/proposal/Hero";
import { SectionNav } from "@/components/proposal/SectionNav";
import { FrictionSection } from "@/components/proposal/FrictionSection";
import { BenefitsSection } from "@/components/proposal/BenefitsSection";
import { JourneySection } from "@/components/proposal/JourneySection";
import { PhasesSection } from "@/components/proposal/PhasesSection";
import { PricingSection } from "@/components/proposal/PricingSection";
import { RoadmapSection } from "@/components/proposal/RoadmapSection";
import { NeedsSection } from "@/components/proposal/NeedsSection";
import { NextSection } from "@/components/proposal/NextSection";

export default function ProposalPage() {
  return (
    <main id="main" className="container pb-16 lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-12">
      <SectionNav />
      <div className="min-w-0">
        <Hero />
        <FrictionSection />
        <BenefitsSection />
        <JourneySection />
        <PhasesSection />
        <PricingSection />
        <RoadmapSection />
        <NeedsSection />
        <NextSection />
      </div>
    </main>
  );
}
