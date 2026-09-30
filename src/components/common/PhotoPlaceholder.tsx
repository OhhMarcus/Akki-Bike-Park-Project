"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Action-photo slot. Pass `src` (a file in /public or a remote URL configured in
 * next.config) to swap in a real photograph; without it a topographic placeholder renders.
 * `alt` is always required and should describe the intended photo.
 */
export function PhotoPlaceholder({ alt, src, className, caption, priority, children }: { alt: string; src?: string; className?: string; caption?: string; priority?: boolean; children?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div role="img" aria-label={alt} className={cn("topo relative isolate overflow-hidden bg-graphite-900", className)}>
      {src ? (
        <Image src={src} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority={priority} />
      ) : (
        <>
          <svg aria-hidden className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
            <path d="M-10 230 C80 190 120 260 210 210 S340 150 420 190" fill="none" stroke="#b8bcc4" strokeOpacity=".28" strokeWidth="2" />
            <path d="M-10 262 C90 230 150 290 240 245 S350 200 420 230" fill="none" stroke="#b8bcc4" strokeOpacity=".16" strokeWidth="2" />
            <circle cx="292" cy="176" r="5" fill="#b8bcc4" fillOpacity=".5" />
          </svg>
          {siteConfig.showDemoLabels && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded bg-black/50 px-2 py-1 text-[11px] text-silver">
              <Camera className="h-3 w-3" aria-hidden />
              {caption ?? t("demo.photo")}
            </div>
          )}
        </>
      )}
      {children}
    </div>
  );
}
