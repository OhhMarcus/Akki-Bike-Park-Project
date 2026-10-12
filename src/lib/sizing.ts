import type { BikeSize, Rentals } from "@/types";

export const BIKE_SIZES: BikeSize[] = ["k20", "k24", "S", "M", "L", "XL"];

/** Rental fleet sizing guide (PLACEHOLDER thresholds; confirm with AKKI's fleet). */
export function bikeSizeForHeight(cm: number | undefined | null): BikeSize | null {
  if (!cm || cm < 100 || cm > 220) return null;
  if (cm < 135) return "k20";
  if (cm < 152) return "k24";
  if (cm < 165) return "S";
  if (cm < 178) return "M";
  if (cm < 190) return "L";
  return "XL";
}

export function rentalBikeCount(r: Rentals) {
  return Object.values(r.bikes).reduce((s, n) => s + (n ?? 0), 0);
}

export function emptyRentals(): Rentals {
  return { bikes: {}, helmets: 0 };
}

export function addRentals(a: Rentals, b: Rentals): Rentals {
  const bikes: Rentals["bikes"] = { ...a.bikes };
  for (const s of BIKE_SIZES) if (b.bikes[s]) bikes[s] = (bikes[s] ?? 0) + (b.bikes[s] ?? 0);
  return { bikes, helmets: a.helmets + b.helmets };
}
