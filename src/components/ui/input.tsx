import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-md border border-graphite-600 bg-graphite-950 px-3 min-h-11 text-sm text-bone placeholder:text-silver-dim/70 focus-visible:border-silver focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver/40 aria-[invalid=true]:border-danger disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(base, className)} {...p} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(base, "min-h-28 py-2", className)} {...p} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <select ref={ref} className={cn(base, "pr-8", className)} {...p}>
    {children}
  </select>
));
Select.displayName = "Select";

/** Label + control + error wrapper. Pass `error` as already-translated text. */
export function Field({ label, htmlFor, error, hint, children, className }: { label: string; htmlFor: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-bone">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-silver-dim">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({ id, checked, onChange, children, error, className }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; error?: string; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-bone/90">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#b8bcc4]"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p role="alert" className="ml-8 mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
