/**
 * Hong Kong numbers: 8 digits, optional +852 / 852 prefix.
 * Returns "+852 9123 4567" or null when invalid.
 */
export function normalizeHKPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  const local = digits.length === 11 && digits.startsWith("852") ? digits.slice(3) : digits;
  if (!/^[2-9]\d{7}$/.test(local)) return null;
  return `+852 ${local.slice(0, 4)} ${local.slice(4)}`;
}

export function phoneDigits(display: string) {
  return display.replace(/[^\d]/g, "");
}

export function waLink(displayOrDigits: string, text?: string) {
  const base = `https://wa.me/${phoneDigits(displayOrDigits)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
