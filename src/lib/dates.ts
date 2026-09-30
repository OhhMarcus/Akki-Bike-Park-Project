/** All dates are YYYY-MM-DD strings in Hong Kong time (UTC+8, no DST). */
const HK_OFFSET_MS = 8 * 60 * 60 * 1000;

export function hkNow(): Date {
  return new Date(Date.now() + HK_OFFSET_MS);
}

export function hkToday(): string {
  return hkNow().toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysFromToday(days: number): string {
  return addDays(hkToday(), days);
}

export function weekday(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function monthGrid(year: number, month0: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const days = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(first.getUTCDay()).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(Date.UTC(year, month0, d)).toISOString().slice(0, 10));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function isPast(iso: string) {
  return iso < hkToday();
}

/** Build an .ics file body */
export function buildIcs(opts: { title: string; date: string; start: string; end: string; location: string; description: string; uid: string }) {
  const f = (d: string, t: string) => `${d.replace(/-/g, "")}T${t.replace(":", "")}00`;
  const esc = (s: string) => s.replace(/[\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AKKI Bike Park//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@akki-demo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=Asia/Hong_Kong:${f(opts.date, opts.start)}`,
    `DTEND;TZID=Asia/Hong_Kong:${f(opts.date, opts.end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `LOCATION:${esc(opts.location)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl(opts: { title: string; date: string; start: string; end: string; location: string; details: string }) {
  const f = (d: string, t: string) => `${d.replace(/-/g, "")}T${t.replace(":", "")}00`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${f(opts.date, opts.start)}/${f(opts.date, opts.end)}`,
    ctz: "Asia/Hong_Kong",
    location: opts.location,
    details: opts.details,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    let s = v == null ? "" : String(v);
    // Neutralise spreadsheet formula injection
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
