import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "Terms & Conditions", zh: "條款及細則" },
    description: { en: "Booking terms for AKKI Bike Park (placeholder).", zh: "AKKI 單車樂園預約條款（預留內容）。" },
    path: "/terms",
  });
}

export default function Page() {
  return <LegalPage doc="terms" />;
}
