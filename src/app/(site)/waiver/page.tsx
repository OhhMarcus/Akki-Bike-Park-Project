import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "Waiver & Guardian Consent", zh: "免責聲明及監護人同意" },
    description: { en: "Placeholder rider waiver and approach to riders under 18.", zh: "預留車手免責聲明及 18 歲以下車手安排。" },
    path: "/waiver",
  });
}

export default function Page() {
  return <LegalPage doc="waiver" />;
}
