"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Finger / mouse / pen signature. Emits a PNG data URL (or null when cleared).
 * Production: store the PNG with the waiver record and the signer's details.
 */
export function SignaturePad({ onChange, error, id = "signature" }: { onChange: (dataUrl: string | null) => void; error?: string; id?: string }) {
  const { t } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [signed, setSigned] = useState(false);
  /** read by the ResizeObserver; keeping `signed` out of the effect deps stops a re-setup wiping the first stroke */
  const signedRef = useRef(false);

  const setup = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#F2EFEA";
    ctx.lineWidth = 2.4;
  }, []);

  useEffect(() => {
    setup();
    const ro = new ResizeObserver(() => {
      if (!signedRef.current) setup();
    });
    if (canvas.current) ro.observe(canvas.current);
    return () => ro.disconnect();
  }, [setup]);

  const point = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };
  const moveTo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvas.current!.getContext("2d")!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    signedRef.current = true;
    setSigned(true);
    onChange(canvas.current!.toDataURL("image/png"));
  };
  const clear = () => {
    const c = canvas.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    signedRef.current = false;
    setSigned(false);
    onChange(null);
    setup();
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{t("book.sign.label")}</label>
        <button type="button" onClick={clear} className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-white/5 hover:text-fg">
          {t("book.sign.clear")}
        </button>
      </div>
      <div className={cn("relative overflow-hidden rounded-lg border bg-[#0E0D0D]", error ? "border-state-closed" : "border-line-strong")}>
        <canvas
          id={id}
          ref={canvas}
          role="img"
          aria-label={signed ? t("book.sign.signed") : t("book.sign.area")}
          aria-describedby={error ? `${id}-error` : undefined}
          tabIndex={0}
          className="block h-36 w-full touch-none"
          onPointerDown={down}
          onPointerMove={moveTo}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-dashed border-line-strong" />
        {!signed && <span aria-hidden className="pointer-events-none absolute bottom-3 left-6 text-xs text-muted">✕</span>}
        {signed && <span className="pointer-events-none absolute right-3 top-3 text-xs font-semibold text-brand-sky">{t("book.sign.signed")}</span>}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-state-closed">{error}</p>}
    </div>
  );
}
