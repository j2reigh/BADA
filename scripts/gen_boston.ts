import dotenv from "dotenv";
dotenv.config();

// Dynamic imports so dotenv runs first
async function main() {
  const { calculateSaju } = await import("../lib/saju_calculator.js");
  const { translateToBehaviors } = await import("../lib/behavior_translator.js");
  const { generateV3Cards } = await import("../lib/gemini_client.js");

  const birthDate = "1993-12-31";
  const birthTime = "10:00";
  const gender = "male";
  const timezone = "America/New_York";
  const coords = { lat: 42.3601, lon: -71.0589 };

  const saju = calculateSaju(birthDate, birthTime, gender, timezone, coords);
  console.log("Four Pillars:", JSON.stringify(saju.fourPillars, null, 2));

  // Dummy survey scores
  const surveyScores = {
    threatScore: 4,
    threatClarity: 1,
    environmentScore: 3,
    environmentStable: 1,
    agencyScore: 4,
    agencyActive: 1,
    typeKey: "T1-E1-A1",
    typeName: "Master Builder",
  };

  // Dummy HD data
  const dummyHd = {
    type: "Generator",
    profile: "3/5",
    strategy: "To Respond",
    authority: "Sacral",
    centers: ["Sacral", "Root", "Solar Plexus", "Throat"],
    definition: "Split",
    signature: "Satisfaction",
    not_self_theme: "Frustration",
    environment: "Kitchens",
    channels_long: ["Channel 34-57: The Archetype — A Design of a Human Being"],
    channels_short: ["34-57"],
  };

  const behaviors = translateToBehaviors(
    saju,
    dummyHd as any,
    surveyScores,
    birthDate,
    gender,
    { latitude: coords.lat, longitude: coords.lon },
  );

  console.log("\nCalling generateV3Cards with real pipeline...\n");

  const v3 = await generateV3Cards(
    saju,
    surveyScores,
    behaviors,
    "Friend",
    "en",
    birthDate,
    null,
    dummyHd as any,
  );

  console.log("=== MIRROR CARD ===");
  console.log("Question:", v3.mirrorQuestion);
  console.log("Text:", v3.mirrorText);
  console.log("Accent:", v3.mirrorAccent);
}

main();
