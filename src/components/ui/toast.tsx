"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";
type ToastItem = { id: number; tone: Tone; text: string };
const Ctx = createContext<(text: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const { t } = useI18n();
  const push = useCallback((text: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, tone, text }]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 5000);
  }, []);
  const Icon = { success: CheckCircle2, error: TriangleAlert, info: Info };
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6">
        <AnimatePresence>
          {items.map((i) => {
            const I = Icon[i.tone];
            return (
              <motion.div key={i.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                role={i.tone === "error" ? "alert" : "status"}
                className={cn("pointer-events-auto flex max-w-sm items-start gap-3 rounded-md border bg-graphite-800 px-4 py-3 text-sm shadow-xl", i.tone === "error" ? "border-danger/50" : "border-graphite-600")}>
                <I className={cn("mt-0.5 h-4 w-4 shrink-0", i.tone === "error" ? "text-danger" : i.tone === "success" ? "text-trail-green" : "text-silver")} />
                <span className="flex-1">{i.text}</span>
                <button aria-label={t("toast.dismiss")} onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))} className="text-silver-dim hover:text-bone">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
