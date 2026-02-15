/**
 * Test Script for V3 Card Report Generation
 * Uses real HD API data + Saju + Survey → V3 Collision Cards
 */

import * as dotenv from "dotenv";
dotenv.config();

// Dynamic imports after dotenv.config() so env vars are available at module init
const { generateV3Cards } = await import("../lib/gemini_client");
const { calculateSaju } = await import("../lib/saju_calculator");
const { translateToBehaviors, calculateLuckCycle } = await import("../lib/behavior_translator");
const { fetchHumanDesign } = await import("../lib/hd_client");
import type { SurveyScores } from "../lib/gemini_client";
import type { HumanDesignData } from "../lib/behavior_translator";

// Sample user data (이지윤)
const TEST_BIRTH_DATE = "1996-09-18";
const TEST_BIRTH_TIME = "14:30";
const TEST_GENDER: "M" | "F" = "F";
const TEST_NAME = "Jiyoon";
const TEST_LOCATION = "Seoul, South Korea";

// Sample survey scores
const TEST_SURVEY_SCORES: SurveyScores = {
  threatScore: 2,
  threatClarity: 1, // High sensitivity
  environmentScore: 1,
  environmentStable: 0, // Volatile
  agencyScore: 2,
  agencyActive: 1, // High drive
  typeKey: "HVA",
  typeName: "Fire Converter"
};

async function runTest() {
  console.log("=".repeat(60));
  console.log("V3 CARD REPORT GENERATION TEST");
  console.log("=".repeat(60));
  console.log(`\nUser: ${TEST_NAME}`);
  console.log(`Birth: ${TEST_BIRTH_DATE} ${TEST_BIRTH_TIME}`);
  console.log(`Location: ${TEST_LOCATION}`);
  console.log(`Survey Type: ${TEST_SURVEY_SCORES.typeName}`);
  console.log("");

  // 1. Calculate Saju
  console.log("[1/5] Calculating Saju...");
  const sajuResult = calculateSaju(TEST_BIRTH_DATE, TEST_BIRTH_TIME);
  console.log(`   Day Master: ${sajuResult.fourPillars.day.gan}`);
  console.log(`   Elements: ${JSON.stringify(sajuResult.elementCounts)}`);
  console.log(`   Operating Rate: ${sajuResult.stats.operatingRate.toFixed(1)}%`);

  // 2. Fetch HD Data from real API
  console.log("\n[2/5] Fetching HD Data from API...");
  const hdResponse = await fetchHumanDesign(TEST_BIRTH_DATE, TEST_BIRTH_TIME, TEST_LOCATION);
  if (!hdResponse) {
    console.error("HD API returned no data. Check API keys.");
    return;
  }

  const hdData: HumanDesignData = {
    type: hdResponse.type,
    profile: hdResponse.profile,
    strategy: hdResponse.strategy,
    authority: hdResponse.authority,
    centers: hdResponse.centers,
    definition: hdResponse.definition,
    signature: hdResponse.signature,
    not_self_theme: hdResponse.not_self_theme,
    environment: hdResponse.environment || "",
    channels_long: hdResponse.channels_long,
    cognition: hdResponse.cognition,
    determination: hdResponse.determination,
    incarnation_cross: hdResponse.incarnation_cross,
    variables: hdResponse.variables,
    motivation: hdResponse.motivation,
    transference: hdResponse.transference,
    perspective: hdResponse.perspective,
    distraction: hdResponse.distraction,
    circuitries: hdResponse.circuitries,
    gates: hdResponse.gates,
    channels_short: hdResponse.channels_short,
    activations: hdResponse.activations,
  };

  console.log(`   Type: ${hdData.type}`);
  console.log(`   Profile: ${hdData.profile}`);
  console.log(`   Authority: ${hdData.authority}`);
  console.log(`   Motivation: ${hdData.motivation} (shadow: ${hdData.transference})`);
  console.log(`   Perspective: ${hdData.perspective} (shadow: ${hdData.distraction})`);

  // 3. Translate Behaviors
  console.log("\n[3/5] Translating to Behaviors...");
  const behaviors = translateToBehaviors(sajuResult, hdData, TEST_SURVEY_SCORES, TEST_BIRTH_DATE);
  console.log(`   Decision Style: ${behaviors.decisionStyle.slice(0, 60)}...`);
  console.log(`   Vulnerabilities: ${behaviors.vulnerabilities.length} found`);
  console.log(`   Gaps: ${behaviors.designVsPerception.length} found`);

  // 4. Calculate Luck Cycle
  console.log("\n[4/5] Calculating Luck Cycle...");
  const luckCycle = calculateLuckCycle(TEST_BIRTH_DATE, TEST_BIRTH_TIME, TEST_GENDER);
  if (luckCycle) {
    console.log(`   Current 대운: ${luckCycle.currentDaYun.ganZhi} (ages ${luckCycle.currentDaYun.startAge}-${luckCycle.currentDaYun.endAge})`);
    console.log(`   세운 ${luckCycle.currentSeUn.year}: ${luckCycle.currentSeUn.ganZhi}`);
  }

  // 5. Generate V3 Cards
  console.log("\n" + "=".repeat(60));
  console.log("[5/5] Generating V3 Cards with Gemini...");
  console.log("=".repeat(60));

  try {
    const cards = await generateV3Cards(
      sajuResult,
      TEST_SURVEY_SCORES,
      behaviors,
      TEST_NAME,
      "en",
      TEST_BIRTH_DATE,
      luckCycle,
      hdData
    );

    console.log("\n" + "=".repeat(60));
    console.log("V3 CARD OUTPUT");
    console.log("=".repeat(60));

    console.log(`\n[HOOK] ${cards.hookQuestion}`);
    console.log(`\n[MIRROR] ${cards.mirrorQuestion}`);
    console.log(`${cards.mirrorText}`);
    console.log(`  accent: ${cards.mirrorAccent}`);
    console.log(`\n[BLUEPRINT] ${cards.blueprintQuestion}`);
    console.log(`${cards.blueprintText}`);
    console.log(`  accent: ${cards.blueprintAccent}`);
    console.log(`\n[COLLISION] ${cards.collisionQuestion}`);
    console.log(`${cards.collisionText}`);
    console.log(`  accent: ${cards.collisionAccent}`);
    console.log(`\n[EVIDENCE] ${cards.evidenceQuestion}`);
    cards.evidence.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    console.log(`\n[COST: CAREER] ${cards.costCareerQuestion}`);
    console.log(`  ${cards.costCareer.title}: ${cards.costCareer.text}`);
    console.log(`\n[COST: RELATIONSHIP] ${cards.costRelationshipQuestion}`);
    console.log(`  ${cards.costRelationship.title}: ${cards.costRelationship.text}`);
    console.log(`\n[COST: MONEY] ${cards.costMoneyQuestion}`);
    console.log(`  ${cards.costMoney.title}: ${cards.costMoney.text}`);
    console.log(`\n[BRAIN SCAN] ${cards.brainScan.question}`);
    console.log(`  Alarm: ${cards.brainScan.alarm}% | Drive: ${cards.brainScan.drive}% | Stability: ${cards.brainScan.stability}% | Remaining: ${cards.brainScan.remaining}%`);
    console.log(`  ${cards.brainScan.insight}`);
    console.log(`\n[CHAPTER] ${cards.chapter.question}`);
    console.log(`  ${cards.chapter.previousLabel}: ${cards.chapter.previousText}`);
    console.log(`  ${cards.chapter.currentLabel}: ${cards.chapter.currentText}`);
    console.log(`  ${cards.chapter.nextLabel}: ${cards.chapter.nextText}`);
    console.log(`  accent: ${cards.chapter.accent}`);
    console.log(`\n[YEAR] ${cards.yearQuestion}`);
    console.log(`${cards.yearText}`);
    console.log(`  accent: ${cards.yearAccent}`);
    console.log(`\n[ACTION] ${cards.actionQuestion}`);
    console.log(`Neuro: ${cards.actionNeuro}`);
    console.log(`  Shift: ${cards.shift.name}`);
    console.log(`  ${cards.shift.text}`);
    console.log(`  When: ${cards.shift.when}`);
    console.log(`\n[CLOSING] ${cards.closingLine}`);

    // Quality Check
    console.log("\n" + "=".repeat(60));
    console.log("QUALITY CHECK:");
    console.log("=".repeat(60));

    const fullText = JSON.stringify(cards);
    const emDashCount = (fullText.match(/—/g) || []).length;
    const hedgingCount = (fullText.match(/\b(might|probably|perhaps)\b/gi) || []).length;

    const hdTerms = ['Emotional', 'Sacral', 'Spleen', 'Projector', 'Generator', 'Manifestor', 'Reflector', 'Solar Plexus', 'Authority'];
    const sajuTerms = ['사주', 'Fire element', 'Wood element', 'Water element', 'Metal element', 'Earth element', 'Day Master'];

    const foundHD = hdTerms.filter(t => fullText.includes(t));
    const foundSaju = sajuTerms.filter(t => fullText.includes(t));

    console.log(`Em-dashes: ${emDashCount}`);
    console.log(`Hedging words: ${hedgingCount}`);
    console.log(`HD jargon leaked: ${foundHD.length > 0 ? foundHD.join(', ') : 'NONE (Good!)'}`);
    console.log(`Saju jargon leaked: ${foundSaju.length > 0 ? foundSaju.join(', ') : 'NONE (Good!)'}`);

    console.log("\n" + "=".repeat(60));
    console.log("TEST COMPLETE");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\nERROR:", error);
  }
}

runTest();
