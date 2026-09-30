"use client";

import * as A from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <A.Root type="single" collapsible className="divide-y divide-graphite-700 rounded-lg border border-graphite-700 bg-graphite-900">
      {items.map((it, i) => (
        <A.Item key={i} value={`i${i}`}>
          <A.Header>
            <A.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold hover:bg-graphite-800 md:text-base">
              {it.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-silver transition-transform group-data-[state=open]:rotate-180" />
            </A.Trigger>
          </A.Header>
          <A.Content className="overflow-hidden px-5 pb-5 text-sm leading-relaxed text-silver">{it.a}</A.Content>
        </A.Item>
      ))}
    </A.Root>
  );
}
