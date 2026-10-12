import type { ISODate } from "@/types";
import { rng } from "./prng";

/**
 * SAMPLE weather so the status card looks alive. Production: HK Observatory
 * open data (https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread).
 */
export function sampleWeather(date: ISODate, minutes: number) {
  const r = rng(`wx:${date}`);
  const base = 24 + r() * 4; // daily mean
  const diurnal = Math.sin(((minutes / 60 - 9) / 24) * Math.PI * 2) * 2.6;
  const tempC = Math.round(base + diurnal);
  const sky = r() < 0.55 ? "fair" : r() < 0.7 ? "cloudy" : "showers";
  return { tempC, sky: sky as "fair" | "cloudy" | "showers", humidity: Math.round(62 + r() * 25) };
}
