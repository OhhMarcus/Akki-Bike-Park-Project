"use client";

import { useEffect } from "react";
import { I18nProvider } from "@/i18n/provider";
import { ToastProvider } from "@/components/ui/toast";
import { refreshSampleData } from "@/lib/store";
import type { Locale } from "@/types";

function SampleDataRefresher() {
  useEffect(() => {
    refreshSampleData();
  }, []);
  return null;
}

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <I18nProvider initialLocale={locale}>
      <ToastProvider>
        <SampleDataRefresher />
        {children}
      </ToastProvider>
    </I18nProvider>
  );
}
