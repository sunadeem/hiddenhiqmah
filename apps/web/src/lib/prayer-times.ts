// On-device prayer-time computation (batoulapps/Adhan). Replaces the aladhan.com
// network API for any path that has the device's GPS coordinates — so the
// device's location never leaves the phone, times work fully offline, and
// high-latitude Fajr/Isha are handled correctly. Times are formatted in the
// device's local timezone (correct when the user is at the location, which is
// the GPS path; typed remote-city lookups still use the geocoding API).

import { Coordinates, CalculationMethod, PrayerTimes, Madhab, HighLatitudeRule } from "adhan";

export type Timings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

// Map the app's aladhan-style calculation-method numbers to Adhan presets.
function paramsForMethod(method: number) {
  const m = CalculationMethod;
  switch (method) {
    case 1: return m.Karachi();
    case 2: return m.NorthAmerica(); // ISNA
    case 4: return m.UmmAlQura();
    case 5: return m.Egyptian();
    case 7: return m.Tehran();
    case 8: return m.Dubai(); // Gulf region
    case 9: return m.Kuwait();
    case 10: return m.Qatar();
    case 11: return m.Singapore();
    case 13: return m.Turkey(); // Diyanet
    case 15: return m.MoonsightingCommittee();
    case 3:
    default:
      return m.MuslimWorldLeague();
  }
}

function hhmm(d: Date): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Compute prayer times on-device for the given coordinates.
 * @param method aladhan-style calculation method number (default 3 = MWL)
 * @param asrHanafi true → Hanafi Asr (later); false → Shafi/standard
 * @param date the day to compute for (defaults to today)
 */
export function computePrayerTimes(
  lat: number,
  lng: number,
  opts: { method?: number; asrHanafi?: boolean; date?: Date } = {}
): Timings {
  const coords = new Coordinates(lat, lng);
  const params = paramsForMethod(opts.method ?? 3);
  params.madhab = opts.asrHanafi ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  const pt = new PrayerTimes(coords, opts.date ?? new Date(), params);
  return {
    Fajr: hhmm(pt.fajr),
    Sunrise: hhmm(pt.sunrise),
    Dhuhr: hhmm(pt.dhuhr),
    Asr: hhmm(pt.asr),
    Maghrib: hhmm(pt.maghrib),
    Isha: hhmm(pt.isha),
  };
}
