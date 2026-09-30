import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "Privacy Policy", zh: "私隱政策" },
    description: { en: "How AKKI Bike Park intends to handle rider data (placeholder).", zh: "AKKI 單車樂園處理車手資料的方針（預留內容）。" },
    path: "/privacy",
  });
}

export default function Page() {
  return <LegalPage doc="privacy" />;
}
