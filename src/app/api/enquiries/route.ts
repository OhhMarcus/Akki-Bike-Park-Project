import { handleSubmission } from "@/lib/api";
import { enquirySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const POST = (req: Request) =>
  handleSubmission(req, {
    scope: "enquiry",
    schema: enquirySchema,
    limit: 5,
    table: "enquiries",
    toRow: (d) => ({ topic: d.topic, name: d.name, email: d.email, phone: d.phone, message: d.message, consent: d.consent, status: "new" }),
  });
