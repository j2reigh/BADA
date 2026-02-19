import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { calculateSaju } = await import("../lib/saju_calculator.js");
  const { translateToBehaviors } = await import("../lib/behavior_translator.js");
  const { generateV3Cards } = await import("../lib/gemini_client.js");

  const birthDate = "2001-08-14";
  const birthTime = "15:30";
  const gender = "female";
  const timezone = "Europe/London";
  const coords = { lat: 51.5074, lon: -0.1278 };

  const saju = calculateSaju(birthDate, birthTime, gender, timezone, coords);
  console.log("Four Pillars:", JSON.stringify(saju.fourPillars, null, 2));

  const surveyScores = {
    threatScore: 3,
    threatClarity: 1,
    environmentScore: 2,
    environmentStable: 0,
    agencyScore: 3,
    agencyActive: 0,
    typeKey: "T1-E0-A0",
    typeName: "Sentinel",
  };

  const dummyHd = {
    type: "Projector",
    profile: "4/6",
    strategy: "Wait for the Invitation",
    authority: "Emotional",
    centers: ["Ajna", "Head", "Solar Plexus"],
    definition: "Single",
    signature: "Success",
    not_self_theme: "Bitterness",
    environment: "Markets",
    channels_long: ["Channel 47-64: Abstraction — A Design of Mental Activity & Clarity"],
    channels_short: ["47-64"],
  };

  const behaviors = translateToBehaviors(
    saju,
    dummyHd as any,
    surveyScores,
    birthDate,
    gender,
    { latitude: coords.lat, longitude: coords.lon },
  );

  console.log("\nGenerating London (English)...\n");

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

  console.log("=== BRAIN SCAN ===");
  console.log("Question:", v3.brainScan?.question);
  console.log("Insight:", v3.brainScan?.insight);
}

main();
