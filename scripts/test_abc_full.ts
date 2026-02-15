/**
 * A/B/C Full Report Test
 * Generates 3 complete V3 card reports with different writing styles
 * Saves to DB → viewable in browser
 */

import * as dotenv from "dotenv";
dotenv.config();

const { generateV3Cards } = await import("../lib/gemini_client");
const { calculateSaju } = await import("../lib/saju_calculator");
const { analyzeOperatingState } = await import("../lib/operating_logic");
const { translateToBehaviors, calculateLuckCycle } = await import("../lib/behavior_translator");
const { fetchHumanDesign } = await import("../lib/hd_client");
const { storage } = await import("../server/storage");

import type { SurveyScores } from "../lib/gemini_client";
import type { HumanDesignData } from "../lib/behavior_translator";

// ── Same input data as production report ──
const BIRTH_DATE = "1996-09-18";
const BIRTH_TIME = "11:56";
const LOCATION = "Seoul, South Korea";
const NAME = "Jiyoon";
const GENDER: "M" | "F" = "F";

const SURVEY: SurveyScores = {
  threatScore: 2, threatClarity: 1,
  environmentScore: 1, environmentStable: 0,
  agencyScore: 2, agencyActive: 1,
  typeKey: "T1_E0_A1", typeName: "Fire Converter",
};

// ── 3 Writing Styles ──

const STYLE_A = `WRITING STYLE:
- Direct but warm. Like a wise friend, not a therapist or coach.
- Conversational. Use contractions (you're, that's, it's, don't).
- Concrete situations, not abstract concepts.
- Vary sentence length. Some short. Some longer with natural flow.
- Occasional fragments are fine. Like this.
- Start some sentences with "And" or "But"
- Use "you" more than "your"

ABSOLUTELY FORBIDDEN (will reject output if found):
- Em-dashes (—). Use periods or commas instead.
- Semicolons.
- "might", "probably", "perhaps", "could be" (hedging)
- Starting multiple sentences with "This is" or "That's"
- "Here's the thing:" more than once
- "Let's be clear:" / "Let's be honest:"
- Ending with "And that changes everything."

NEUROSCIENCE TERMS:
- Use sparingly. ONE per paragraph max.
- Always explain in parentheses or next sentence.
- GOOD: "Your amygdala (the brain's alarm system) runs hot."
- BAD: "Your amygdala triggers cortisol which activates sympathetic response..."

PUNCTUATION:
- Periods. Short sentences are powerful.
- Colons for explanations.
- Parentheses for brief asides.
- Question marks for actual questions.

FIX EM-DASH PATTERNS:
❌ "You're fast — but your clarity needs time."
✅ "You're fast. But your clarity needs time."

❌ "The truth? Your system — which never turns off — burns energy."
✅ "The truth? Your system never turns off. That burns energy."`;

const STYLE_B = `WRITING STYLE:
- Direct. No warmth needed. Like a friend who respects you too much to soften the truth.
- Conversational. Contractions. Fragments. Like this.
- Concrete situations. If it can't happen on a Tuesday afternoon, it's too abstract.
- Short sentences dominate. One longer sentence per paragraph max.
- Start with "You" often. This is about them, not the universe.
- Rhetorical questions that sting. Not to be cruel. To be precise.
- Every sentence should feel slightly uncomfortable to read if it's true.

ABSOLUTELY FORBIDDEN (will reject output if found):
- Em-dashes (—). Use periods or commas instead.
- Semicolons.
- "might", "probably", "perhaps", "could be" (hedging)
- Starting multiple sentences with "This is" or "That's"
- "Here's the thing:" / "Let's be clear:" / "Let's be honest:"
- Ending with "And that changes everything."
- Comfort phrases: "it's okay", "that's normal", "many people", "you're not alone"

NEUROSCIENCE TERMS:
- Use sparingly. ONE per paragraph max.
- Always explain in parentheses or next sentence.

PUNCTUATION:
- Periods. Short sentences hit harder.
- Colons for diagnosis.
- Question marks for questions that sting.`;

const STYLE_C = `WRITING STYLE:
- You are not a friend. You are a diagnostician who happens to speak plainly.
- State what you see. Don't soften it. Don't wrap it in empathy.
- Contractions. Fragments. Short punches.
- One metaphor per card. Make it land. Then move on.
- Questions should make them pause, not nod along.
- Evidence should trigger a physical reaction: "How do you know that about me?"
- The closing line should haunt them for a week.
- Zero filler. If a word can be removed without losing meaning, remove it.

ABSOLUTELY FORBIDDEN (will reject output if found):
- Em-dashes (—). Use periods or commas instead.
- Semicolons.
- "might", "probably", "perhaps", "could be" (hedging)
- Starting multiple sentences with "This is" or "That's"
- "Here's the thing:" / "Let's be clear:" / "Let's be honest:"
- Ending with "And that changes everything."
- Comfort phrases, encouragement, or validation of any kind.
- Clichés: "calm after the storm", "trust the process", "honor your rhythm"

NEUROSCIENCE TERMS:
- Use sparingly. ONE per paragraph max.
- Always explain simply. No jargon chains.

PUNCTUATION:
- Periods dominate. Every sentence earns its place.
- Colons for the kill shot.
- Question marks that land like a slap.`;

async function run() {
  console.log("═".repeat(60));
  console.log("  A/B/C FULL REPORT GENERATION");
  console.log("═".repeat(60));

  // 1. Prepare shared data
  console.log("\n[1/4] Calculating Saju...");
  const sajuData = calculateSaju(BIRTH_DATE, BIRTH_TIME) as any;
  const analysisInput = { ...SURVEY, answers: { q1: "a", q2: "a", q3: "a" } };
  try {
    const opAnalysis = analyzeOperatingState(sajuData, analysisInput);
    sajuData.operatingAnalysis = opAnalysis;
    if (sajuData.stats) sajuData.stats.operatingRate = opAnalysis._internal.finalRate;
  } catch (e) { /* ignore */ }
  console.log(`  Day Master: ${sajuData.fourPillars.day.gan}, Rate: ${sajuData.stats.operatingRate}%`);

  console.log("[2/4] Fetching HD data...");
  const hdResponse = await fetchHumanDesign(BIRTH_DATE, BIRTH_TIME, LOCATION);
  if (!hdResponse) { console.error("HD API failed"); process.exit(1); }
  const hdData: HumanDesignData = {
    type: hdResponse.type, profile: hdResponse.profile,
    strategy: hdResponse.strategy, authority: hdResponse.authority,
    centers: hdResponse.centers, definition: hdResponse.definition,
    signature: hdResponse.signature, not_self_theme: hdResponse.not_self_theme,
    environment: hdResponse.environment || "",
    channels_long: hdResponse.channels_long,
    cognition: hdResponse.cognition, determination: hdResponse.determination,
    incarnation_cross: hdResponse.incarnation_cross, variables: hdResponse.variables,
    motivation: hdResponse.motivation, transference: hdResponse.transference,
    perspective: hdResponse.perspective, distraction: hdResponse.distraction,
    circuitries: hdResponse.circuitries, gates: hdResponse.gates,
    channels_short: hdResponse.channels_short, activations: hdResponse.activations,
  };
  console.log(`  ${hdData.type} ${hdData.profile} | Motivation: ${hdData.motivation} (shadow: ${hdData.transference})`);

  console.log("[3/4] Translating behaviors...");
  const behaviors = translateToBehaviors(sajuData, hdData, SURVEY, BIRTH_DATE);
  const luckCycle = calculateLuckCycle(BIRTH_DATE, BIRTH_TIME, GENDER);

  // 2. Generate 3 reports in parallel
  console.log("[4/4] Generating 3 full V3 reports in parallel...\n");

  const variants = [
    { label: "A", desc: "As-Is (warm friend)", style: STYLE_A, email: "test-abc-a@bada.test" },
    { label: "B", desc: "Edge Up (no warmth)", style: STYLE_B, email: "test-abc-b@bada.test" },
    { label: "C", desc: "Full Diagnostic (provocative)", style: STYLE_C, email: "test-abc-c@bada.test" },
  ];

  const results = await Promise.all(
    variants.map(async (v) => {
      console.log(`  [${v.label}] Generating...`);
      try {
        const cards = await generateV3Cards(
          sajuData, SURVEY, behaviors, NAME, "en",
          BIRTH_DATE, luckCycle, hdData, v.style
        );
        console.log(`  [${v.label}] Done (${Object.keys(cards).length} keys)`);
        return { ...v, cards, error: null };
      } catch (e) {
        console.error(`  [${v.label}] FAILED:`, e);
        return { ...v, cards: null, error: String(e) };
      }
    })
  );

  // 3. Save to DB
  console.log("\nSaving to database...");
  const urls: string[] = [];

  for (const r of results) {
    if (!r.cards) {
      console.log(`  [${r.label}] Skipped (generation failed)`);
      urls.push(`[${r.label}] FAILED`);
      continue;
    }

    // Create lead
    const lead = await storage.upsertLead(r.email, true);

    // Create saju result with v3Cards
    const record = await storage.createSajuResult({
      leadId: lead.id,
      userInput: {
        name: NAME, gender: "female",
        birthDate: BIRTH_DATE, birthTime: BIRTH_TIME,
        birthCity: "Seoul", birthCountry: "South Korea",
        timezone: "Asia/Seoul",
        hdData, surveyScores: SURVEY,
      },
      sajuData,
      reportData: { v3Cards: r.cards },
      language: "en",
    });

    // Unlock for viewing
    await storage.unlockReport(record.id);

    const url = `http://localhost:5001/results/${record.id}`;
    urls.push(`[${r.label}] ${url}`);
    console.log(`  [${r.label}] Saved & unlocked: ${record.id}`);
  }

  // 4. Print comparison
  console.log("\n" + "═".repeat(60));
  console.log("  COMPARE IN BROWSER:");
  console.log("═".repeat(60));
  urls.forEach(u => console.log(`  ${u}`));

  // 5. Side-by-side text comparison of key cards
  console.log("\n" + "═".repeat(60));
  console.log("  QUICK TEXT COMPARISON");
  console.log("═".repeat(60));

  const fields = ["collisionQuestion", "collisionText", "closingLine"] as const;
  for (const field of fields) {
    console.log(`\n  --- ${field} ---`);
    for (const r of results) {
      if (!r.cards) continue;
      const val = (r.cards as any)[field];
      console.log(`  [${r.label}] ${typeof val === 'string' ? val.slice(0, 200) : JSON.stringify(val).slice(0, 200)}`);
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("  PICK: A, B, or C");
  console.log("═".repeat(60));

  process.exit(0);
}

run();
