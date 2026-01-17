/**
 * Unlock Code Generation Script
 *
 * Usage:
 *   npx tsx scripts/generate_codes.ts [count] [memo]
 *
 * Examples:
 *   npx tsx scripts/generate_codes.ts 50 "Beta testers"
 *   npx tsx scripts/generate_codes.ts 10
 */

import { db } from "../server/db";
import { validCodes } from "../shared/schema";

// Positive English words for code generation
const POSITIVE_WORDS = [
  // Light/Energy
  "SHINE", "GLOW", "SPARK", "LIGHT", "BLAZE", "BEAM", "BRIGHT",
  // Growth
  "BLOOM", "GROW", "RISE", "SOAR", "LEAP", "CLIMB", "THRIVE",
  // Strength
  "BRAVE", "BOLD", "STRONG", "POWER", "FORCE", "MIGHTY",
  // Positivity
  "HAPPY", "LUCKY", "BLISS", "JOY", "PEACE", "CALM",
  // Success
  "STAR", "CROWN", "PRIME", "PEAK", "ELITE", "CHAMP",
  // Nature
  "OCEAN", "RIVER", "STORM", "WAVE", "BREEZE", "AURORA",
  // Other
  "DREAM", "MAGIC", "WONDER", "GRACE", "HOPE", "FAITH"
];

/**
 * Generate a single unlock code
 * Format: WORD + 4-digit number (e.g., SHINE4521)
 */
function generateCode(): string {
  const word = POSITIVE_WORDS[Math.floor(Math.random() * POSITIVE_WORDS.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `${word}${number}`;
}

/**
 * Generate multiple unique codes
 */
function generateUniqueCodes(count: number): string[] {
  const codes = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10;

  while (codes.size < count && attempts < maxAttempts) {
    codes.add(generateCode());
    attempts++;
  }

  if (codes.size < count) {
    console.warn(`Warning: Could only generate ${codes.size} unique codes out of ${count} requested`);
  }

  return Array.from(codes);
}

async function main() {
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 50;
  const memo = args[1] || undefined;

  console.log(`\n🔑 Generating ${count} unlock codes...`);
  if (memo) {
    console.log(`📝 Memo: ${memo}`);
  }
  console.log("");

  // Generate codes
  const codes = generateUniqueCodes(count);

  try {
    // Insert into database
    const results = await db
      .insert(validCodes)
      .values(codes.map(code => ({ code, memo })))
      .returning();

    console.log(`✅ Successfully created ${results.length} codes:\n`);
    console.log("─".repeat(50));

    results.forEach((result, i) => {
      console.log(`${String(i + 1).padStart(3)}. ${result.code}`);
    });

    console.log("─".repeat(50));
    console.log(`\n📋 Codes list (copy-paste friendly):\n`);
    console.log(results.map(r => r.code).join("\n"));
    console.log("");

  } catch (error: any) {
    if (error.code === "23505") {
      console.error("❌ Error: Some codes already exist in the database. Try again.");
    } else {
      console.error("❌ Error inserting codes:", error.message);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
