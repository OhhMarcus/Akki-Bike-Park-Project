import { handleSubmission } from "@/lib/api";
import { newsletterSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const POST = (req: Request) =>
  handleSubmission(req, { scope: "newsletter", schema: newsletterSchema, table: "newsletter_subscribers", toRow: (d) => ({ email: d.email, consent: d.consent }) });
