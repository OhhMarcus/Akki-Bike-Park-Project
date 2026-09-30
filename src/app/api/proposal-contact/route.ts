import { handleSubmission } from "@/lib/api";
import { proposalContactSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const POST = (req: Request) => handleSubmission(req, { scope: "proposal-contact", schema: proposalContactSchema, limit: 4 });
