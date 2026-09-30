import { handleSubmission } from "@/lib/api";
import { waitlistSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const POST = (req: Request) =>
  handleSubmission(req, {
    scope: "waitlist",
    schema: waitlistSchema,
    limit: 6,
    table: "waitlist",
    toRow: (d) => ({ name: d.name, email: d.email, phone: d.phone, experience_id: d.experienceId, date: d.date, period: d.period, party_size: d.partySize, status: "waiting" }),
  });
