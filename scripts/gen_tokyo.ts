import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { calculateSaju } = await import("../lib/saju_calculator.js");
  const { translateToBehaviors } = await import("../lib/behavior_translator.js");
  const { generateV3Cards } = await import("../lib/gemini_client.js");

  const birthDate = "1988-11-03";
  const birthTime = "08:20";
  const gender = "male";
  const timezone = "Asia/Tokyo";
  const coords = { lat: 35.6762, lon: 139.6503 };

  const saju = calculateSaju(birthDate, birthTime, gender, timezone, coords);
  console.log("Four Pillars:", JSON.stringify(saju.fourPillars, null, 2));

  const surveyScores = {
    threatScore: 4,
    threatClarity: 1,
    environmentScore: 4,
    environmentStable: 1,
    agencyScore: 2,
    agencyActive: 0,
    typeKey: "T1-E1-A0",
    typeName: "Observer",
  };

  const dummyHd = {
    type: "Manifestor",
    profile: "1/3",
    strategy: "To Inform",
    authority: "Splenic",
    centers: ["Throat", "Heart", "Spleen"],
    definition: "Single",
    signature: "Peace",
    not_self_theme: "Anger",
    environment: "Caves",
    channels_long: ["Channel 21-45: The Money Line — A Design of a Materialist"],
    channels_short: ["21-45"],
  };

  const behaviors = translateToBehaviors(
    saju,
    dummyHd as any,
    surveyScores,
    birthDate,
    gender,
    { latitude: coords.lat, longitude: coords.lon },
  );

  console.log("\nGenerating Tokyo (Japanese)...\n");

  const v3 = await generateV3Cards(
    saju,
    surveyScores,
    behaviors,
    "Friend",
    "ja",  // Japanese
    birthDate,
    null,
    dummyHd as any,
  );

  console.log("=== CLOSING ===");
  console.log("closingLine:", v3.closingLine);
  console.log("\n=== MIRROR (bonus) ===");
  console.log("Question:", v3.mirrorQuestion);
  console.log("Text:", v3.mirrorText);
  console.log("Accent:", v3.mirrorAccent);
}

main();
