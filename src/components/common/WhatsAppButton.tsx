"use client";

import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WhatsAppButton({ text, label, variant = "secondary", className, size }: { text?: string; label?: string; variant?: "primary" | "secondary" | "silver" | "ghost"; className?: string; size?: "default" | "sm" | "lg" }) {
  const { t } = useI18n();
  return (
    <a href={whatsappUrl(text ?? t("wa.hello"))} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant, size }), className)}>
      <MessageCircle className="h-4 w-4" aria-hidden />
      {label ?? t("btn.whatsapp")}
    </a>
  );
}
