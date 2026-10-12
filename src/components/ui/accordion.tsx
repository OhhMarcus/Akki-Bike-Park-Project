"use client";

import * as A from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

export function FAQ({ items, className }: { items: { q: string; a: React.ReactNode }[]; className?: string }) {
  return (
    <A.Root type="single" collapsible className={className}>
      {items.map((it, i) => (
        <A.Item key={i} value={`q${i}`} className="border-b border-line">
          <A.Header>
            <A.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-semibold hover:text-fg/90">
              {it.q}
              <Plus className="h-4 w-4 shrink-0 text-muted transition-transform group-data-[state=open]:rotate-45" aria-hidden />
            </A.Trigger>
          </A.Header>
          <A.Content className="overflow-hidden pb-5 text-[15px] leading-relaxed text-muted">{it.a}</A.Content>
        </A.Item>
      ))}
    </A.Root>
  );
}
