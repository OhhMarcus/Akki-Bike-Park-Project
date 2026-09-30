import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, body, align = "left", className, as: Tag = "h2" }: { eyebrow?: string; title: string; body?: string; align?: "left" | "center"; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className="h-section">{title}</Tag>
      {body && <p className="text-base leading-relaxed text-silver md:text-lg">{body}</p>}
    </div>
  );
}
