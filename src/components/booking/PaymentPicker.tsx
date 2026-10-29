"use client";

import { useMemo, useState } from "react";
import { Loader2, Lock, QrCode, Smartphone } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { rng } from "@/lib/prng";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PayMethod = "fps" | "payme";

/** Non-scannable sample QR (looks right, pays nothing). */
function FakeQR({ seed, label }: { seed: string; label: string }) {
  const cells = useMemo(() => {
    const r = rng(seed);
    const n = 25;
    const out: [number, number][] = [];
    const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && r() < 0.48) out.push([x, y]);
    return out;
  }, [seed]);
  const F = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="#080808" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#F2EFEA" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#080808" />
    </g>
  );
  return (
    <svg viewBox="-2 -2 29 29" role="img" aria-label={label} className="h-40 w-40 rounded-md bg-fg">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#080808" />
      ))}
      <F x={0} y={0} />
      <F x={18} y={0} />
      <F x={0} y={18} />
    </svg>
  );
}

/**
 * Mock checkout: FPS or PayMe. Nothing is charged. Production: create the
 * payment server-side and show the provider's QR (PayMe for Business, FPS via
 * the bank), then confirm by webhook.
 */
export function PaymentPicker({
  amount, onPay, payLabel, seed = "akki", disabled,
}: {
  amount: number;
  /** called after a short "processing" moment */
  onPay: (method: PayMethod) => void;
  payLabel?: string;
  seed?: string;
  disabled?: boolean;
}) {
  const { t, fmt } = useI18n();
  const [method, setMethod] = useState<PayMethod>("fps");
  const [busy, setBusy] = useState(false);
  const methods: { id: PayMethod; label: string; hint: string; Icon: typeof QrCode }[] = [
    { id: "fps", label: t("book.pay.fps"), hint: t("book.pay.fpsHint"), Icon: QrCode },
    { id: "payme", label: t("book.pay.payme"), hint: t("book.pay.paymeHint"), Icon: Smartphone },
  ];

  const pay = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onPay(method);
    }, 900);
  };

  const free = amount === 0;

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 rounded-md border border-dashed border-brand-amber/60 bg-brand-amber/10 px-3 py-2 text-xs font-semibold text-brand-amber">
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {t("book.pay.demo")}
      </p>

      {!free && (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t("book.pay.method")}</legend>
            <div className="grid grid-cols-2 gap-2">
              {methods.map(({ id, label, Icon }) => {
                const active = method === id;
                return (
                  <label
                    key={id}
                    className={cn(
                      "flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border bg-card px-2 text-center text-sm font-semibold transition-colors [&:has(:focus-visible)]:shadow-[0_0_0_2px_#080808,0_0_0_4px_#EBB04A,-5px_0_10px_-1px_rgba(168,95,168,.9),5px_0_10px_-1px_rgba(111,177,198,.9)]",
                      active ? "border-transparent [background:linear-gradient(#1b1a1a,#1b1a1a)_padding-box,var(--grad)_border-box]" : "border-line hover:border-line-strong",
                    )}
                  >
                    <input type="radio" name="pay-method" value={id} checked={active} onChange={() => setMethod(id)} className="sr-only" />
                    <Icon className="h-5 w-5" aria-hidden />
                    {label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="surface flex min-h-[200px] flex-col items-center justify-center gap-3 p-4 text-center">
            <FakeQR seed={`${seed}-${method}-${amount}`} label={t("book.pay.qrAlt")} />
            <p className="text-xs text-muted">{methods.find((m) => m.id === method)!.hint}</p>
            <p className="text-xs text-muted">{t("book.pay.payee")}</p>
          </div>
        </>
      )}

      <Button size="lg" className="w-full" onClick={pay} disabled={busy || disabled} aria-busy={busy}>
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            {t("book.pay.processing")}
          </>
        ) : free ? (
          t("book.pay.confirmFree")
        ) : (
          payLabel ?? t("book.pay.payNow", { amount: fmt.money(amount) })
        )}
      </Button>
    </div>
  );
}
