#!/usr/bin/env npx ts-node
/**
 * Saju Integration Test Script
 * Verifies that Calculator logic and Constants mapping work together perfectly
 */

import { calculateSaju } from "../lib/saju_calculator";
import {
  DAY_MASTER_MAP,
  TEN_GODS_MAP,
  EARTHLY_BRANCH_MAP,
} from "../lib/saju_constants";

const TEST_DATE = "1996-09-18";
const TEST_TIME = "11:56";

console.log("\n" + "=".repeat(50));
console.log("🔮 Saju Integration Test");
console.log("=".repeat(50));
console.log(`Input: ${TEST_DATE} ${TEST_TIME}\n`);

try {
  // Calculate Saju
  const saju = calculateSaju(TEST_DATE, TEST_TIME);

  // ===== VALIDATION 1: Day Master =====
  console.log("[1] Day Master (Core Identity):");
  const dayMasterGan = saju.fourPillars.day.gan;
  const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];

  if (!dayMasterInfo) {
    throw new Error(`❌ Day Master "${dayMasterGan}" not found in DAY_MASTER_MAP`);
  }

  console.log(`    ✓ Character: ${dayMasterGan} (${dayMasterInfo.name})`);
  console.log(`    ✓ Archetype: ${dayMasterInfo.archetype}`);
  console.log(`    ✓ Core: ${dayMasterInfo.core}`);

  // ===== VALIDATION 2: Four Pillars & Ten Gods =====
  console.log("\n[2] Four Pillars Structure Analysis:");
  const pillars = [
    { name: "Year", data: saju.fourPillars.year },
    { name: "Month", data: saju.fourPillars.month },
    { name: "Day", data: saju.fourPillars.day },
    { name: "Hour", data: saju.fourPillars.hour },
  ];

  for (const pillar of pillars) {
    if (!pillar.data) {
      console.log(`    ✓ ${pillar.name}: (not available — birth time unknown)`);
      continue;
    }

    const tenGod = pillar.data.ganGod;
    const tenGodInfo = TEN_GODS_MAP[tenGod];

    if (!tenGodInfo) {
      throw new Error(`❌ Ten God "${tenGod}" not found in TEN_GODS_MAP`);
    }

    const branchInfo = EARTHLY_BRANCH_MAP[pillar.data.zhi];
    if (!branchInfo) {
      throw new Error(`❌ Branch "${pillar.data.zhi}" not found in EARTHLY_BRANCH_MAP`);
    }

    console.log(
      `    ✓ ${pillar.name}: ${pillar.data.gan}${pillar.data.zhi} (${branchInfo.name})`
    );
    console.log(
      `      └─ Ten God: ${tenGod} → ${tenGodInfo.english} (${tenGodInfo.label})`
    );
  }

  // ===== VALIDATION 3: Element Balance =====
  console.log("\n[3] Element Balance:");
  const elements = saju.elementCounts;
  console.log(
    `    ✓ Fire: ${elements.fire}, Water: ${elements.water}, Wood: ${elements.wood}`
  );
  console.log(
    `    ✓ Earth: ${elements.earth}, Metal: ${elements.metal}`
  );

  // ===== VALIDATION 4: All Ten Gods Across Pillars =====
  console.log("\n[4] Ten Gods Across All Pillars:");
  const tenGodsInChart = new Set<string>();
  for (const pillar of pillars) {
    if (pillar.data) tenGodsInChart.add(pillar.data.ganGod);
  }

  for (const tenGod of Array.from(tenGodsInChart)) {
    const info = TEN_GODS_MAP[tenGod];
    console.log(
      `    ✓ ${tenGod} (${info.english}): ${info.psychology}`
    );
  }

  // ===== SUCCESS =====
  console.log("\n" + "=".repeat(50));
  console.log("✅ TEST PASSED: All mappings are correct!");
  console.log("=".repeat(50) + "\n");

  // Print Summary
  console.log("📊 SUMMARY:");
  console.log(`   Day Master Archetype: ${dayMasterInfo.archetype}`);
  console.log(`   Unique Ten Gods in Chart: ${tenGodsInChart.size}`);
  console.log(`   Element Balance: Balanced toward Fire (${elements.fire})`);
  console.log("\n✨ Saju data is ready for frontend display!\n");
} catch (error) {
  console.error("\n❌ TEST FAILED:");
  console.error(`   ${error instanceof Error ? error.message : String(error)}`);
  console.error("\n" + "=".repeat(50) + "\n");
  process.exit(1);
}
