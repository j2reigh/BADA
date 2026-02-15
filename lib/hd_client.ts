/**
 * Human Design API Client
 * Calls the HD API (humandesignapi.nl) to fetch bodygraph data
 *
 * API: POST https://api.humandesignapi.nl/v1/bodygraphs
 * Plan: Advanced (€269)
 */

export interface HDApiResponse {
  type: string;
  profile: string;
  strategy: string;
  authority: string;
  centers: string[];
  definition: string;
  signature: string;
  not_self_theme: string;
  environment: string;
  cognition: string;
  determination: string;
  variables: string;
  motivation: string;
  transference: string;
  perspective: string;
  distraction: string;
  channels_long: string[];
  channels_short: string[];
  gates: string[];
  incarnation_cross: string;
  circuitries: string;
  activations: { design: Record<string, string>; personality: Record<string, string> };
}

const HD_API_URL = "https://api.humandesignapi.nl/v1/bodygraphs";
const HD_API_KEY = process.env.HD_API_KEY;
const HD_GEOCODE_KEY = process.env.HD_GEOCODE_KEY;

/**
 * Convert date format: "1996-09-18" → "18-Sep-96"
 * HD API expects DD-Mon-YY (2-digit year)
 */
function formatBirthDate(isoDate: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [year, month, day] = isoDate.split("-");
  const shortYear = year.slice(-2);
  return `${day}-${months[parseInt(month, 10) - 1]}-${shortYear}`;
}

/**
 * Fetch Human Design bodygraph data from the HD API.
 *
 * @param birthDate - ISO date string "YYYY-MM-DD"
 * @param birthTime - Time string "HH:MM"
 * @param location  - Location string e.g. "Seoul, South Korea"
 * @returns HDApiResponse or null on failure (report generation will be blocked)
 */
export async function fetchHumanDesign(
  birthDate: string,
  birthTime: string,
  location: string
): Promise<HDApiResponse | null> {
  if (!HD_API_KEY || !HD_GEOCODE_KEY) {
    console.warn("[HD API] Missing HD_API_KEY or HD_GEOCODE_KEY. Skipping HD API call.");
    return null;
  }

  try {
    const formattedDate = formatBirthDate(birthDate);

    const body = {
      birthdate: formattedDate,
      birthtime: birthTime,
      location: location,
    };

    console.log(`[HD API] Calling API for ${location}, birthdate=${formattedDate}, birthtime=${birthTime}`);

    const response = await fetch(HD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "HD-Api-Key": HD_API_KEY,
        "HD-Geocode-Key": HD_GEOCODE_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[HD API] Error ${response.status}: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[HD API] Success: type=${data.type}, profile=${data.profile}, authority=${data.authority}`);

    return data as HDApiResponse;
  } catch (error) {
    console.error("[HD API] Request failed:", error);
    return null;
  }
}
