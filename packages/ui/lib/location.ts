/**
 * Country codes where state/province is conventionally included in an
 * address line (e.g. "Lahore, Punjab, Pakistan", "San Francisco, California, USA").
 * For everywhere else, only "City, Country" is used.
 */
const STATE_INCLUSION_COUNTRIES = new Set([
  "US", // United States
  "CA", // Canada
  "AU", // Australia
  "IN", // India
  "MX", // Mexico
  "BR", // Brazil
  "AR", // Argentina
  "NG", // Nigeria
  "PK", // Pakistan
  "MY", // Malaysia
  "AE", // United Arab Emirates (emirates ≈ states)
  "DE", // Germany (Bundesland)
  "CN", // China (Province)
  "RU", // Russia
  "ID", // Indonesia
]);

interface GeoFields {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  suburb?: string;
  // Which of these Nominatim returns depends on how a place happens to be
  // mapped administratively, not on how specific the coordinates are. Rural and
  // unincorporated areas frequently carry none of city/town/village/suburb —
  // which is how a reading ends up as bare "State, Country".
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  county?: string;
  state_district?: string;
  state?: string;
  region?: string;
  country?: string;
  country_code?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

/**
 * Reverse-geocode coordinates to a location object via Nominatim (OpenStreetMap).
 * Nominatim's address fields are more granular than BigDataCloud's (city vs metro),
 * giving the actual town/city the coordinates fall in (e.g. "Bristow", not "Washington").
 *
 * Returns null on error so callers can fall back.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoFields | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data: NominatimResponse = await res.json();
    const a = data.address || {};
    // Both rungs are ordered most-recognisable first and only ever EXTENDED
    // past the previous fallbacks, so any location that already resolved keeps
    // exactly the name it had. The additions are there for the case that was
    // reported: nothing matched at all and the display collapsed to
    // "Virginia, United States". A county is not as good as a town, but
    // "Prince William County, Virginia" still tells you where you are.
    return {
      city:
        a.city ||
        a.town ||
        a.village ||
        a.hamlet ||
        a.municipality ||
        a.suburb ||
        a.city_district ||
        a.county ||
        a.state_district ||
        "",
      locality: a.suburb || a.neighbourhood || a.quarter || "",
      principalSubdivision: a.state || a.region || "",
      countryName: a.country || "",
      countryCode: (a.country_code || "").toUpperCase(),
    };
  } catch {
    return null;
  }
}

function cleanCountryName(name: string): string {
  // ISO names sometimes have "(the)" appended — strip it
  return name.replace(/\s*\(the\)\s*$/i, "").trim();
}

/**
 * Format a reverse-geocoded location into a display string.
 * - Federal/multi-state countries: "City, State, Country"
 * - Everywhere else: "City, Country"
 * - Prefers locality (more specific) over city (often a broader metro area)
 * - Deduplicates parts so identical values don't appear twice.
 */
export function formatLocation(geo: GeoFields): string {
  // Prefer locality — BigDataCloud's "locality" is typically the neighborhood
  // or small town the coordinates fall into, while "city" may be a broader
  // metro area (e.g. "Washington" instead of "Linton Hall").
  const city = geo.locality || geo.city || "";
  const state = geo.principalSubdivision || "";
  const country = cleanCountryName(geo.countryName || "");
  const code = (geo.countryCode || "").toUpperCase();

  const parts: string[] = [];
  const seen = new Set<string>();
  const push = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    parts.push(trimmed);
  };

  push(city);
  if (STATE_INCLUSION_COUNTRIES.has(code)) push(state);
  push(country);

  return parts.join(", ");
}
