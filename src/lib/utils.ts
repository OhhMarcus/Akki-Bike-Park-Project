import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let counter = 0;
export function uid(prefix = "id") {
  counter = (counter + 1) % 1e6;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeRef(random: () => number = Math.random) {
  let s = "";
  for (let i = 0; i < 5; i++) s += REF_CHARS[Math.floor(random() * REF_CHARS.length)];
  return `AK-${s}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function sum<T>(items: T[], pick: (x: T) => number) {
  return items.reduce((s, x) => s + pick(x), 0);
}
