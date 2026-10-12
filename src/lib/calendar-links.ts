import type { HHmm, ISODate } from "@/types";

const stamp = (d: ISODate, t: HHmm) => `${d.replace(/-/g, "")}T${t.replace(":", "")}00`;
const esc = (s: string) => s.replace(/[\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

export function buildIcs(o: { uid: string; title: string; date: ISODate; start: HHmm; end: HHmm; location: string; description: string }) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AKKI Bike Park//Booking//EN",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Hong_Kong",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0800",
    "TZOFFSETTO:+0800",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${o.uid}@akki-demo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=Asia/Hong_Kong:${stamp(o.date, o.start)}`,
    `DTEND;TZID=Asia/Hong_Kong:${stamp(o.date, o.end)}`,
    `SUMMARY:${esc(o.title)}`,
    `LOCATION:${esc(o.location)}`,
    `DESCRIPTION:${esc(o.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(o: { title: string; date: ISODate; start: HHmm; end: HHmm; location: string; details: string }) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: o.title,
    dates: `${stamp(o.date, o.start)}/${stamp(o.date, o.end)}`,
    ctz: "Asia/Hong_Kong",
    location: o.location,
    details: o.details,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
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
