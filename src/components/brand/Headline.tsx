import { cn } from "@/lib/utils";
import { BrushUnderline } from "./Brush";

/**
 * Headline with ONE highlighted word: wrap it in *asterisks* in the
 * translation, e.g. "Book the *pump track*" / "預約 *Pump Track*".
 */
export function Headline({
  text, as: Tag = "h2", className, brush, align = "left",
}: {
  text: string; as?: "h1" | "h2" | "h3" | "p"; className?: string; brush?: boolean; align?: "left" | "center";
}) {
  const m = /^(.*?)\*(.+?)\*(.*)$/s.exec(text);
  return (
    <div className={cn(align === "center" && "flex flex-col items-center text-center")}>
      <Tag className={cn(!/(^|\s)h[13](\s|$)/.test(className ?? "") && "h2", className)}>
        {m ? (
          <>
            {m[1]}
            <span className="grad-text">{m[2]}</span>
            {m[3]}
          </>
        ) : (
          text
        )}
      </Tag>
      {brush && <BrushUnderline className={cn("mt-3", align === "center" && "mx-auto")} />}
    </div>
  );
}

/** Eyebrow + headline + lead, the standard section opener. */
export function SectionTitle({
  eyebrow, title, lead, as = "h2", brush = true, align = "left", className, action,
}: {
  eyebrow?: string; title: string; lead?: string; as?: "h1" | "h2" | "h3"; brush?: boolean; align?: "left" | "center"; className?: string; action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", align === "center" && "items-center text-center sm:flex-col sm:items-center", className)}>
      <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Headline text={title} as={as} brush={brush} align={align} />
        {lead && <p className="text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
      </div>
      {action}
    </div>
  );
}
