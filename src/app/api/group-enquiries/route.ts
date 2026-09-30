import { handleSubmission } from "@/lib/api";
import { groupEnquirySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const POST = (req: Request) =>
  handleSubmission(req, {
    scope: "group",
    schema: groupEnquirySchema,
    limit: 5,
    table: "group_enquiries",
    toRow: (d) => ({ segment: d.segment, organisation: d.organisation, contact_name: d.contactName, email: d.email, phone: d.phone, group_size: d.groupSize, preferred_date: d.preferredDate || null, add_ons: d.addOns, message: d.message, status: "new" }),
  });
