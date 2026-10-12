import Image from "next/image";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The AKKI wordmark, cut from the supplied artwork onto transparent.
 * Never recolour, stretch or place it on a light background.
 */
export function Logo({ variant = "nav", className, priority }: { variant?: "nav" | "hero"; className?: string; priority?: boolean }) {
  const alt = `${site.name.en} ${site.name.zh}`;
  if (variant === "nav") {
    return <Image src="/brand/akki-logo-nav.png" alt={alt} width={153} height={72} priority={priority} className={cn("h-9 w-auto", className)} />;
  }
  return (
    <Image
      src="/brand/akki-logo.png"
      alt={alt}
      width={1317}
      height={616}
      priority={priority}
      sizes="(max-width: 640px) 90vw, 640px"
      className={cn("h-auto w-full", className)}
    />
  );
}
