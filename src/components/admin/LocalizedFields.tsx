import type { LocalizedText } from "@/types";
import { Field, Input, Textarea } from "@/components/ui/input";

/** Paired EN + 繁中 inputs for one bilingual value. Errors are already-translated text. */
export function LocalizedFields({ id, label, value, onChange, multiline, errors, hint }: { id: string; label: string; value: LocalizedText; onChange: (v: LocalizedText) => void; multiline?: boolean; errors?: { en?: string; zh?: string }; hint?: string }) {
  const Control = multiline ? Textarea : Input;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={`${label} (EN)`} htmlFor={`${id}-en`} error={errors?.en} hint={hint}>
        <Control id={`${id}-en`} lang="en" value={value.en} aria-invalid={!!errors?.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={multiline ? "min-h-20" : undefined} />
      </Field>
      <Field label={`${label} (繁中)`} htmlFor={`${id}-zh`} error={errors?.zh} hint={hint}>
        <Control id={`${id}-zh`} lang="zh-Hant" value={value.zh} aria-invalid={!!errors?.zh} onChange={(e) => onChange({ ...value, zh: e.target.value })} className={multiline ? "min-h-20" : undefined} />
      </Field>
    </div>
  );
}
