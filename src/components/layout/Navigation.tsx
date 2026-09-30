"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/i18n/dictionary";

export const navLinks: { href: string; key: MessageKey }[] = [
  { href: "/park", key: "nav.park" },
  { href: "/events", key: "nav.events" },
  { href: "/coaching", key: "nav.coaching" },
  { href: "/groups", key: "nav.groups" },
  { href: "/visit", key: "nav.visit" },
  { href: "/contact", key: "nav.contact" },
];

export function Logo({ className }: { className?: string }) {
  const { l } = useI18n();
  return (
    <Link href="/" className={cn("flex items-baseline gap-2", className)} aria-label={`${l({ en: "AKKI Bike Park", zh: "丫髻山地單車樂園" })} — ${l({ en: "Home", zh: "首頁" })}`}>
      <span className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight">AKKI</span>
      <span className="hidden text-[11px] font-medium leading-none text-silver-dim sm:inline">{l({ en: "Bike Park", zh: "丫髻山地單車樂園" })}</span>
    </Link>
  );
}

export function Navigation() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-graphite-800 bg-ink/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
              className={cn("rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-bone", active(n.href) ? "text-bone" : "text-silver")}>
              {t(n.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/booking" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>{t("cta.bookNow")}</Link>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger aria-label={t("nav.menu")} className="rounded-md p-2.5 text-bone hover:bg-graphite-800 lg:hidden">
              <Menu className="h-5 w-5" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70" />
              <Dialog.Content className="fixed inset-y-0 right-0 z-[70] flex w-[86%] max-w-sm flex-col bg-graphite-950 p-6 shadow-2xl">
                <Dialog.Title className="sr-only">{t("nav.menu")}</Dialog.Title>
                <Dialog.Description className="sr-only">{t("nav.menu")}</Dialog.Description>
                <div className="flex items-center justify-between">
                  <Logo />
                  <Dialog.Close aria-label={t("nav.close")} className="rounded-md p-2 text-silver hover:bg-graphite-800"><X className="h-5 w-5" /></Dialog.Close>
                </div>
                <nav aria-label="Mobile" className="mt-8 flex flex-1 flex-col gap-1">
                  {[{ href: "/", key: "nav.home" as MessageKey }, ...navLinks, { href: "/my-bookings", key: "nav.myBookings" as MessageKey }].map((n) => (
                    <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={active(n.href) ? "page" : undefined}
                      className={cn("rounded-md px-3 py-3 font-display text-2xl font-bold uppercase", active(n.href) ? "text-bone" : "text-silver")}>
                      {t(n.key)}
                    </Link>
                  ))}
                </nav>
                <Link href="/booking" onClick={() => setOpen(false)} className={cn(buttonVariants({ size: "lg" }), "w-full")}>{t("cta.bookNow")}</Link>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
