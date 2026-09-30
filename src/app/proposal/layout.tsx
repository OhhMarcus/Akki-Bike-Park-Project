import type { Metadata } from "next";
import { ProposalTopBar } from "@/components/proposal/ProposalTopBar";

export const metadata: Metadata = {
  title: "Private proposal | AKKI Bike Park",
  description: "Private sales proposal for AKKI management.",
  robots: { index: false, follow: false },
};

const printCss = `
@media print {
  .proposal-root, .proposal-root * { color: #111 !important; background: transparent !important; border-color: #bbb !important; box-shadow: none !important; }
  .proposal-root .topo { background-image: none !important; }
  .proposal-root a { text-decoration: none; }
  .proposal-root h1 { font-size: 34pt !important; }
  .proposal-root section { padding-top: 18pt !important; padding-bottom: 18pt !important; }
  @page { margin: 14mm; }
}
`;

export default function ProposalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="proposal-root min-h-screen">
      <style>{printCss}</style>
      <ProposalTopBar />
      {children}
    </div>
  );
}
