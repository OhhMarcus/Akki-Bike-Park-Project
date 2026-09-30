import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal/LegalPage";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "Cancellation Policy", zh: "取消政策" },
    description: { en: "Demo cancellation and weather policy (to be confirmed by AKKI).", zh: "示範取消及天氣政策（待 AKKI 確認）。" },
    path: "/cancellation",
  });
}

export default function Page() {
  return <LegalPage doc="cancellation" />;
}
