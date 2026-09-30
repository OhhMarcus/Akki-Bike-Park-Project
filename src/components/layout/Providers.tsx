"use client";

import { I18nProvider } from "@/i18n/provider";
import { ToastProvider } from "@/components/ui/toast";
import type { Locale } from "@/types";

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <I18nProvider initialLocale={locale}>
      <ToastProvider>{children}</ToastProvider>
    </I18nProvider>
  );
}
