import { cn } from "@/lib/utils";

/** Thin strip of the triangle pattern used as a section divider. */
export function PatternDivider({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pattern-bg h-7 border-y border-ink opacity-80", className)} style={{ backgroundSize: "110px auto" }} />;
}

/** Full-width band with the pattern behind, darkened so text stays readable. */
export function PatternBand({ children, className, shade = "left" }: { children: React.ReactNode; className?: string; shade?: "left" | "center" | "none" }) {
  return (
    <section className={cn("pattern-bg relative isolate overflow-hidden", className)}>
      {shade !== "none" && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              shade === "left"
                ? "linear-gradient(90deg, rgba(8,8,8,.92) 0%, rgba(8,8,8,.72) 45%, rgba(8,8,8,.35) 100%)"
                : "radial-gradient(ellipse at center, rgba(8,8,8,.78) 0%, rgba(8,8,8,.45) 70%, rgba(8,8,8,.25) 100%)",
          }}
        />
      )}
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-ink to-transparent" />
      {children}
    </section>
  );
}
