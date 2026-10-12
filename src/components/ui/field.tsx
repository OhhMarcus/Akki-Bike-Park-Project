"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn("field", className)} {...p} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn("field min-h-28 py-2.5 leading-relaxed", className)} {...p} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn("field appearance-none pr-9", className)} {...p}>
      {children}
    </select>
    <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted">
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  </div>
));
Select.displayName = "Select";

/** Label + control + hint/error. Pass translated strings. */
export function Field({
  label, htmlFor, error, hint, optional, children, className,
}: {
  label: string; htmlFor: string; error?: string; hint?: string; optional?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-sm font-medium text-fg">
        {label}
        {optional && <span className="text-xs font-normal text-muted">({optional})</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-state-closed">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Field a11y props for an input inside <Field>. */
export function describedBy(id: string, error?: string, hint?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

/** +852 phone input: shows the prefix, accepts 8 digits. */
export const PhoneInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <div className="relative">
    <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted">
      +852
    </span>
    <input ref={ref} type="tel" inputMode="tel" autoComplete="tel-national" className={cn("field pl-14 tabular", className)} {...p} />
  </div>
));
PhoneInput.displayName = "PhoneInput";

export function Checkbox({
  id, checked, onChange, children, error, className,
}: {
  id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; error?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="group flex cursor-pointer items-start gap-3 text-sm text-fg/90">
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-line-strong bg-[#0E0D0D] checked:border-transparent checked:bg-grad"
          />
          <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-ink opacity-0 peer-checked:opacity-100">
            <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
          </svg>
        </span>
        <span className="leading-snug">{children}</span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="ml-8 mt-1 text-xs font-medium text-state-closed">
          {error}
        </p>
      )}
    </div>
  );
}

/** Pick-one cards (radio group). */
export function OptionCards<T extends string>({
  name, value, onChange, options, columns = 2, className, legend,
}: {
  name: string;
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; title: React.ReactNode; detail?: React.ReactNode; disabled?: boolean }[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  legend?: string;
}) {
  const cols = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[columns];
  return (
    <fieldset className={className}>
      {legend && <legend className="mb-2 text-sm font-medium">{legend}</legend>}
      <div className={cn("grid gap-2", cols)}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "relative flex cursor-pointer flex-col gap-0.5 rounded-lg border bg-card px-4 py-3 transition-colors",
                active ? "border-transparent [background:linear-gradient(#1b1a1a,#1b1a1a)_padding-box,var(--grad)_border-box]" : "border-line hover:border-line-strong",
                o.disabled && "cursor-not-allowed opacity-40",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={active}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className="font-semibold">{o.title}</span>
              {o.detail && <span className="text-sm text-muted">{o.detail}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
