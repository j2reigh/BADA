/**
 * Photon Geocoding Client
 * Uses Photon API (komoot.io) for city autocomplete
 * Combined with geo-tz for timezone calculation from coordinates
 */

import { find as findTimezone } from "geo-tz";

export interface PhotonFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    osm_id: number;
    osm_type: string;
    name: string;
    city?: string;
    state?: string;
    county?: string;
    country?: string;
    countrycode?: string;
    type?: string;
  };
}

export interface PhotonResponse {
  type: "FeatureCollection";
  features: PhotonFeature[];
}

export interface CityResult {
  id: string;
  name: string;
  displayName: string;
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
  utcOffset: string;
}

/**
 * Search cities using Photon API
 * @param query - Search query (city name)
 * @param limit - Maximum number of results (default 5)
 * @param lang - Language for results (default "en")
 */
export async function searchCities(
  query: string,
  limit: number = 5,
  lang: string = "en"
): Promise<CityResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query.trim());
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("lang", lang);
  // Filter to only return cities/towns/villages
  url.searchParams.set("osm_tag", "place:city");

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`);
    }

    const data: PhotonResponse = await response.json();
    
    // Also search for towns and villages to get more results
    const townUrl = new URL("https://photon.komoot.io/api/");
    townUrl.searchParams.set("q", query.trim());
    townUrl.searchParams.set("limit", String(limit));
    townUrl.searchParams.set("lang", lang);
    townUrl.searchParams.set("osm_tag", "place:town");

    const townResponse = await fetch(townUrl.toString());
    const townData: PhotonResponse = townResponse.ok ? await townResponse.json() : { features: [] };

    // Combine and dedupe results
    const allFeatures = [...data.features, ...townData.features];
    const seenIds = new Set<number>();
    const uniqueFeatures = allFeatures.filter(f => {
      if (seenIds.has(f.properties.osm_id)) return false;
      seenIds.add(f.properties.osm_id);
      return true;
    });

    return uniqueFeatures.slice(0, limit).map((feature) => convertToResult(feature));
  } catch (error) {
    console.error("Photon search error:", error);
    return [];
  }
}

/**
 * Convert Photon feature to our CityResult format
 * Calculates timezone from coordinates using geo-tz
 */
function convertToResult(feature: PhotonFeature): CityResult {
  const { properties, geometry } = feature;
  const [lon, lat] = geometry.coordinates;

  // Get timezone from coordinates
  const timezones = findTimezone(lat, lon);
  const timezone = timezones[0] || "UTC";

  // Calculate UTC offset
  const utcOffset = getUtcOffset(timezone);

  // Build display name
  const parts: string[] = [];
  const cityName = properties.name || properties.city || "Unknown";
  parts.push(cityName);
  
  if (properties.state && properties.state !== cityName) {
    parts.push(properties.state);
  }
  if (properties.country) {
    parts.push(properties.country);
  }

  return {
    id: `${properties.osm_type}-${properties.osm_id}`,
    name: cityName,
    displayName: parts.join(", "),
    city: cityName,
    state: properties.state,
    country: properties.country || "",
    countryCode: properties.countrycode || "",
    lat,
    lon,
    timezone,
    utcOffset,
  };
}

/**
 * Calculate UTC offset for a timezone
 * Returns formatted string like "UTC+9" or "UTC-5"
 */
function getUtcOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    
    if (tzPart) {
      // Convert "GMT+9" to "UTC+9"
      return tzPart.value.replace("GMT", "UTC");
    }
    
    return "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Get timezone info for specific coordinates
 * Useful when user manually enters coordinates
 */
export function getTimezoneFromCoords(lat: number, lon: number): { timezone: string; utcOffset: string } {
  const timezones = findTimezone(lat, lon);
  const timezone = timezones[0] || "UTC";
  const utcOffset = getUtcOffset(timezone);
  
  return { timezone, utcOffset };
}
