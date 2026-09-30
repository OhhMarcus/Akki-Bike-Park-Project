"use client";

import { FileText, Printer, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { downloadFile } from "@/lib/dates";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DemoTag } from "@/components/common/DemoTag";
import { groupGuidance } from "./GroupSizeSelector";
import { segmentMsgKey, type AddOnKey, type SegmentKey } from "./segments";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

export function GroupDocs({ segment, size, addOns }: { segment: SegmentKey; size: number; addOns: AddOnKey[] }) {
  const { t, l, money } = useI18n();
  const toast = useToast();
  const g = groupGuidance(segment, size);

  const rows = () => [
    [t("groups.doc.type"), t(segmentMsgKey(segment))],
    [t("groups.doc.size"), t("groups.size.riders", { n: size })],
    [t("groups.doc.coaches"), String(g.coaches)],
    [t("groups.doc.range"), `${money(g.low)} – ${money(g.high)}`],
    [t("groups.doc.addons"), addOns.length ? addOns.map((a) => t(`groups.addons.${a}`)).join(", ") : t("groups.doc.none")],
  ];

  const downloadRisk = () => {
    downloadFile("akki-risk-assessment-placeholder.txt", `${l(siteConfig.name)}\n\n${t("groups.doc.riskBody")}\n`);
    toast(t("groups.docs.downloaded"), "success");
  };

  const html = () =>
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(t("groups.doc.proposalHead"))}</title><style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 16px;color:#111}td{padding:8px 12px;border-bottom:1px solid #ddd}td:first-child{color:#555}</style></head><body><h1>${esc(l(siteConfig.name))}</h1><h2>${esc(t("groups.doc.proposalHead"))}</h2><table>${rows().map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</table><p>${esc(t("groups.doc.footer"))}</p></body></html>`;

  const downloadProposal = () => {
    downloadFile("akki-group-proposal-placeholder.html", html(), "text/html");
    toast(t("groups.docs.downloaded"), "success");
  };

  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return downloadProposal();
    w.document.write(html());
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div>
      <h3 className="font-display text-xl font-bold uppercase">{t("groups.docs.title")}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="surface flex flex-col gap-3 p-5">
          <ShieldCheck className="h-5 w-5 text-silver" aria-hidden />
          <div>
            <p className="flex flex-wrap items-center gap-2 font-semibold">{t("groups.docs.risk")} <DemoTag /></p>
            <p className="mt-1 text-sm text-silver">{t("groups.docs.riskDesc")}</p>
          </div>
          <Button variant="secondary" onClick={downloadRisk} className="mt-auto">{t("btn.download")}</Button>
        </div>
        <div className="surface flex flex-col gap-3 p-5">
          <FileText className="h-5 w-5 text-silver" aria-hidden />
          <div>
            <p className="flex flex-wrap items-center gap-2 font-semibold">{t("groups.docs.proposal")} <DemoTag /></p>
            <p className="mt-1 text-sm text-silver">{t("groups.docs.proposalDesc")}</p>
          </div>
          <div className="mt-auto flex flex-wrap gap-2">
            <Button variant="secondary" onClick={downloadProposal}>{t("btn.download")}</Button>
            <Button variant="ghost" onClick={print}><Printer className="h-4 w-4" aria-hidden />{t("groups.docs.print")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
