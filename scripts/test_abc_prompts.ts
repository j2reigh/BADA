/**
 * A/B/C Prompt Test — As-is baseline + 2 variants
 * Same few-shot example, same data block, only WRITING_STYLE differs
 */

import * as dotenv from "dotenv";
dotenv.config();

const { GoogleGenerativeAI } = await import("@google/generative-ai");
const { calculateSaju } = await import("../lib/saju_calculator");
const { translateToBehaviors, calculateLuckCycle } = await import("../lib/behavior_translator");
const { fetchHumanDesign } = await import("../lib/hd_client");

import type { HumanDesignData } from "../lib/behavior_translator";
import type { SurveyScores } from "../lib/gemini_client";

// ── Test data (이지윤) ──
const BIRTH_DATE = "1996-09-18";
const BIRTH_TIME = "11:56";
const LOCATION = "Seoul, South Korea";
const NAME = "Jiyoon";
const SURVEY: SurveyScores = {
  threatScore: 2, threatClarity: 1,
  environmentScore: 1, environmentStable: 0,
  agencyScore: 2, agencyActive: 1,
  typeKey: "T1_E0_A1", typeName: "Fire Converter",
};

// ── As-is (current production) ──
const STYLE_ASIS = `WRITING STYLE:
- Direct but warm. Like a wise friend, not a therapist or coach.
- Conversational. Use contractions (you're, that's, it's, don't).
- Concrete situations, not abstract concepts.
- Vary sentence length. Some short. Some longer with natural flow.
- Occasional fragments are fine. Like this.
- Start some sentences with "And" or "But"
- Use "you" more than "your"`;

// ── Variant B: Remove "warm", add edge ──
const STYLE_B = `WRITING STYLE:
- Direct. No warmth needed. Like a friend who respects you too much to soften the truth.
- Conversational. Contractions. Fragments. Like this.
- Concrete situations. If it can't happen on a Tuesday afternoon, it's too abstract.
- Short sentences dominate. One longer sentence per paragraph max.
- Start with "You" often. This is about them, not the universe.
- Rhetorical questions that sting. Not to be cruel. To be precise.
- Every sentence should feel slightly uncomfortable to read if it's true.`;

// ── Variant C: Push further — provocative diagnostician ──
const STYLE_C = `WRITING STYLE:
- You are not a friend. You are a diagnostician who happens to speak plainly.
- State what you see. Don't soften it. Don't wrap it in empathy.
- Contractions. Fragments. Short punches.
- One metaphor per card. Make it land. Then move on.
- Questions should make them pause, not nod along.
- Evidence should trigger a physical reaction: "How do you know that about me?"
- The closing line should haunt them for a week.
- Zero filler. If a word can be removed without losing meaning, remove it.`;

// ── Shared rules (same for all) ──
const SHARED_RULES = `ABSOLUTELY FORBIDDEN (will reject output if found):
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

PUNCTUATION:
- Periods. Short sentences are powerful.
- Colons for explanations.
- Parentheses for brief asides.

ABSOLUTE JARGON BAN:
No saju/HD/astrology terms. No Chinese/Korean characters. No gates, channels, authority, 편인, day master, etc.
Translate everything into plain behavioral language.`;

// ── Few-shot example (SAME for all variants) ──
const FEW_SHOT = `
EXAMPLE OUTPUT (different user — match this QUALITY, not this content):
This example is for a Master Builder (T1-E1-A1) with earth day master, fire:4, wood:0, overdriven.

{
  "collisionQuestion": "So what breaks when a mountain tries to sprint?",
  "collisionText": "You think speed is your strength. Your design says it's your biggest leak. You were built to be a mountain, not a sprinter. Every time you rush to fix something, you're overriding the system that gives you your actual power: patience.",
  "collisionAccent": "The gap: you act like fire, but you were built from earth. That mismatch is where your energy disappears.",
  "evidenceQuestion": "Sound familiar?",
  "evidence": [
    "You scan every room for problems before you've even sat down. By the time the meeting starts, you've already drafted three contingency plans.",
    "You say yes before checking your capacity. Not because you want to help. Because saying no feels like failing.",
    "You finish other people's tasks 'because it's faster.' Then resent that no one does the same for you."
  ],
  "costCareer": { "title": "At work", "text": "You become indispensable, then trapped. You built the system, now you're the only one who can maintain it. That's not success. That's a cage you constructed yourself." },
  "costRelationship": { "title": "In relationships", "text": "You show up as the strong one. Always capable, never needing. People stop asking if you're okay because you trained them not to. The fortress works. That's the problem." },
  "closingLine": "Your system isn't broken. It's overclocked. Dial it back 30% and watch what happens."
}`;

async function run() {
  console.log("Preparing test data...\n");

  const saju = calculateSaju(BIRTH_DATE, BIRTH_TIME);
  const hdResponse = await fetchHumanDesign(BIRTH_DATE, BIRTH_TIME, LOCATION);
  if (!hdResponse) { console.error("HD API failed"); return; }
  const hd: HumanDesignData = {
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
  const behaviors = translateToBehaviors(saju, hd, SURVEY, BIRTH_DATE);

  const ALL_HD_CENTERS = ['Head', 'Ajna', 'Throat', 'G Center', 'Heart', 'Solar Plexus', 'Sacral', 'Spleen', 'Root'];
  const openCenters = ALL_HD_CENTERS.filter(c => !hd.centers.includes(c));

  // ── Shared data block (identical to production prompt) ──
  const dataBlock = `
CORE CONCEPT: "COLLISION"
The user has THREE data sources:
1. SURVEY = how they see themselves (self-perception)
2. SAJU = how they were born to operate (structural blueprint)
3. HD = their energy design (how energy flows through their system)

The insight lives in the GAPs between these three.

USER: ${NAME}

SAJU DATA:
- Day Master: ${saju.fourPillars.day.gan} (mountain archetype, steady, deliberate)
- Elements: fire:${saju.elementCounts.fire} earth:${saju.elementCounts.earth} wood:${saju.elementCounts.wood} water:${saju.elementCounts.water} metal:${saju.elementCounts.metal}
- Missing: ${Object.entries(saju.elementCounts).filter(([,v]) => v === 0).map(([k]) => k).join(", ") || "none"}
- Excess (≥3): ${Object.entries(saju.elementCounts).filter(([,v]) => (v as number) >= 3).map(([k]) => k).join(", ") || "none"}

SURVEY DATA:
- OS Type: ${SURVEY.typeName} (${SURVEY.typeKey})
- Threat: HIGH | Environment: VOLATILE | Agency: ACTIVE

HD DATA:
- Type: ${hd.type}, Profile: ${hd.profile}, Authority: ${hd.authority}
- Defined Centers: ${hd.centers.join(", ")}
- Open Centers: ${openCenters.join(", ")}
- Motivation: ${hd.motivation} (shadow: ${hd.transference})
- Perspective: ${hd.perspective} (shadow: ${hd.distraction})

BEHAVIOR PATTERNS:
- Decision: ${behaviors.decisionStyle.slice(0, 150)}
- Energy: ${behaviors.energyPattern.slice(0, 150)}
- Vulnerabilities: ${behaviors.vulnerabilities.slice(0, 2).map(v => v.slice(0, 100)).join(" | ")}
- Gaps: ${behaviors.designVsPerception.slice(0, 2).map(g => g.slice(0, 100)).join(" | ")}

Generate these fields as JSON:
{
  "collisionQuestion": "...",
  "collisionText": "2-3 sentences",
  "collisionAccent": "1 sentence",
  "evidenceQuestion": "short question",
  "evidence": ["3 specific behavioral examples"],
  "costCareer": { "title": "At work", "text": "2-3 sentences" },
  "costRelationship": { "title": "In relationships", "text": "2-3 sentences" },
  "closingLine": "1 sentence that stays with them"
}
Output ONLY valid JSON.`;

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const variants = [
    { name: "A — AS-IS (Direct but warm)", style: STYLE_ASIS },
    { name: "B — Edge up (No warmth, precise)", style: STYLE_B },
    { name: "C — Full diagnostic (Provocative)", style: STYLE_C },
  ];

  console.log("Generating 3 variants in parallel...\n");

  const results = await Promise.all(
    variants.map(async (v) => {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { maxOutputTokens: 4096 },
      });
      const prompt = `You are writing a personal diagnostic report for ${NAME}. Not a personality test. Not a horoscope. A diagnostic.\n\n${v.style}\n\n${SHARED_RULES}\n\n${FEW_SHOT}\n\n${dataBlock}`;
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: "Generate diagnostic JSON." }] }],
          systemInstruction: prompt,
        });
        const text = result.response.text().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        return { name: v.name, data: JSON.parse(text), raw: text };
      } catch (e) {
        return { name: v.name, data: null, raw: String(e) };
      }
    })
  );

  for (const r of results) {
    console.log("\n" + "═".repeat(70));
    console.log(`  ${r.name}`);
    console.log("═".repeat(70));
    if (!r.data) {
      console.log("  ERROR:", r.raw.slice(0, 300));
      continue;
    }
    console.log(`\n  COLLISION Q: ${r.data.collisionQuestion}`);
    console.log(`\n  COLLISION:\n  ${r.data.collisionText}`);
    console.log(`\n  ACCENT: ${r.data.collisionAccent}`);
    console.log(`\n  EVIDENCE Q: ${r.data.evidenceQuestion}`);
    r.data.evidence?.forEach((e: string, i: number) => console.log(`    ${i + 1}. ${e}`));
    console.log(`\n  CAREER: ${r.data.costCareer?.text}`);
    console.log(`\n  RELATIONSHIP: ${r.data.costRelationship?.text}`);
    console.log(`\n  CLOSING: ${r.data.closingLine}`);

    // Quality check
    const full = JSON.stringify(r.data);
    const em = (full.match(/—/g) || []).length;
    const hedge = (full.match(/\b(might|probably|perhaps|could be)\b/gi) || []).length;
    const jargon = ['Emotional', 'Sacral', 'Generator', 'Manifestor', 'Authority', 'day master', '편인'].filter(t => full.includes(t));
    console.log(`\n  [QC] em-dash:${em} hedging:${hedge} jargon:${jargon.length > 0 ? jargon.join(',') : 'clean'}`);
  }

  console.log("\n" + "═".repeat(70));
  console.log("  A = as-is | B = edge up | C = full diagnostic");
  console.log("  PICK ONE (or mix: e.g. 'B style + C closing')");
  console.log("═".repeat(70));
}

run();
