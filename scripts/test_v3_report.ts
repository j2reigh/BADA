/**
 * Test Script for V3 Report Generation
 * Tests new 3-layer personalization: Saju + HD + Survey behaviors
 */

import * as dotenv from "dotenv";
dotenv.config();

import { generateLifeBlueprintReport, type SurveyScores } from "../lib/gemini_client";
import { calculateSaju } from "../lib/saju_calculator";
import { translateToBehaviors, SAMPLE_HD_DATA } from "../lib/behavior_translator";

// Sample user data (이지윤)
const TEST_BIRTH_DATE = "1996-09-18";
const TEST_BIRTH_TIME = "14:30";
const TEST_GENDER = "F";
const TEST_NAME = "Jiyoon";

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
  console.log("V3 REPORT GENERATION TEST");
  console.log("=".repeat(60));
  console.log(`\nUser: ${TEST_NAME}`);
  console.log(`Birth: ${TEST_BIRTH_DATE} ${TEST_BIRTH_TIME}`);
  console.log(`Survey Type: ${TEST_SURVEY_SCORES.typeName}`);
  console.log("");

  // Calculate saju
  console.log("[1/4] Calculating Saju...");
  const sajuResult = calculateSaju(TEST_BIRTH_DATE, TEST_BIRTH_TIME);
  console.log(`   Day Master: ${sajuResult.fourPillars.day.gan}`);
  console.log(`   Elements: ${JSON.stringify(sajuResult.elementCounts)}`);
  console.log(`   Operating Rate: ${sajuResult.stats.operatingRate.toFixed(1)}%`);

  // Translate behaviors
  console.log("\n[2/4] Translating to Behaviors...");
  const behaviors = translateToBehaviors(sajuResult, SAMPLE_HD_DATA, TEST_SURVEY_SCORES, TEST_BIRTH_DATE);
  console.log("\n--- BEHAVIOR PATTERNS (Plain Language) ---");
  console.log(`\nDECISION STYLE:\n${behaviors.decisionStyle}`);
  console.log(`\nDECISION WARNING:\n${behaviors.decisionWarning}`);
  console.log(`\nENERGY PATTERN:\n${behaviors.energyPattern}`);
  console.log(`\nWARNING SIGNAL:\n${behaviors.warningSignal}`);
  console.log(`\nOPTIMAL ENVIRONMENT:\n${behaviors.optimalEnvironment}`);
  console.log(`\nAGE CONTEXT:\n${behaviors.ageContext}`);
  console.log(`\nSTRENGTHS:\n${behaviors.strengths.slice(0, 3).join('\n')}`);
  console.log(`\nVULNERABILITIES:\n${behaviors.vulnerabilities.slice(0, 2).join('\n')}`);
  console.log(`\nDESIGN VS PERCEPTION GAPS:\n${behaviors.designVsPerception.join('\n\n')}`);

  // Generate report
  console.log("\n" + "=".repeat(60));
  console.log("[3/4] Generating Report with Gemini...");
  console.log("=".repeat(60));

  try {
    const report = await generateLifeBlueprintReport(
      sajuResult,
      TEST_SURVEY_SCORES,
      TEST_NAME,
      undefined, // no archetype override
      "en",
      TEST_BIRTH_DATE
    );

    console.log("\n[4/4] REPORT OUTPUT:");
    console.log("=".repeat(60));

    // Page 1
    console.log("\n--- PAGE 1: IDENTITY ---");
    console.log(`Title: ${report.page1_identity.title}`);
    console.log(`Sub-headline: ${report.page1_identity.sub_headline}`);
    console.log(`One-line diagnosis: ${report.page1_identity.one_line_diagnosis || 'N/A'}`);
    console.log(`\nNature Snapshot:`);
    console.log(`  ${report.page1_identity.nature_snapshot.title}`);
    console.log(`  ${report.page1_identity.nature_snapshot.definition}`);
    console.log(`  ${report.page1_identity.nature_snapshot.explanation}`);
    console.log(`\nBrain Snapshot:`);
    console.log(`  ${report.page1_identity.brain_snapshot.title}`);
    console.log(`  ${report.page1_identity.brain_snapshot.definition}`);
    console.log(`  ${report.page1_identity.brain_snapshot.explanation}`);
    console.log(`\nEfficiency: ${report.page1_identity.efficiency_snapshot.score} - ${report.page1_identity.efficiency_snapshot.label}`);
    console.log(`  ${report.page1_identity.efficiency_snapshot.metaphor}`);

    // Page 2
    console.log("\n--- PAGE 2: NATURAL BLUEPRINT ---");
    console.log(`Title: ${report.page2_hardware.nature_title}`);
    if ((report.page2_hardware as any).core_drive) {
      console.log(`Core Drive: ${(report.page2_hardware as any).core_drive}`);
    }
    console.log(`\nNature Description:\n${report.page2_hardware.nature_description}`);
    console.log(`\nShadow: ${report.page2_hardware.shadow_title}`);
    console.log(`${report.page2_hardware.shadow_description}`);
    console.log(`\nCore Insights:`);
    report.page2_hardware.core_insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });

    // Page 3
    console.log("\n--- PAGE 3: OPERATING SYSTEM ---");
    console.log(`Title: ${report.page3_os.os_title}`);
    if ((report.page3_os as any).os_anchor) {
      console.log(`Anchor: ${(report.page3_os as any).os_anchor}`);
    }
    console.log(`\nThreat Axis (${report.page3_os.threat_axis.level}):`);
    console.log(`  ${report.page3_os.threat_axis.description}`);
    console.log(`\nEnvironment Axis (${report.page3_os.environment_axis.level}):`);
    console.log(`  ${report.page3_os.environment_axis.description}`);
    console.log(`\nAgency Axis (${report.page3_os.agency_axis.level}):`);
    console.log(`  ${report.page3_os.agency_axis.description}`);
    console.log(`\nOS Summary:\n${report.page3_os.os_summary}`);

    // Page 4
    console.log("\n--- PAGE 4: FRICTION MAP ---");
    console.log(`Title: ${report.page4_mismatch.friction_title}`);
    if ((report.page4_mismatch as any).friction_anchor) {
      console.log(`Anchor: ${(report.page4_mismatch as any).friction_anchor}`);
    }
    console.log(`\nCareer: ${report.page4_mismatch.career_friction.title}`);
    console.log(`  ${report.page4_mismatch.career_friction.description}`);
    console.log(`  Quick Tip: ${report.page4_mismatch.career_friction.quick_tip}`);
    console.log(`\nRelationship: ${report.page4_mismatch.relationship_friction.title}`);
    console.log(`  ${report.page4_mismatch.relationship_friction.description}`);
    console.log(`  Quick Tip: ${report.page4_mismatch.relationship_friction.quick_tip}`);
    console.log(`\nMoney: ${report.page4_mismatch.money_friction.title}`);
    console.log(`  ${report.page4_mismatch.money_friction.description}`);
    console.log(`  Quick Tip: ${report.page4_mismatch.money_friction.quick_tip}`);

    // Page 5
    console.log("\n--- PAGE 5: ACTION PROTOCOL ---");
    console.log(`Goal: ${report.page5_solution.transformation_goal}`);
    console.log(`Protocol: ${report.page5_solution.protocol_name}`);
    if ((report.page5_solution as any).protocol_anchor) {
      console.log(`Anchor: ${(report.page5_solution as any).protocol_anchor}`);
    }
    console.log(`\nDaily Rituals:`);
    report.page5_solution.daily_rituals.forEach((ritual, i) => {
      console.log(`\n  ${i + 1}. ${ritual.name}`);
      console.log(`     ${ritual.description}`);
      console.log(`     When: ${ritual.when}`);
      if (ritual.anti_pattern) {
        console.log(`     Skip Cost: ${ritual.anti_pattern}`);
      }
    });
    console.log(`\nEnvironment Boost (${report.page5_solution.environment_boost.element_needed}):`);
    report.page5_solution.environment_boost.tips.forEach((tip, i) => {
      console.log(`  ${i + 1}. ${tip}`);
    });
    console.log(`\nClosing Message:\n${report.page5_solution.closing_message}`);

    // Quality Check
    console.log("\n" + "=".repeat(60));
    console.log("QUALITY CHECK:");
    console.log("=".repeat(60));

    const fullText = JSON.stringify(report);
    const emDashCount = (fullText.match(/—/g) || []).length;
    const mightCount = (fullText.match(/might/gi) || []).length;
    const probablyCount = (fullText.match(/probably/gi) || []).length;
    const perhapsCount = (fullText.match(/perhaps/gi) || []).length;

    console.log(`Em-dashes found: ${emDashCount}`);
    console.log(`Hedging words (might/probably/perhaps): ${mightCount + probablyCount + perhapsCount}`);

    // Check for HD/Saju terms
    const hdTerms = ['Emotional', 'Sacral', 'Spleen', 'Projector', 'Generator', 'Manifestor', 'Reflector', 'Solar Plexus', 'Authority'];
    const sajuTerms = ['사주', 'Fire element', 'Wood element', 'Water element', 'Metal element', 'Earth element', 'Day Master'];

    let foundHDTerms: string[] = [];
    let foundSajuTerms: string[] = [];

    hdTerms.forEach(term => {
      if (fullText.includes(term)) foundHDTerms.push(term);
    });
    sajuTerms.forEach(term => {
      if (fullText.includes(term)) foundSajuTerms.push(term);
    });

    console.log(`HD terms in output: ${foundHDTerms.length > 0 ? foundHDTerms.join(', ') : 'NONE (Good!)'}`);
    console.log(`Saju terms in output: ${foundSajuTerms.length > 0 ? foundSajuTerms.join(', ') : 'NONE (Good!)'}`);

    console.log("\n" + "=".repeat(60));
    console.log("TEST COMPLETE");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\nERROR:", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      console.log("\n[!] GEMINI_API_KEY not set. Using mock report instead.");
      console.log("    Set GEMINI_API_KEY environment variable to test real generation.");
    }
  }
}

runTest();
