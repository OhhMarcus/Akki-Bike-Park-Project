/**
 * Minimal in-memory sliding-window limiter. Fine for a single Vercel instance
 * demo; swap for Upstash/Redis (`@upstash/ratelimit`) in production because
 * serverless instances do not share memory.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - arr[0])) / 1000) };
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return { ok: true, retryAfter: 0 };
}

export function clientKey(req: Request, scope: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}
