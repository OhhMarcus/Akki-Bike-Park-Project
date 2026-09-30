import { cn } from "@/lib/utils";

export function Badge({ className, tone = "neutral", ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "green" | "blue" | "amber" | "red" | "silver" }) {
  const tones = {
    neutral: "border-graphite-600 text-silver",
    silver: "border-silver/40 bg-silver/10 text-silver",
    green: "border-trail-green/40 bg-trail-green/10 text-trail-green",
    blue: "border-trail-blue/40 bg-trail-blue/10 text-trail-blue",
    amber: "border-signal/40 bg-signal/10 text-signal",
    red: "border-danger/40 bg-danger/10 text-danger",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)} {...p} />;
}
