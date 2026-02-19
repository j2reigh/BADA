import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { calculateSaju } = await import("../lib/saju_calculator.js");
  const { translateToBehaviors } = await import("../lib/behavior_translator.js");
  const { generateV3Cards } = await import("../lib/gemini_client.js");

  const birthDate = "1989-05-17";
  const birthTime = "14:00";
  const gender = "female";
  const timezone = "Asia/Jakarta";
  const coords = { lat: -6.2088, lon: 106.8456 };

  const saju = calculateSaju(birthDate, birthTime, gender, timezone, coords);
  console.log("Four Pillars:", JSON.stringify(saju.fourPillars, null, 2));

  const surveyScores = {
    threatScore: 3,
    threatClarity: 1,
    environmentScore: 3,
    environmentStable: 1,
    agencyScore: 3,
    agencyActive: 0,
    typeKey: "T1-E1-A0",
    typeName: "Observer",
  };

  const dummyHd = {
    type: "Generator",
    profile: "2/4",
    strategy: "To Respond",
    authority: "Emotional",
    centers: ["Sacral", "Solar Plexus", "Root", "Spleen"],
    definition: "Split",
    signature: "Satisfaction",
    not_self_theme: "Frustration",
    environment: "Markets",
    channels_long: ["Channel 59-6: Intimacy — A Design of Focused on Reproduction"],
    channels_short: ["59-6"],
  };

  const behaviors = translateToBehaviors(
    saju,
    dummyHd as any,
    surveyScores,
    birthDate,
    gender,
    { latitude: coords.lat, longitude: coords.lon },
  );

  console.log("\nGenerating Jakarta (Indonesian)...\n");

  const v3 = await generateV3Cards(
    saju,
    surveyScores,
    behaviors,
    "Friend",
    "id", // Indonesian
    birthDate,
    null,
    dummyHd as any,
  );

  console.log("=== EVIDENCE ===");
  console.log("Question:", v3.evidenceQuestion);
  console.log("Items:", JSON.stringify(v3.evidence, null, 2));
}

main();
