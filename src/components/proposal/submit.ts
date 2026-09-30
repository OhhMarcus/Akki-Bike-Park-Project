import { fieldErrors, proposalContactSchema } from "@/lib/validation";

export type ContactResult = { status: "ok" } | { status: "invalid"; fields: Record<string, string> } | { status: "rate" } | { status: "error" };

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  consent: boolean;
  website: string;
}

/** Validate with the shared schema, then POST to /api/proposal-contact. */
export async function sendProposalContact(payload: ContactPayload): Promise<ContactResult> {
  const parsed = proposalContactSchema.safeParse(payload);
  if (!parsed.success) return { status: "invalid", fields: fieldErrors(parsed.error) };
  try {
    const res = await fetch("/api/proposal-contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed.data, website: payload.website }) });
    if (res.status === 429) return { status: "rate" };
    if (res.status === 422) {
      const data = (await res.json()) as { fields?: Record<string, string> };
      return { status: "invalid", fields: data.fields ?? {} };
    }
    return res.ok ? { status: "ok" } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
