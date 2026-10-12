import { cn } from "@/lib/utils";
import { Headline } from "./Headline";
import { PatternBand } from "./Pattern";

/** Inner-page header: black band, triangle pattern, leaning headline. */
export function PageHero({
  eyebrow, title, lead, actions, aside, className,
}: {
  eyebrow?: string; title: string; lead?: string; actions?: React.ReactNode; aside?: React.ReactNode; className?: string;
}) {
  return (
    <PatternBand className={cn("border-b border-line", className)}>
      <div className={cn("container grid gap-8 py-12 sm:py-16 lg:py-20", aside && "lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end")}>
        <div className="max-w-2xl space-y-4">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <Headline text={title} as="h1" className="h1" brush />
          {lead && <p className="max-w-xl text-base leading-relaxed text-fg/80 sm:text-lg">{lead}</p>}
          {actions && <div className="flex flex-wrap gap-3 pt-2">{actions}</div>}
        </div>
        {aside}
      </div>
    </PatternBand>
  );
}
