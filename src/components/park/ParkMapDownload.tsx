"use client";

import { Download } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { useToast } from "@/components/ui/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { DemoTag } from "@/components/common/DemoTag";
import { downloadFile } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { buildPlaceholderMapSvg } from "./mapSvg";

export function ParkMapDownload() {
  const { t, locale } = useI18n();
  const toast = useToast();
  const official = siteConfig.parkMapPdf.available;

  return (
    <section aria-labelledby="park-download-title" className="surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
      <div className="space-y-1">
        <h2 id="park-download-title" className="font-display text-2xl font-bold uppercase">
          {t("park.map.download.title")}
        </h2>
        <p className="text-sm text-silver">{t("park.map.download.body")}</p>
        {!official && (
          <p className="flex items-start gap-2 text-xs text-silver-dim">
            <DemoTag label={t("demo.placeholder")} />
            {t("park.map.download.note")}
          </p>
        )}
      </div>
      {official ? (
        <a href={siteConfig.parkMapPdf.href} download className={cn(buttonVariants({ variant: "secondary" }), "shrink-0")}>
          <Download className="h-4 w-4" aria-hidden />
          {t("park.map.download.official")}
        </a>
      ) : (
        <Button
          variant="secondary"
          className="shrink-0"
          onClick={() => {
            downloadFile(
              "akki-park-map-placeholder.svg",
              buildPlaceholderMapSvg(locale, t("park.map.svg.title"), t("park.map.svg.footer"), t("status.closed")),
              "image/svg+xml",
            );
            toast(t("park.map.download.done"), "success");
          }}
        >
          <Download className="h-4 w-4" aria-hidden />
          {t("park.map.download.placeholder")}
        </Button>
      )}
    </section>
  );
}
