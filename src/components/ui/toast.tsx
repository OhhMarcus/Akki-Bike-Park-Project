"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";
type Item = { id: number; tone: Tone; text: string };
const Ctx = createContext<(text: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const { t } = useI18n();
  const push = useCallback((text: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p.slice(-2), { id, tone, text }]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 4500);
  }, []);
  const Icon = { success: Check, error: AlertTriangle, info: Info };
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
        {items.map((i) => {
          const I = Icon[i.tone];
          return (
            <div
              key={i.id}
              role={i.tone === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-lg border bg-card-2 px-4 py-3 text-sm shadow-lift",
                i.tone === "error" ? "border-state-closed/60" : "border-line-strong",
              )}
            >
              <I className={cn("mt-0.5 h-4 w-4 shrink-0", i.tone === "error" ? "text-state-closed" : i.tone === "success" ? "text-brand-sky" : "text-brand-amber")} aria-hidden />
              <span className="flex-1">{i.text}</span>
              <button aria-label={t("btn.close")} onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))} className="text-muted hover:text-fg">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
