"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { BarChart3, CalendarClock, CalendarPlus, CloudLightning, ExternalLink, LayoutList, Menu, RotateCcw, Sun, Trophy, Users, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { resetDemoData } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

export const adminNav: { href: string; key: MessageKey; icon: typeof Sun }[] = [
  { href: "/admin", key: "admin.nav.today", icon: Sun },
  { href: "/admin/bookings", key: "admin.nav.bookings", icon: LayoutList },
  { href: "/admin/bookings/new", key: "admin.nav.add", icon: CalendarPlus },
  { href: "/admin/schedule", key: "admin.nav.schedule", icon: CalendarClock },
  { href: "/admin/weather", key: "admin.nav.weather", icon: CloudLightning },
  { href: "/admin/events", key: "admin.nav.events", icon: Trophy },
  { href: "/admin/riders", key: "admin.nav.riders", icon: Users },
  { href: "/admin/stats", key: "admin.nav.stats", icon: BarChart3 },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : href === "/admin/bookings" ? pathname === "/admin/bookings" : pathname.startsWith(href);
  return (
    <ul className="space-y-0.5">
      {adminNav.map((n) => {
        const active = isActive(n.href);
        const Icon = n.icon;
        return (
          <li key={n.href}>
            <Link
              href={n.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                active ? "bg-card-2 text-fg" : "text-muted hover:bg-white/[.04] hover:text-fg",
              )}
            >
              {active && <span aria-hidden className="absolute left-0 top-2 h-6 w-0.5 rounded bg-grad-v" />}
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {t(n.key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const footer = (
    <div className="space-y-1 border-t border-line p-3 text-sm">
      <p className="px-3 pb-1 text-xs text-muted">{t("admin.signedIn")}</p>
      <Link href="/" className="flex min-h-10 items-center gap-3 rounded-md px-3 text-muted hover:bg-white/[.04] hover:text-fg">
        <ExternalLink className="h-4 w-4" aria-hidden />
        {t("admin.viewSite")}
      </Link>
      <button type="button" onClick={() => setConfirm(true)} className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-muted hover:bg-white/[.04] hover:text-fg">
        <RotateCcw className="h-4 w-4" aria-hidden />
        {t("admin.reset")}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-[#0C0B0B] lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-line px-4">
          <Logo variant="nav" className="h-7" />
          <span className="text-xs font-semibold text-muted">{t("admin.title")}</span>
        </div>
        <nav aria-label={t("admin.nav.label")} className="flex-1 overflow-y-auto p-3">
          <NavList />
        </nav>
        {footer}
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-ink/90 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Dialog.Root open={menu} onOpenChange={setMenu}>
              <Dialog.Trigger className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/5 lg:hidden" aria-label={t("nav.menu")}>
                <Menu className="h-5 w-5" />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-[70] flex w-[82%] max-w-xs flex-col border-r border-line bg-[#0C0B0B] outline-none">
                  <Dialog.Title className="sr-only">{t("admin.nav.label")}</Dialog.Title>
                  <Dialog.Description className="sr-only">{t("admin.title")}</Dialog.Description>
                  <div className="flex h-16 items-center justify-between border-b border-line px-4">
                    <Logo variant="nav" className="h-7" />
                    <Dialog.Close className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/5" aria-label={t("nav.close")}>
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                  <nav aria-label={t("admin.nav.label")} className="flex-1 overflow-y-auto p-3">
                    <NavList onNavigate={() => setMenu(false)} />
                  </nav>
                  {footer}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <span className="inline-flex min-w-0 items-center gap-2 truncate rounded-md border border-brand-amber/40 bg-brand-amber/10 px-2.5 py-1 text-xs font-semibold text-brand-amber" title={t("admin.noLogin")}>
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 animate-pulse2 rounded-full bg-brand-amber" />
              <span className="truncate">{t("admin.demoMode")}</span>
            </span>
          </div>
          <LanguageToggle />
        </header>
        <main id="main" className="px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={t("admin.reset")}
        body={t("admin.resetConfirm")}
        confirmLabel={t("btn.reset")}
        danger
        onConfirm={() => {
          resetDemoData();
          toast(t("admin.resetDone"));
        }}
      />
    </div>
  );
}

/** Page title row for admin screens. */
export function AdminPageHeader({ title, lead, actions }: { title: string; lead?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="h-display text-3xl sm:text-4xl">{title}</h1>
        {lead && <p className="mt-1 text-sm text-muted">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
