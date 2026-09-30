import { handleSubmission } from "@/lib/api";
import { bookingSchema } from "@/lib/validation";
import { hkToday } from "@/lib/dates";
import { NextResponse } from "next/server";
import { bookingReference } from "@/lib/utils";
import { createDemoIntent } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * Server-side booking validation. Authoritative checks live here:
 * schema + sanitisation, rate limit, date not in the past.
 * PRODUCTION TODO: re-price from the database (never trust client totals),
 * lock the slot capacity in a transaction, then create the payment intent.
 * The response never contains card data; the browser never sends any.
 */
export async function POST(req: Request) {
  const clone = req.clone();
  let date: string | undefined;
  try {
    date = (await clone.json())?.date;
  } catch {}
  if (date && date < hkToday()) return NextResponse.json({ ok: false, error: "validation", fields: { date: "val.invalid" } }, { status: 422 });

  return handleSubmission(req, {
    scope: "booking",
    schema: bookingSchema,
    limit: 6,
    extra: async (d) => {
      const intent = await createDemoIntent(0, d.paymentMethod);
      return { reference: bookingReference(), intent };
    },
  });
}
