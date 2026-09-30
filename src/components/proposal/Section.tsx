
export function Section({ id, eyebrow, title, body, children }: { id: string; eyebrow: string; title: string; body?: string; children?: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 border-t border-graphite-700 py-12 md:py-16 print:break-inside-avoid-page">
      <div className="max-w-2xl space-y-3">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className="h-section">{title}</h2>
        {body && <p className="text-base leading-relaxed text-silver md:text-lg">{body}</p>}
      </div>
      {children && <div className="mt-8 md:mt-10">{children}</div>}
    </section>
  );
}

