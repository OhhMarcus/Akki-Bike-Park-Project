import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { clientKey, rateLimit } from "./ratelimit";
import { fieldErrors } from "./validation";
import { getSupabaseAdmin } from "./supabase";

/**
 * Shared route-handler pattern: size limit -> rate limit -> JSON parse ->
 * zod validation (+sanitisation) -> optional Supabase persistence.
 * Without Supabase env vars the route validates and acknowledges; the browser
 * then stores the record locally (see src/lib/store.ts).
 */
export async function handleSubmission<T>(
  req: Request,
  opts: { scope: string; schema: ZodType<T>; limit?: number; table?: string; toRow?: (data: T) => Record<string, unknown>; extra?: (data: T) => Record<string, unknown> | Promise<Record<string, unknown>> },
) {
  const rl = rateLimit(clientKey(req, opts.scope), opts.limit ?? 8);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 100_000) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const parsed = opts.schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation", fields: fieldErrors(parsed.error) }, { status: 422 });

  // Honeypot: silently accept bots without storing.
  if (body && typeof body === "object" && "website" in body && (body as { website?: string }).website) return NextResponse.json({ ok: true });

  let persisted: "supabase" | "local" = "local";
  const sb = getSupabaseAdmin();
  if (sb && opts.table && opts.toRow) {
    const { error } = await sb.from(opts.table).insert(opts.toRow(parsed.data));
    if (error) return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
    persisted = "supabase";
  }
  const extra = opts.extra ? await opts.extra(parsed.data) : {};
  return NextResponse.json({ ok: true, persisted, ...extra });
}
