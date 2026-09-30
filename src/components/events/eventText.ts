import type { ParkEvent } from "@/types";

type T = (key: "events.card.age" | "events.card.ageRange" | "events.price.tbc" | "events.price.free", vars?: Record<string, string | number>) => string;

export function ageText(e: ParkEvent, t: T) {
  return e.maxAge != null ? t("events.card.ageRange", { min: e.minAge, max: e.maxAge }) : t("events.card.age", { min: e.minAge });
}

export function priceText(e: ParkEvent, t: T, money: (n: number) => string) {
  if (e.priceHKD == null) return t("events.price.tbc");
  if (e.priceHKD === 0) return t("events.price.free");
  return money(e.priceHKD);
}
