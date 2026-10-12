import type { MessageKey } from "@/i18n/dictionary";
import type { Formatters } from "@/i18n/format";
import type { ParkState } from "@/lib/schedule";
import type { HKNow } from "@/lib/time";
import type { sampleWeather } from "@/lib/weather";
import type { WarningCode } from "@/types";

type T = (key: MessageKey, vars?: Record<string, string | number>) => string;

export type ParkSummary = {
  open: boolean;
  /** closed because of a weather closure */
  weather: boolean;
  /** "Open now" / "Closed now" */
  title: string;
  /** why it's closed */
  reason?: string;
  /** "Open till 9:00pm" / "Opens Tomorrow, 3:00pm" */
  when?: string;
};

/** Words for the park state, shared by the home status card and the visit page. */
export function summarizePark(state: ParkState, now: HKNow, t: T, fmt: Formatters): ParkSummary {
  if (state.open) return { open: true, weather: false, title: t("park.open"), when: t("park.closesAt", { time: fmt.time(state.closesAt) }) };
  return {
    open: false,
    weather: state.reason === "weather",
    title: t("park.closed"),
    reason: t(`reason.${state.reason}`),
    when: state.opensAt
      ? t("park.opensAt", { day: fmt.relDay(state.opensAt.date, now.date), time: fmt.time(state.opensAt.time) })
      : undefined,
  };
}

type Weather = ReturnType<typeof sampleWeather>;
const WET: WarningCode[] = ["amber_rain", "red_rain", "black_rain", "thunderstorm", "t8"];

/** Sample weather nudged to agree with the warning staff have set, so the card never says "Fair" in a rainstorm. */
export function coherentWeather(w: Weather, warning: WarningCode | null): Weather {
  if (warning && WET.includes(warning)) return { ...w, sky: "showers", humidity: Math.max(w.humidity, 90) };
  if (warning === "very_hot") return { ...w, sky: "fair", tempC: Math.max(w.tempC, 34) };
  return w;
}

/** Google Maps links built from the configured search query. */
export function mapsLinks(query: string) {
  const q = encodeURIComponent(query);
  return {
    search: `https://www.google.com/maps/search/?api=1&query=${q}`,
    transit: `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=transit`,
    driving: `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`,
  };
}
