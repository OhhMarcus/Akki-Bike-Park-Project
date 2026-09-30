import { z } from "zod";
import { sanitizeText } from "./sanitize";

/**
 * Shared zod schemas. The SAME schemas run in the browser (instant feedback)
 * and inside the API routes (authoritative validation). Error `message` values
 * are translation keys resolved by the UI.
 */
const text = (max: number, min = 1) =>
  z
    .string()
    .transform((s) => sanitizeText(s, max))
    .pipe(z.string().min(min, "val.required").max(max, "val.tooLong"));

const optionalText = (max: number) =>
  z
    .string()
    .optional()
    .transform((s) => (s ? sanitizeText(s, max) : ""));

export const emailSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().min(1, "val.required").max(200).regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "val.email"));

// Hong Kong-friendly: 8-digit local or international format
export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(\+?\d{8,15})$/, "val.phone"));

export const guardianSchema = z.object({
  name: text(80),
  relationship: text(40),
  phone: phoneSchema,
  email: emailSchema,
  consentGiven: z.literal(true, { error: "val.guardianConsent" }),
});

export const participantSchema = z
  .object({
    id: z.string().max(40),
    name: text(80),
    age: z.coerce.number({ error: "val.required" }).int("val.age").min(3, "val.age").max(99, "val.age"),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    emergencyName: text(80),
    emergencyPhone: phoneSchema,
    bike: z.enum(["own", "rental"]),
    equipment: z.object({ helmet: z.boolean(), gloves: z.boolean(), pads: z.boolean() }),
    guardian: guardianSchema.optional(),
    coachingAddOn: z.boolean(),
  })
  .superRefine((p, ctx) => {
    if (p.age < 18 && !p.guardian) ctx.addIssue({ code: "custom", path: ["guardian"], message: "val.guardianRequired" });
  });

export const bookingSchema = z.object({
  experienceId: z.enum(["entry", "beginner", "coaching", "kids", "camp", "private", "school", "corporate", "event"]),
  eventId: z.string().max(60).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "val.required"),
  period: z.enum(["morning", "afternoon", "fullday"]),
  participants: z.array(participantSchema).min(1, "val.participants").max(40),
  contactName: text(80),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  promoCode: optionalText(30),
  paymentMethod: z.enum(["card", "fps", "alipayhk", "wechat"]),
  termsAccepted: z.literal(true, { error: "val.terms" }),
  waiverAccepted: z.literal(true, { error: "val.waiver" }),
  marketingConsent: z.boolean().default(false),
});

export const enquirySchema = z.object({
  topic: z.enum(["general", "booking", "group", "partnership"]),
  name: text(80),
  email: emailSchema,
  phone: optionalText(30),
  message: text(2000, 10),
  consent: z.literal(true, { error: "val.consent" }),
  // Honeypot: real users never fill this in
  website: z.string().max(0).optional(),
});

export const groupEnquirySchema = z.object({
  segment: z.enum(["school", "youth", "corporate", "birthday", "private", "brand"]),
  organisation: text(120),
  contactName: text(80),
  email: emailSchema,
  phone: phoneSchema,
  groupSize: z.coerce.number().int().min(2, "val.groupSize").max(500, "val.groupSize"),
  preferredDate: optionalText(10),
  addOns: z.array(z.enum(["coaching", "rental", "catering", "photography"])).default([]),
  message: optionalText(2000),
  consent: z.literal(true, { error: "val.consent" }),
  website: z.string().max(0).optional(),
});

export const waitlistSchema = z.object({
  name: text(80),
  email: emailSchema,
  phone: phoneSchema,
  experienceId: z.enum(["entry", "beginner", "coaching", "kids", "camp", "private", "school", "corporate", "event"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period: z.enum(["morning", "afternoon", "fullday"]),
  partySize: z.coerce.number().int().min(1).max(40),
  consent: z.literal(true, { error: "val.consent" }),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.literal(true, { error: "val.consent" }),
  website: z.string().max(0).optional(),
});

export const proposalContactSchema = z.object({
  name: text(80),
  email: emailSchema,
  message: text(2000, 5),
  consent: z.literal(true, { error: "val.consent" }),
});

/** Flatten a ZodError to { fieldPath: messageKey } */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_";
    if (!out[path]) out[path] = issue.message.startsWith("val.") ? issue.message : "val.invalid";
  }
  return out;
}
