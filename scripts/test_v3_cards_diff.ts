import 'dotenv/config';

/**
 * Test: Does generateV3Cards produce genuinely different content for different users?
 *
 * User A: Test지윤이상하네 (Master Builder, earth, fire:4, overdriven) — the example in the prompt
 * User B: Opposite profile (Passive Floater, water, wood:3, underperforming)
 */

import { generateV3Cards, type SurveyScores } from "../lib/gemini_client";
import { translateToBehaviors, calculateLuckCycle, SAMPLE_HD_DATA } from "../lib/behavior_translator";
import type { SajuResult } from "../lib/saju_calculator";

// ── USER B: Completely different from the example ──

const USER_B_SAJU: SajuResult = {
  fourPillars: {
    year: { gan: "壬", zhi: "申", ganGod: "편인", zhiGod: "식신", ganElement: "water", zhiElement: "metal" },
    month: { gan: "癸", zhi: "卯", ganGod: "정인", zhiGod: "정재", ganElement: "water", zhiElement: "wood" },
    day: { gan: "壬", zhi: "子", ganGod: "비견", zhiGod: "겁재", ganElement: "water", zhiElement: "water" },
    hour: { gan: "甲", zhi: "辰", ganGod: "식신", zhiGod: "편관", ganElement: "wood", zhiElement: "earth" },
  },
  elementCounts: { wood: 3, fire: 0, earth: 1, metal: 1, water: 3 },
  dayMasterStrength: 82,
  dayMasterCategory: "strong" as const,
  tenGodsAnalysis: {
    dominant: "비견",
    distribution: { "비견": 2, "겁재": 1, "식신": 2, "편인": 1, "정인": 1, "정재": 1, "편관": 1 },
  },
  stats: { operatingRate: 38 },
  hardwareAnalysis: {
    hardwareType: "dynamic" as const,
    hardwareScore: 4,
    interactionPenalty: -1,
    details: { tenGodsScore: 3, bodyStrengthScore: 2 },
  },
  operatingAnalysis: {
    level: 2,
    levelName: "Reactive",
    _internal: { alignmentType: "underperforming" },
  },
} as any;

const USER_B_SURVEY: SurveyScores = {
  threatScore: 0,
  threatClarity: 0,     // LOW threat sensitivity
  environmentScore: 2,
  environmentStable: 0,  // VOLATILE environment
  agencyScore: 0,
  agencyActive: 0,       // PASSIVE agency
  typeKey: "T0-E0-A0",
  typeName: "Passive Floater",
};

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("TEST: User B (Passive Floater, water, wood:3, underperforming)");
  console.log("═══════════════════════════════════════\n");

  const behaviors = translateToBehaviors(
    USER_B_SAJU,
    SAMPLE_HD_DATA,
    USER_B_SURVEY,
    "1992-03-15"
  );

  const luckCycle = calculateLuckCycle("1992-03-15", "14:00", "M");

  console.log("Behaviors translated. Luck cycle:", luckCycle?.currentDaYun.ganZhi, "\n");
  console.log("Calling Gemini...\n");

  const result = await generateV3Cards(
    USER_B_SAJU,
    USER_B_SURVEY,
    behaviors,
    "TestUserB",
    "en",
    "1992-03-15",
    luckCycle
  );

  // Print key fields for comparison
  console.log("── HOOK ──");
  console.log(result.hookQuestion);

  console.log("\n── MIRROR ──");
  console.log("Q:", result.mirrorQuestion);
  console.log("A:", result.mirrorText);

  console.log("\n── BLUEPRINT ──");
  console.log("Q:", result.blueprintQuestion);
  console.log("A:", result.blueprintText);

  console.log("\n── COLLISION ──");
  console.log("Q:", result.collisionQuestion);
  console.log("A:", result.collisionText);

  console.log("\n── CHAPTER (timeline) ──");
  const ch = result.chapter;
  console.log("Q:", ch.question);
  console.log(`  ${ch.previousLabel}: ${ch.previousText}`);
  console.log(`  ${ch.currentLabel}: ${ch.currentText}`);
  console.log(`  ${ch.nextLabel}: ${ch.nextText}`);
  console.log("  Accent:", ch.accent);

  console.log("\n── YEAR ──");
  console.log("Q:", result.yearQuestion);
  console.log("A:", result.yearText);
  console.log("Accent:", result.yearAccent);

  console.log("\n── PROTOCOL (this week) ──");
  console.log("Q:", result.actionQuestion);
  console.log("Name:", result.shift.name);
  console.log("Action:", result.shift.text);
  console.log("When:", result.shift.when);

  console.log("\n── CLOSING ──");
  console.log(result.closingLine);
}

main().catch(console.error);
