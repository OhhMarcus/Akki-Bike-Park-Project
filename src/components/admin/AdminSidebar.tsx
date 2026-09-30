"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, CalendarCheck, CalendarDays, ExternalLink, Gauge, Inbox, LayoutDashboard, LogOut, PenLine, RotateCcw, Target, Ticket, Users } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items: { href: string; key: MessageKey; icon: typeof Gauge }[] = [
  { href: "/admin", key: "admin.nav.overview", icon: LayoutDashboard },
  { href: "/admin/bookings", key: "admin.nav.bookings", icon: CalendarCheck },
  { href: "/admin/customers", key: "admin.nav.customers", icon: Users },
  { href: "/admin/events", key: "admin.nav.events", icon: CalendarDays },
  { href: "/admin/coaching", key: "admin.nav.coaching", icon: Target },
  { href: "/admin/capacity", key: "admin.nav.capacity", icon: Gauge },
  { href: "/admin/content", key: "admin.nav.content", icon: PenLine },
  { href: "/admin/enquiries", key: "admin.nav.enquiries", icon: Inbox },
  { href: "/admin/promotions", key: "admin.nav.promotions", icon: Ticket },
  { href: "/admin/memberships", key: "admin.nav.memberships", icon: Award },
];

export function AdminSidebar({ email, onNavigate, onReset, onLogout }: { email: string; onNavigate?: () => void; onReset: () => void; onLogout: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-graphite-700 px-4 py-4">
        <p className="font-display text-xl font-bold uppercase leading-none">AKKI</p>
        <p className="mt-1 text-xs text-silver-dim">{t("admin.title")}</p>
      </div>
      <nav aria-label={t("admin.nav.label")} className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {items.map((i) => {
            const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
            const Icon = i.icon;
            return (
              <li key={i.href}>
                <Link href={i.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-graphite-800 text-bone" : "text-silver hover:bg-graphite-800/60 hover:text-bone")}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {t(i.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="space-y-1 border-t border-graphite-700 p-3">
        <p className="truncate px-1 pb-1 text-xs text-silver-dim">{t("admin.shell.signedInAs", { email })}</p>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}>
          <ExternalLink className="h-4 w-4" aria-hidden />
          {t("admin.shell.viewSite")}
        </Link>
        <Button variant="ghost" className="w-full justify-start" onClick={onReset}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          {t("demo.resetData")}
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
          <LogOut className="h-4 w-4" aria-hidden />
          {t("admin.shell.logout")}
        </Button>
      </div>
    </div>
  );
}
