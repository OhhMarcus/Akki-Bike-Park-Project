"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { Logo } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/button";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

export const siteNav: { href: string; key: MessageKey }[] = [
  { href: "/lessons", key: "nav.lessons" },
  { href: "/pump-track", key: "nav.pump" },
  { href: "/events", key: "nav.events" },
  { href: "/club", key: "nav.club" },
  { href: "/visit", key: "nav.visit" },
];

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0 rounded-md" aria-label={t("nav.home")}>
          <Logo variant="nav" priority />
        </Link>

        <nav aria-label={t("nav.primary")} className="hidden items-center gap-1 lg:flex">
          {siteNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3 py-2 text-[15px] font-semibold transition-colors hover:text-fg",
                active(n.href) ? "text-fg" : "text-muted",
              )}
            >
              {t(n.key)}
              {active(n.href) && <span aria-hidden className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-grad" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link href="/pump-track" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
            {t("cta.bookNow")}
          </Link>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="grid h-10 w-10 place-items-center rounded-lg text-fg hover:bg-white/5 lg:hidden" aria-label={t("nav.menu")}>
              <Menu className="h-5 w-5" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/80" />
              <Dialog.Content className="pattern-bg fixed inset-0 z-[70] flex flex-col outline-none">
                <div className="absolute inset-0 -z-10 bg-ink/85" aria-hidden />
                <Dialog.Title className="sr-only">{t("nav.menu")}</Dialog.Title>
                <Dialog.Description className="sr-only">{t("nav.primary")}</Dialog.Description>
                <div className="container flex h-16 items-center justify-between">
                  <Logo variant="nav" />
                  <Dialog.Close className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/5" aria-label={t("nav.close")}>
                    <X className="h-5 w-5" />
                  </Dialog.Close>
                </div>
                <nav aria-label={t("nav.primary")} className="container mt-6 flex flex-1 flex-col gap-1">
                  {[{ href: "/", key: "nav.home" as MessageKey }, ...siteNav].map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      aria-current={(n.href === "/" ? pathname === "/" : active(n.href)) ? "page" : undefined}
                      className="h-display py-2 text-5xl text-fg/90 aria-[current=page]:text-fg"
                    >
                      {t(n.key)}
                    </Link>
                  ))}
                </nav>
                <div className="container grid grid-cols-2 gap-2 pb-8" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
                  <Link href="/lessons" onClick={() => setOpen(false)} className={buttonVariants({ variant: "secondary", size: "lg" })}>
                    {t("sticky.lesson")}
                  </Link>
                  <Link href="/pump-track" onClick={() => setOpen(false)} className={buttonVariants({ size: "lg" })}>
                    {t("sticky.pump")}
                  </Link>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
