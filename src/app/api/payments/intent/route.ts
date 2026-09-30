import { NextResponse } from "next/server";
import { z } from "zod";
import { createDemoIntent } from "@/lib/payments";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const schema = z.object({ amount: z.number().nonnegative().max(1_000_000), method: z.enum(["card", "fps", "alipayhk", "wechat"]) });

/**
 * Payment-intent endpoint. DEMO: returns a fake intent.
 * To go live with Stripe: `new Stripe(process.env.STRIPE_SECRET_KEY)`, create a
 * PaymentIntent (payment_method_types per provider support in HK), return only
 * the client secret, and confirm via a signed webhook (STRIPE_WEBHOOK_SECRET).
 */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "pay"), 10).ok) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "validation" }, { status: 422 });
  return NextResponse.json({ ok: true, intent: await createDemoIntent(parsed.data.amount, parsed.data.method) });
}
