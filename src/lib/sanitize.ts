/** Strip control characters and angle brackets; collapse whitespace. React escapes on render, this is defence in depth for stored/exported data. */
export function sanitizeText(input: unknown, max = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, max);
}

export function sanitizeDeep<T>(v: T): T {
  if (typeof v === "string") return sanitizeText(v, 2000) as unknown as T;
  if (Array.isArray(v)) return v.map(sanitizeDeep) as unknown as T;
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, sanitizeDeep(x)])) as T;
  }
  return v;
}
