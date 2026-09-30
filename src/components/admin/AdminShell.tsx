"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { resetAllDemoData, useAdminSession, useHydrated } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { AdminLogin } from "./AdminLogin";
import { AdminSidebar } from "./AdminSidebar";
import { ConfirmDialog } from "./ConfirmDialog";

function ShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-ink" aria-busy="true">
      <Skeleton className="hidden h-screen w-60 rounded-none lg:block" />
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

/** Client wrapper: login gate + sidebar frame. Children only render after hydration + sign-in. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const [session, setSession] = useAdminSession();
  const { t } = useI18n();
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!hydrated) return <ShellSkeleton />;
  if (!session) return <AdminLogin />;

  const logout = () => setSession(null);
  const sidebar = (onNavigate?: () => void) => (
    <AdminSidebar email={session.email} onNavigate={onNavigate} onReset={() => { setMenu(false); setResetOpen(true); }} onLogout={logout} />
  );

  return (
    <div className="min-h-screen bg-ink">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">
        {t("nav.skip")}
      </a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-graphite-700 bg-graphite-950 lg:block">{sidebar()}</aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-graphite-700 bg-ink/95 px-4 py-2 backdrop-blur">
          <Dialog.Root open={menu} onOpenChange={setMenu}>
            <Dialog.Trigger asChild>
              <Button variant="secondary" size="icon" className="lg:hidden" aria-label={t("nav.menu")}>
                <Menu className="h-5 w-5" />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 lg:hidden" />
              <Dialog.Content className="fixed inset-y-0 left-0 z-[65] w-72 max-w-[85vw] border-r border-graphite-700 bg-graphite-950 lg:hidden">
                <Dialog.Title className="sr-only">{t("admin.nav.label")}</Dialog.Title>
                <Dialog.Description className="sr-only">{t("admin.title")}</Dialog.Description>
                {sidebar(() => setMenu(false))}
                <Dialog.Close aria-label={t("nav.close")} className="absolute right-2 top-3 rounded-md p-2 text-silver hover:bg-graphite-800 hover:text-bone">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <p role="status" className="flex-1 truncate rounded border border-signal/40 bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal">
            {t("admin.shell.demoData")}
          </p>
          <LanguageSwitcher />
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={logout}>
            {t("admin.shell.logout")}
          </Button>
        </header>
        <main id="admin-main" className="px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={t("admin.shell.resetTitle")}
        body={t("admin.shell.resetBody")}
        confirmLabel={t("demo.resetData")}
        onConfirm={() => {
          const keep = session;
          resetAllDemoData();
          setSession(keep);
          toast(t("admin.shell.resetDone"), "success");
        }}
      />
    </div>
  );
}
