import type { Enquiry } from "@/types";

export type Topic = Enquiry["topic"];
export const topics: Topic[] = ["general", "booking", "group", "partnership"];

/** Accepts topic values and friendly aliases from ?topic=. */
export function parseTopic(v: string | undefined): Topic {
  const s = (v ?? "").toLowerCase();
  if (s === "groups" || s === "group-sales") return "group";
  if (s === "sponsorship" || s === "partner") return "partnership";
  return topics.find((x) => x === s) ?? "general";
}
