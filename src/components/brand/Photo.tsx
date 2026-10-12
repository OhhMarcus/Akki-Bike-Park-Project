"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { img } from "@/lib/images";
import { usePrefs } from "@/lib/hooks";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

const fades = {
  edges: "radial-gradient(ellipse at center, rgba(8,8,8,0) 35%, rgba(8,8,8,.88) 100%)",
  bottom: "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,.55) 35%, rgba(8,8,8,0) 70%)",
  left: "linear-gradient(to right, rgba(8,8,8,.96) 0%, rgba(8,8,8,.7) 40%, rgba(8,8,8,.1) 100%)",
  full: "linear-gradient(to top, rgba(8,8,8,.95), rgba(8,8,8,.35) 60%, rgba(8,8,8,.55)), radial-gradient(ellipse at center, transparent 40%, rgba(8,8,8,.7))",
  none: "",
} as const;

/**
 * Action-photo slot. With a file in /public/images/<slot>.* it shows the
 * photo full-bleed with a dark fade so text can sit on it. Without one it
 * shows the pattern plus a "Swap photo" marker.
 */
export function Photo({
  slot, alt, what, className, fade = "edges", priority, sizes = "100vw", children, rounded = true,
}: {
  slot: string;
  /** describes the intended photo, translated */
  alt: string;
  /** short label for the swap marker, translated */
  what: string;
  className?: string;
  fade?: keyof typeof fades;
  priority?: boolean;
  sizes?: string;
  children?: React.ReactNode;
  rounded?: boolean;
}) {
  const { t } = useI18n();
  const [prefs] = usePrefs();
  const src = img(slot);
  return (
    <div className={cn("relative isolate overflow-hidden bg-card", rounded && "rounded-lg", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="-z-20 object-cover" />
      ) : (
        <div role="img" aria-label={alt} className="pattern-dim-bg absolute inset-0 -z-20">
          {prefs.swapMarkers && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm border border-dashed border-brand-amber/70 bg-ink/70 px-2 py-1 text-[11px] font-semibold text-brand-amber">
              <Camera className="h-3.5 w-3.5" aria-hidden />
              {t("demo.photoSwap", { what })}
            </span>
          )}
        </div>
      )}
      {fade !== "none" && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: fades[fade] }} />}
      {children}
    </div>
  );
}
