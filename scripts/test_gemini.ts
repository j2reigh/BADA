#!/usr/bin/env npx tsx
/**
 * Gemini AI Report Generator Test Script
 * Tests the Saju -> Gemini Report flow
 */

import { calculateSaju } from "../lib/saju_calculator";
import { generateSajuReport } from "../lib/gemini_client";

const TEST_DATE = "1996-09-18";
const TEST_TIME = "11:56";
const TEST_NAME = "Morgan";

console.log("\n" + "=".repeat(60));
console.log("🤖 Gemini Saju Report Generator Test");
console.log("=".repeat(60));
console.log(`\nInput: ${TEST_DATE} ${TEST_TIME}`);
console.log(`Name: ${TEST_NAME}\n`);

(async () => {
  try {
    // Step 1: Calculate Saju
    console.log("📊 [1/2] Calculating Saju...");
    const sajuResult = calculateSaju(TEST_DATE, TEST_TIME);
    console.log(`   ✓ Day Master: ${sajuResult.fourPillars.day.gan}`);
    console.log(`   ✓ Element Balance: Fire=${sajuResult.elementCounts.fire}`);

    // Step 2: Generate Report
    console.log("\n🤖 [2/2] Generating AI Report (calling Gemini)...");
    const report = await generateSajuReport(sajuResult, TEST_NAME);

    // Display Report
    console.log("\n" + "=".repeat(60));
    console.log("📄 SAJU REPORT");
    console.log("=".repeat(60) + "\n");
    console.log(report);
    console.log("\n" + "=".repeat(60));
    console.log("✅ TEST PASSED: Report generated successfully!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.error("\n" + "=".repeat(60) + "\n");
    process.exit(1);
  }
})();
