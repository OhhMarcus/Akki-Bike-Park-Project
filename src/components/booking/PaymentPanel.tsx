"use client";

import type { ReactElement } from "react";
import { CreditCard, Lock, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { useI18n } from "@/i18n/provider";
import { paymentMethods } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { PaymentMethodId } from "@/types";

export type PayState = "idle" | "processing" | "failed";

const icons: Record<PaymentMethodId, typeof CreditCard> = { card: CreditCard, fps: QrCode, alipayhk: Smartphone, wechat: Smartphone };

/** Decorative placeholder QR: NOT a real payment code. */
function FakeQr() {
  const size = 21;
  const cells: ReactElement[] = [];
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let on: boolean;
      if (finder(x, y)) {
        const fx = x >= size - 7 ? x - (size - 7) : x;
        const fy = y >= size - 7 ? y - (size - 7) : y;
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
      } else {
        on = ((x * 7 + y * 13 + x * y * 3) % 5) < 2;
      }
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  }
  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className="h-40 w-40 rounded bg-white p-1 text-ink" role="img" aria-label="Demo QR placeholder" fill="currentColor" shapeRendering="crispEdges">
      {cells}
    </svg>
  );
}

export function PaymentPanel({ method, onMethod, totalLabel, simulateFail, onSimulate, state, onRetry, onChooseOther }: {
  method: PaymentMethodId;
  onMethod: (m: PaymentMethodId) => void;
  totalLabel: string;
  simulateFail: boolean;
  onSimulate: (v: boolean) => void;
  state: PayState;
  onRetry: () => void;
  onChooseOther: () => void;
}) {
  const { t, l } = useI18n();
  return (
    <div className="space-y-5">
      <div role="alert" className="rounded-lg border border-signal/60 bg-signal/10 p-4 text-center">
        <p className="font-display text-2xl font-extrabold uppercase text-signal">{t("booking.payDemoBanner")}</p>
        <p className="mt-1 text-sm text-signal/90">{t("booking.payDemoBody")}</p>
      </div>

      {state === "failed" && (
        <div role="alert" className="space-y-3 rounded-lg border border-danger/50 bg-danger/5 p-5">
          <p className="font-display text-xl font-bold uppercase text-danger">{t("booking.payFailedTitle")}</p>
          <p className="text-sm text-silver">{t("booking.payFailedBody")}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onRetry}>{t("btn.retry")}</Button>
            <Button variant="secondary" onClick={onChooseOther}>{t("booking.chooseOther")}</Button>
            <WhatsAppButton text={t("booking.payHelpWa")} label={t("booking.payHelp")} />
          </div>
        </div>
      )}

      <div role="radiogroup" aria-label={t("booking.payMethod")} className="grid gap-2 sm:grid-cols-2">
        {paymentMethods.map((m) => {
          const Icon = icons[m.id];
          const selected = method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={state === "processing"}
              onClick={() => onMethod(m.id)}
              className={cn("flex min-h-14 items-center gap-3 rounded-lg border p-3 text-left disabled:opacity-50", selected ? "border-bone bg-graphite-800" : "border-graphite-700 bg-graphite-900 hover:bg-graphite-800")}
            >
              <Icon className="h-5 w-5 shrink-0 text-silver" aria-hidden />
              <span>
                <span className="block text-sm font-semibold">{l(m.label)}</span>
                <span className="block text-xs text-silver-dim">{l(m.hint)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="surface space-y-4 p-5">
        {method === "card" && (
          <>
            <p className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4" aria-hidden />{t("booking.card.title")}</p>
            <div aria-hidden className="space-y-2 rounded-md border border-dashed border-graphite-600 p-4">
              <div className="h-10 rounded bg-graphite-800" />
              <div className="grid grid-cols-2 gap-2"><div className="h-10 rounded bg-graphite-800" /><div className="h-10 rounded bg-graphite-800" /></div>
            </div>
            <p className="text-sm text-silver">{t("booking.card.body")}</p>
            <p className="flex items-start gap-2 text-xs text-silver-dim"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{t("booking.card.note")}</p>
          </>
        )}
        {method === "fps" && (
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <FakeQr />
            <div className="space-y-2 text-sm text-silver">
              <p className="font-semibold text-bone">{t("booking.fps.title")}</p>
              <p>{t("booking.fps.body")}</p>
              <p className="text-xs text-signal">{t("booking.fps.note")}</p>
            </div>
          </div>
        )}
        {(method === "alipayhk" || method === "wechat") && (
          <div className="space-y-2 text-sm text-silver">
            <p className="font-semibold text-bone">{t(method === "alipayhk" ? "booking.alipay.title" : "booking.wechat.title")}</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>{t("booking.wallet.s1")}</li>
              <li>{t("booking.wallet.s2")}</li>
              <li>{t("booking.wallet.s3")}</li>
            </ol>
            <p className="text-xs text-signal">{t("booking.wallet.note")}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-graphite-700 p-4">
        <Checkbox id="simulate-fail" checked={simulateFail} onChange={onSimulate}>
          <span className="font-medium">{t("booking.simulateFail")}</span>
          <span className="block text-xs text-silver-dim">{t("booking.simulateFailHint")}</span>
        </Checkbox>
      </div>
      <p className="text-center text-sm text-silver" aria-live="polite">{state === "processing" ? t("booking.processing") : t("booking.payTotal", { total: totalLabel })}</p>
    </div>
  );
}
