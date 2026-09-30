"use client";

import { ErrorState } from "@/components/common/States";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container py-20">
      <ErrorState onRetry={reset} />
    </div>
  );
}
