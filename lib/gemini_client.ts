/**
 * Gemini AI Report Generator
 * Generates personalized Life Blueprint Reports using Google Generative AI
 *
 * UPGRADE v3 (2026-02-07): 3-Layer Integration (Saju + HD + Survey)
 * - Plain language output (no HD/saju jargon in output)
 * - Behavior-first approach (concrete situations, not abstract)
 * - Age-aware personalization
 * - Design vs Perception gap analysis
 * - Minimal em-dashes (avoid AI-generated feel)
 * - Limited neuroscience terms with explanations
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DAY_MASTER_MAP, TEN_GODS_MAP, ELEMENT_MAP } from "./saju_constants";
import { FIVE_ELEMENTS_INFO } from "./saju_knowledge";
import { OS_TYPE_PROTOCOLS } from "./standardization_dictionaries";
import {
  translateToBehaviors,
  type HumanDesignData,
  type BehaviorPatterns,
} from "./behavior_translator";
import type { SajuResult } from "./saju_calculator";
import type { ContentArchetype } from "../shared/schema";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY not found. Using mock data.");
}

const client = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// ==========================================
// RETRY UTILITY (Exponential Backoff)
// ==========================================

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryableErrors?: string[];
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    retryableErrors = ['RATE_LIMIT', 'RESOURCE_EXHAUSTED', 'UNAVAILABLE', 'DEADLINE_EXCEEDED', 'INTERNAL', 'timeout', '429', '500', '503']
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = lastError.message.toLowerCase();

      // Check if error is retryable
      const isRetryable = retryableErrors.some(e => errorMessage.includes(e.toLowerCase()));

      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = Math.min(initialDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay);
      console.log(`[Gemini] Retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms. Error: ${lastError.message.slice(0, 100)}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry exhausted');
}

const ALL_HD_CENTERS = ['Head', 'Ajna', 'Throat', 'G Center', 'Heart', 'Solar Plexus', 'Sacral', 'Spleen', 'Root'];

const OS_TYPE_BACKGROUNDS: Record<string, string> = {
  "State Architect": "bg_type_03",
  "Silent Sentinel": "bg_type_08",
  "Master Builder": "bg_type_02",
  "Safe Strategist": "bg_type_06",
  "Fire Converter": "bg_type_01",
  "Emotional Drifter": "bg_type_05",
  "Conscious Maintainer": "bg_type_03",
  "Passive Floater": "bg_type_07",
};

const ELEMENT_OVERLAYS: Record<string, string> = {
  wood: "overlay_wood",
  fire: "overlay_fire",
  earth: "overlay_earth",
  metal: "overlay_metal",
  water: "overlay_water",
};

export interface LifeBlueprintReport {
  page1_identity: {
    title: string;
    sub_headline: string;
    one_line_diagnosis?: string;
    nature_snapshot: { title: string; definition: string; explanation: string };
    brain_snapshot: { title: string; definition: string; explanation: string };
    efficiency_snapshot: { score: string; label: string; metaphor: string };
    visual_concept: { background_id: string; overlay_id: string };
  };
  page2_hardware: {
    section_name: string;
    nature_title: string;
    nature_description: string;
    shadow_title: string;
    shadow_description: string;
    core_insights: string[];
  };
  page3_os: {
    section_name: string;
    os_title: string;
    threat_axis: { title: string; level: string; description: string };
    environment_axis: { title: string; level: string; description: string };
    agency_axis: { title: string; level: string; description: string };
    os_summary: string;
  };
  page4_mismatch: {
    section_name: string;
    friction_title: string;
    career_friction: { title: string; description: string; quick_tip: string };
    relationship_friction: { title: string; description: string; quick_tip: string };
    money_friction: { title: string; description: string; quick_tip: string };
  };
  page5_solution: {
    section_name: string;
    transformation_goal: string;
    protocol_name: string;
    daily_rituals: Array<{ name: string; description: string; when: string; anti_pattern?: string }>;
    environment_boost: { element_needed: string; tips: string[] };
    closing_message: string;
  };
}

export interface SurveyScores {
  threatScore: number;
  threatClarity: number;
  environmentScore: number;
  environmentStable: number;
  agencyScore: number;
  agencyActive: number;
  typeKey: string;
  typeName: string;
}

// Language support helpers
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ko: 'Korean (한국어)',
  id: 'Indonesian (Bahasa Indonesia)',
  ja: 'Japanese (日本語)',
  zh: 'Chinese (中文)',
  es: 'Spanish (Español)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  pt: 'Portuguese (Português)',
  ar: 'Arabic (العربية)',
  th: 'Thai (ภาษาไทย)',
  vi: 'Vietnamese (Tiếng Việt)',
};

function getLanguageInstruction(language: string): string {
  if (language === 'en') {
    return `LANGUAGE: Direct, diagnostic English (B1-B2 level). No jargon. No hedging ("might", "probably", "perhaps"). Use declarative statements: "You do X. Here's why."`;
  }

  const langName = LANGUAGE_NAMES[language] || language;
  return `LANGUAGE & WRITING STYLE — CRITICAL:
Write ALL content in ${langName}. You are a native ${langName} writer, NOT a translator.

ANTI-TRANSLATION RULES:
- Write as if this content was ORIGINALLY conceived in ${langName}
- Do NOT mentally translate from English — think directly in ${langName}
- Use sentence structures, idioms, and rhythms natural to ${langName}
- Avoid calque (loan-translation) from English
- Tone: direct, diagnostic, conversational (B1-B2 native reading level). NOT warm or poetic.
- No hedging: never use "might", "probably", "perhaps", "could". Use declarative statements.
${language === 'ko' ? `- KOREAN SPEECH LEVEL: MUST use polite endings (-요 or -ㅂ니다/-습니다) for ALL sentences. NEVER use plain form (-다 체). BAD: "당신은 이렇게 행동한다." GOOD: "당신은 이렇게 행동해요." or "당신은 이렇게 행동합니다."` : ''}
- For neuroscience terms ONLY: keep English term + native explanation
  e.g., "Amygdala(뇌의 경보 시스템)" / "Amygdala(sistem alarm otak)"
- Any English reference text provided in this prompt is for MEANING only — rewrite it naturally in ${langName}, do not translate word-by-word

OUTPUT FORMATTING RULES:
- Do NOT include square brackets like [pattern] or [term] in the final output. Write actual content.
- Do NOT keep English words in parentheses (except neuroscience terms above).
- Do NOT literally translate English type names (e.g., "Passive Floater" → do NOT write "수동적 부유자"). Instead, describe the behavioral pattern in natural ${langName}.
- All protocol names, ritual names, and section titles must be written natively in ${langName}.
- Every field value must be a COMPLETE, natural sentence — never a template or fill-in-the-blank.`;
}

/**
 * Main Orchestrator
 */
export async function generateLifeBlueprintReport(
  sajuResult: SajuResult,
  surveyScores: SurveyScores,
  userName: string = "Friend",
  archetype?: ContentArchetype,
  language: string = "en",
  birthDate?: string,
  hdData?: HumanDesignData
): Promise<LifeBlueprintReport> {
  if (!client) {
    return generateMockReport(sajuResult, surveyScores);
  }

  try {
    console.log(`[Gemini] Starting Report Generation for ${userName} in ${language}...`);
    const langInstruction = getLanguageInstruction(language);

    // V3: HD data is required — no sample fallback
    if (!hdData) {
      throw new Error("HD data is required for report generation");
    }
    const effectiveHdData: HumanDesignData = hdData;
    const behaviors = translateToBehaviors(
      sajuResult,
      effectiveHdData,
      surveyScores,
      birthDate || "1996-09-18",
      "female"
    );
    console.log("[Gemini] Behavior Patterns Translated");

    const page1 = await generatePage1_v3(sajuResult, surveyScores, behaviors, userName, archetype, langInstruction, language);
    console.log("[Gemini] Page 1 Generated");

    const page2 = await generatePage2_v3(sajuResult, behaviors, page1.title, userName, archetype, langInstruction, language);
    console.log("[Gemini] Page 2 Generated");

    const page3 = await generatePage3_v3(surveyScores, behaviors, userName, langInstruction);
    console.log("[Gemini] Page 3 Generated");

    const page4 = await generatePage4_v3(sajuResult, behaviors, page2, page3, userName, langInstruction);
    console.log("[Gemini] Page 4 Generated");

    const page5 = await generatePage5_v3(sajuResult, behaviors, page3, page4, surveyScores, userName, langInstruction);
    console.log("[Gemini] Page 5 Generated");

    console.log("[Gemini] Report Generation Complete!");

    return {
      page1_identity: page1,
      page2_hardware: page2,
      page3_os: page3,
      page4_mismatch: page4,
      page5_solution: page5,
    };
  } catch (error) {
    console.error("Report Generation Failed:", error);
    throw new Error(`Failed to generate Life Blueprint Report: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ==========================================
// PAGE 1: Identity (Nature Landscape Theme)
// ==========================================
async function generatePage1(sajuResult: SajuResult, surveyScores: SurveyScores, userName: string, archetype?: ContentArchetype, langInstruction?: string, language: string = "en") {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const dayMasterGan = sajuResult.fourPillars.day.gan;
  const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];
  const dominantElement = Object.entries(sajuResult.elementCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0];
  const dominantElementName = dominantElement[0];

  const opAnalysis = (sajuResult as any).operatingAnalysis;
  const alignmentType = opAnalysis?._internal?.alignmentType || 'unknown';
  const levelNum = opAnalysis?.level || 1;
  const levelName = opAnalysis?.levelName || 'Survival';

  const systemPrompt = `You are a "Life Diagnostician" — direct, precise, no flattery.

${archetype ? `STANDARDIZED IDENTITY (MUST USE):
- IDENTITY TITLE: "${archetype.identityTitle}"
- NATURE METAPHOR: "${archetype.natureMetaphor}"
${language !== 'en' ? `- TRANSLATE the title and metaphor naturally into the target language. Keep the meaning, adapt the expression to feel native.` : ''}
` : ''}

USER DATA:
- Name: ${userName}
- Core Nature (Day Master): ${dayMasterInfo.name} - ${dayMasterInfo.archetype}
- Key Strength: ${dayMasterInfo.strength}
- Key Weakness: ${dayMasterInfo.weakness}
- Dominant Element: ${dominantElementName}
- Operating Level: Level ${levelNum} (${levelName})
- Alignment State: ${alignmentType}
${opAnalysis ? `- State Description: ${opAnalysis.levelDescription}` : ''}
${opAnalysis ? `- Guidance: ${opAnalysis.guidance.join(', ')}` : ''}

TONE RULES:
1. ${langInstruction || 'LANGUAGE: Direct, diagnostic English (B1-B2 level). No jargon. No hedging.'}
2. NATURE LANDSCAPE for title ONLY: "A Silent Volcano", "The Midnight Ocean", etc. NOT people.
3. sub_headline is NOT a metaphor — it's a behavioral pattern declaration. "You build systems to feel safe — then suffocate inside them."
4. one_line_diagnosis: One sentence connecting a specific behavior to its root mechanism.
5. NO hedging words: "might", "probably", "perhaps", "could" are BANNED.
6. DIRECT TONE: Not mysterious or poetic. Diagnostic, like a system readout.
7. Do NOT mention Five Elements, element counts, or element theory. This page is about identity and operating level.

OUTPUT (JSON Only):
{
  "title": "The [Adjective] [Nature Noun]",
  "sub_headline": "A behavioral pattern statement — what they DO, not a metaphor (10-15 words). E.g. 'You build systems to feel safe — then suffocate inside them.'",
  "one_line_diagnosis": "One sentence: 'You [specific repeated behavior] because [root mechanism].' Connect a visible pattern to the invisible driver. (15-25 words)",
  "nature_snapshot": {
    "title": "Your Birth Pattern",
    "definition": "One nature metaphor sentence (10-15 words)",
    "explanation": "Connect this to a specific behavioral tendency — not abstract potential. 'This means you [concrete action].' (25-40 words)"
  },
  "brain_snapshot": {
    "title": "Your Current Mind State",
    "definition": "A direct statement about their current operating mode (10-15 words)",
    "explanation": "What this costs them in daily life — energy, decisions, relationships. Be specific. (25-40 words)"
  },
  "efficiency_snapshot": {
    "level": ${levelNum},
    "level_name": "${levelName}",
    "label": "Level ${levelNum} — ${levelName}, ${alignmentType}",
    "metaphor": "A direct statement about what Level ${levelNum} (${levelName}) + ${alignmentType} means in practice. Not a metaphor — a diagnosis. E.g. 'Your system runs but wastes 40% of energy on internal conflict.' (20-30 words)"
  },
  "visual_concept": {
    "background_id": "${OS_TYPE_BACKGROUNDS[surveyScores.typeName] || "bg_type_01"}",
    "overlay_id": "${ELEMENT_OVERLAYS[dominantElementName] || "overlay_water"}"
  }
}`;

  const data = await generateWithRetry(model, systemPrompt, "Generate Page 1 Identity JSON.");

  // Enforce Determinism — English only (non-English lets Gemini translate naturally)
  if (archetype && language === 'en') {
    data.title = archetype.identityTitle;
    data.nature_snapshot.definition = archetype.natureMetaphor;
  }

  return data;
}

// ==========================================
// PAGE 2: Hardware (Deep Nature Analysis)
// ==========================================
async function generatePage2(sajuResult: SajuResult, identityTitle: string, userName: string, archetype?: ContentArchetype, langInstruction?: string, language: string = "en") {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const dayMasterGan = sajuResult.fourPillars.day.gan;
  const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];
  const dayMasterElement = ELEMENT_MAP[dayMasterGan] || "wood";
  const elementInfo = FIVE_ELEMENTS_INFO[dayMasterElement as keyof typeof FIVE_ELEMENTS_INFO];

  const archetypeRef = archetype && language !== 'en' ? `
REFERENCE CONTENT (English original — rewrite naturally in target language, preserving meaning):
- Nature Description: "${archetype.natureDescription}"
- Shadow Description: "${archetype.shadowDescription}"
` : '';

  const systemPrompt = `You are a "Life Diagnostician" creating Page 2: The Behavioral Blueprint.

USER DATA:
- Identity Title: ${identityTitle}
- Day Master: ${dayMasterInfo.name} (${dayMasterInfo.archetype})
- Core Element: ${dayMasterElement}
- Core Strength: ${dayMasterInfo.strength}
- Core Weakness: ${dayMasterInfo.weakness}
- Element Nature: ${elementInfo?.keyword || "Balanced energy"}
- Element Excess Tendency: ${elementInfo?.excess || "Adaptability"}
${archetypeRef}

TONE RULES:
1. ${langInstruction || 'LANGUAGE: Direct, diagnostic English (B1-B2 level).'}
2. BEHAVIORAL EVIDENCE over metaphor: 1 metaphor sentence max, then 3 concrete behavioral examples.
3. SHADOW = NAMED ANTI-PATTERN: Give the destructive pattern a name. "The Productive Burnout Loop", "The Over-Prepare Trap", "The Control Spiral".
4. Focus on PERSONALITY and BEHAVIOR from Day Master archetype — NOT element counts or numbers.
5. NO hedging: "might", "probably", "perhaps" BANNED. Use "You do X. You are Y."
6. Shadow section opens with: "Here's the part most reports won't tell you." Then hits hard with the anti-pattern.
7. Shadow section ends with structural reframing: connect the shadow back to the core strength being misdirected.
8. Do NOT mention element counts, element distribution numbers, or Five Elements theory. This page is about behavioral patterns, not elemental analysis.

CONTENT REQUIREMENTS:
- nature_description: 1 metaphor sentence + 3 behavioral evidence sentences. Each = "You [specific action]. [Why — from personality archetype]."
- shadow_description: Open with "Here's the part most reports won't tell you." → Name the anti-pattern → Explain the loop mechanism → End with reframe.
- core_insights: Each = a specific behavioral marker. NOT abstract. "You check your phone within 3 minutes of waking — not for news, but to confirm you didn't miss something." Keep it about daily behaviors, not element theory.

OUTPUT (JSON Only):
{
  "section_name": "Your Natural Blueprint",
  "nature_title": "A diagnostic title — what their system actually does (8-12 words). Not poetic. E.g. 'The Engine That Never Idles' or 'Built for Intensity, Starved for Rest'",
  "core_drive": "ONE SHARP SENTENCE: 'You flourish when... but rot when...'. (20-30 words)",
  "nature_description": "First sentence: one nature metaphor as a hook. Next 3 sentences: concrete behavioral evidence from their personality archetype. E.g. 'You're steady until you're not. In practice: you [behavior 1]. You [behavior 2]. You [behavior 3].' Focus on what they DO, not element theory. (80-100 words)",
  "shadow_title": "The anti-pattern NAME — diagnostic, not compassionate. E.g. 'The Productive Burnout Loop' or 'The Control Spiral'",
  "shadow_description": "Start: 'Here's the part most reports won't tell you.' Then: name the pattern, explain the loop mechanism, connect to their core weakness. End with reframe connecting shadow back to strength. (80-100 words)",
  "core_insights": [
    "Behavioral marker 1: A specific daily behavior + why it happens (cite element data). (20-30 words)",
    "Behavioral marker 2: What they do effortlessly + the hidden cost of it. (20-30 words)",
    "Behavioral marker 3: What they crave but won't admit + the element-level reason. (20-30 words)"
  ]
}`;

  const data = await generateWithRetry(model, systemPrompt, "Generate Page 2 Hardware JSON.");

  // Enforce Determinism — English only (non-English lets Gemini rewrite naturally)
  if (archetype && language === 'en') {
    data.nature_title = archetype.identityTitle;
    data.nature_description = archetype.natureDescription;
    data.shadow_description = archetype.shadowDescription;
  }

  return data;
}

// ==========================================
// PAGE 3: Operating System (Neuroscience)
// ==========================================
async function generatePage3(surveyScores: SurveyScores, userName: string, langInstruction?: string) {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // No sajuResult passed here in original signature, but we need OpAnalysis
  // We can assume surveyScores actually contains the analysis if we refactored, 
  // but for now let's rely on standard structure.
  // Actually, Page 3 currently only takes surveyScores. 
  // We need to pass Operating Analysis to generatePage3 if we want to use it.
  // However, changing function signature requires changing the caller in generateLifeBlueprintReport.

  const systemPrompt = `You are a "Life Diagnostician" creating Page 3: The Operating System Diagnosis.

USER DATA:
- Threat Response: ${surveyScores.threatClarity === 1 ? 'HIGH SENSITIVITY' : 'LOW SENSITIVITY'} (Score: ${surveyScores.threatScore}/3)
- Environment Processing: ${surveyScores.environmentStable === 1 ? 'STABLE' : 'VOLATILE'} (Score: ${surveyScores.environmentScore}/2)
- Agency/Drive: ${surveyScores.agencyActive === 1 ? 'HIGH DRIVE' : 'PASSIVE'} (Score: ${surveyScores.agencyScore}/3)
- OS Pattern Type: ${surveyScores.typeName} (INTERNAL REFERENCE ONLY — do NOT include this English name in the output. Describe the behavioral pattern instead.)

TONE RULES:
1. ${langInstruction || 'LANGUAGE: Direct, diagnostic English (B1-B2 level). No hedging.'}
2. NEUROSCIENCE TERMS: Use them but ALWAYS explain simply.
   - Amygdala = "your brain's alarm system"
   - Prefrontal Cortex = "your brain's CEO / decision-making center"
   - Dopamine = "your motivation fuel / reward chemical"
3. SCORE DECLARATION first, then 3 SPECIFIC BEHAVIORS, then MECHANISM + ENERGY COST.
4. NO "might", "probably", "perhaps". State facts: "You do X."
5. os_summary must show CASCADE EFFECTS: how System A worsens System B, and B drains C.

CONTENT REQUIREMENTS:
- Each axis: Score declaration → 3 concrete daily behaviors → brain mechanism → energy cost percentage.
- os_summary: CASCADE format — "Your [System A] exhausts [System B], which leaves [System C] running on fumes."

OUTPUT (JSON Only):
{
  "section_name": "Your Operating System",
  "os_title": "A diagnostic title for their brain's current state (8-12 words). E.g. 'An Alarm System Running 24/7 With No Off Switch'",
  "os_anchor": "ONE SHARP SENTENCE system diagnosis. E.g., 'System Overheated: High Drive entangled with Low Maintenance.' (15-20 words)",
  "threat_axis": {
    "title": "Your Alarm System",
    "level": "${surveyScores.threatClarity === 1 ? 'Highly Tuned' : 'Relaxed'} (${surveyScores.threatScore}/3)",
    "description": "Start with score: 'Threat sensitivity: ${surveyScores.threatScore}/3.' Then 3 concrete signs: 'You [behavior 1]. You [behavior 2]. You [behavior 3].' Then mechanism: 'This isn't anxiety — it's [brain explanation].' End with cost: 'This burns X% of your energy on [what].' (70-90 words)"
  },
  "environment_axis": {
    "title": "Your Processing Power",
    "level": "${surveyScores.environmentStable === 1 ? 'Steady' : 'Fluctuating'} (${surveyScores.environmentScore}/2)",
    "description": "Start with score. Then 3 concrete signs of how they process environments. Then mechanism (sensory processing / cognitive load). End with energy cost. (70-90 words)"
  },
  "agency_axis": {
    "title": "Your Drive Engine",
    "level": "${surveyScores.agencyActive === 1 ? 'High Output' : 'Conservation Mode'} (${surveyScores.agencyScore}/3)",
    "description": "Start with score. Then 3 concrete signs of their drive pattern. Reference dopamine and prefrontal cortex. ${surveyScores.agencyActive === 1 ? 'Show how high drive burns resources and leads to specific crash patterns.' : 'Show how conservation mode creates specific stagnation patterns and decision avoidance.'} End with energy cost. (70-90 words)"
  },
  "os_summary": "4-5 sentences showing CASCADE EFFECTS between the three systems. Format: 'Your alarm system does X, which forces your processing into Y, which leaves your drive running on Z. The result: [specific daily consequence].' This is a system-level diagnosis showing how the parts interact. End with what this pattern costs them daily. Do NOT include English type names in the output — describe the pattern in plain language."
}`;

  return generateWithRetry(model, systemPrompt, "Generate Page 3 OS JSON.");
}

// ==========================================
// PAGE 4: Friction Map (Life Application)
// ==========================================
async function generatePage4(sajuResult: SajuResult, page2: any, page3: any, userName: string, langInstruction?: string) {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const systemPrompt = `You are a "Life Diagnostician" creating Page 4: The Friction Map.

CONTEXT FROM PREVIOUS PAGES:
- Natural Blueprint: ${page2.nature_description}
- Shadow / Anti-Pattern: ${page2.shadow_description}
- Operating System Diagnosis: ${page3.os_summary}

TONE RULES:
1. ${langInstruction || 'LANGUAGE: Direct, diagnostic English (B1-B2 level). No hedging.'}
2. FRICTION TITLES ARE DIAGNOSES — not category labels.
   - NOT "At Work" → "The 9-to-5 Will Crush You" or "You Need Ownership, Not a Boss"
   - NOT "In Relationships" → "High Standards, Empty Inbox" or "You Push Away What You Want Most"
   - NOT "With Money" → "You Earn Big but Keep Nothing" or "Impulse Disguised as Instinct"
3. PATTERN FORMAT: "Your pattern: [Step 1] → [Step 2] → [Step 3]." Declare the behavioral loop.
4. BASE EVERYTHING on personality blueprint and OS diagnosis from previous pages. Do NOT mention Five Elements, element counts, or element theory.
5. COST STATEMENT per friction: End each description with what this pattern costs them.
6. quick_tip must pass MONDAY TEST: "Can they do this on Monday morning?"
   - BAD: "Try journaling about it." / "Consider being more open."
   - GOOD: "Rule: Ship at 70%. Do this Monday: Send one email without re-reading it."
   - GOOD: "Automate 20% to a locked savings account."
7. NO "might", "probably", "perhaps", "Try...". Use "You do X. Rule: Do Y."
8. Do NOT include square brackets in the output. Write actual content, not templates.

OUTPUT (JSON Only):
{
  "section_name": "Where You Get Stuck",
  "friction_title": "A diagnostic title for their core friction — the pattern itself, not a category (8-15 words)",
  "friction_anchor": "ONE SHARP SENTENCE defining their core destructive loop. (15-25 words)",
  "career_friction": {
    "title": "DIAGNOSTIC VERDICT — not 'At Work'. What their career friction actually is. (5-10 words)",
    "description": "Behavioral pattern loop → root cause from personality/OS → cost. (70-90 words)",
    "quick_tip": "Rule with a number + Monday test action. (30-50 words)"
  },
  "relationship_friction": {
    "title": "DIAGNOSTIC VERDICT — not 'In Relationships'. (5-10 words)",
    "description": "Pattern declaration → root cause → cost statement. (70-90 words)",
    "quick_tip": "Concrete action with a number + Monday test. (30-50 words)"
  },
  "money_friction": {
    "title": "DIAGNOSTIC VERDICT — not 'With Money'. (5-10 words)",
    "description": "Behavioral pattern → root cause → cost. (70-90 words)",
    "quick_tip": "DO + DON'T with numbers. (30-50 words)"
  }
}`;

  return generateWithRetry(model, systemPrompt, "Generate Page 4 Friction JSON.");
}

// ==========================================
// PAGE 5: Action Protocol (Science-Backed)
// ==========================================
async function generatePage5(sajuResult: SajuResult, page3: any, page4: any, surveyScores: SurveyScores, userName: string, langInstruction?: string) {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const elementCounts = sajuResult.elementCounts;
  const missingElements = Object.entries(elementCounts)
    .filter(([, count]) => (count as number) === 0)
    .map(([el]) => el);
  const weakElements = Object.entries(elementCounts)
    .filter(([, count]) => (count as number) === 1)
    .map(([el]) => el);
  const dominantEl = Object.entries(elementCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
  const elementNeeded = missingElements.length > 0 ? missingElements[0] : (weakElements.length > 0 ? weakElements[0] : dominantEl);

  const elementTips: Record<string, string[]> = {
    wood: ["morning walks in nature", "green plants in workspace", "stretching exercises"],
    fire: ["bright lighting", "social activities", "passion projects"],
    earth: ["grounding routines", "stable meal times", "earthy colors in environment"],
    metal: ["decluttering spaces", "precision activities", "white/metallic aesthetics"],
    water: ["staying hydrated", "flowing movements like swimming", "blue/black color accents"],
  };

  const opAnalysis = (sajuResult as any).operatingAnalysis;
  const levelInfo = opAnalysis
    ? `Level ${opAnalysis.level} (${opAnalysis.levelName})`
    : 'Unknown Level';
  const guidance = opAnalysis
    ? opAnalysis.guidance.join('. ')
    : 'Maintain balance.';

  // Protocol Standardization Logic
  const protocolStrategy = OS_TYPE_PROTOCOLS[surveyScores.typeName] || {
    name: "The Balance Protocol",
    focus: "Restoring equilibrium to the system.",
    keyRitual: "Mindful Breathing"
  };

  const alignmentType = opAnalysis?._internal?.alignmentType || 'unknown';
  const levelNum = opAnalysis?.level || 1;
  const levelName = opAnalysis?.levelName || 'Survival';
  const isMaxLevel = levelNum >= 5;
  const nextLevelNum = isMaxLevel ? 5 : levelNum + 1;
  const nextLevelNames: Record<number, string> = { 1: 'Survival', 2: 'Recovery', 3: 'Stable', 4: 'Aligned', 5: 'Flow' };
  const nextLevelName = nextLevelNames[nextLevelNum] || 'Flow';

  const elementSummary = Object.entries(elementCounts)
    .map(([el, count]) => `${el}: ${count}`)
    .join(', ');
  const excessElements = Object.entries(elementCounts)
    .filter(([, count]) => (count as number) >= 3)
    .map(([el, count]) => `${el}(${count})`);

  const elementPrescription: Record<string, { colors: string; activities: string; avoid: string }> = {
    wood: { colors: "Green, teal, olive — wear as daily anchors", activities: "Morning walks in nature, gardening, hiking, stretching", avoid: "Concrete-only environments, prolonged sitting, isolation from natural light" },
    fire: { colors: "Red, orange, warm tones — add energy through clothing or accessories", activities: "Social activities, dancing, passion projects, competitive sports", avoid: "Cold isolated environments, monotonous routines, prolonged alone time" },
    earth: { colors: "Brown, beige, terracotta, mustard — grounding tones", activities: "Cooking, pottery, stable routines, grounding exercises", avoid: "Constant travel, unstable schedules, skipping meals" },
    metal: { colors: "White, silver, gray, metallic — clean sharp tones", activities: "Decluttering, precision activities, martial arts, organizing", avoid: "Chaotic environments, hoarding, lack of structure" },
    water: { colors: "Black, navy, dark blue — wear these as daily anchors, not occasionally", activities: "Swimming, surfing, or any water-adjacent activity. Literal water contact", avoid: "Desert climates, overheated rooms, too much caffeine, too many deadlines simultaneously" },
  };

  const prescription = elementPrescription[elementNeeded] || elementPrescription[dominantEl] || elementPrescription.water;

  const levelTransitionContext = isMaxLevel
    ? `- Current State: Level ${levelNum} (${levelName}) — MAXIMUM LEVEL, Alignment: ${alignmentType}
- Goal: Not "next level" — this is about DEEPENING and SUSTAINING Flow state. The risk at Level 5 is complacency or regression.`
    : `- Current State: Level ${levelNum} (${levelName}), Alignment: ${alignmentType}
- Next State: Level ${nextLevelNum} (${nextLevelName})`;

  const transformationGoalInstruction = isMaxLevel
    ? `transformation_goal = DEEPENING statement, NOT "next level". "You reached Level 5 — Flow. The challenge now isn't climbing higher. It's staying here. ${alignmentType !== 'aligned' ? `Your alignment is ${alignmentType} — that's the gap to close.` : 'Your alignment is solid — maintain it.'} Here's what that requires: [specific behavioral discipline]."`
    : `transformation_goal = LEVEL TRANSITION statement, NOT a vision. "You are at Level ${levelNum} (${levelName}), ${alignmentType}. Next: ${nextLevelName}. That means: [specific behavioral shift required]."`;

  const systemPrompt = `You are a "Life Diagnostician" creating Page 5: The Action Protocol.

CONTEXT:
- Operating System Diagnosis: ${page3.os_summary}
- Core Friction Pattern: ${page4.friction_title}
${levelTransitionContext}
- Recommended Guidance: ${guidance}
- Element Distribution: ${elementSummary}
- Missing/Weak Element: ${elementNeeded}
${missingElements.length > 0 ? `- Missing Elements (= 0): ${missingElements.join(', ')}` : ''}
${excessElements.length > 0 ? `- Excess Elements (≥ 3): ${excessElements.join(', ')}` : ''}

STANDARDIZED PROTOCOL STRATEGY:
- PROTOCOL NAME (English reference): "${protocolStrategy.name}"
- CORE FOCUS: "${protocolStrategy.focus}"
- KEY RITUAL (English reference): "${protocolStrategy.keyRitual}" (Must be included as one of the rituals)
NOTE: If writing in a non-English language, translate the protocol name and ritual names naturally. Do NOT keep them in English.

ELEMENT PRESCRIPTION DATA:
- Colors to wear: ${prescription.colors}
- Activities: ${prescription.activities}
- Avoid: ${prescription.avoid}

TONE RULES:
1. ${langInstruction || 'LANGUAGE: Direct, diagnostic English (B1-B2 level). No hedging.'}
2. ${transformationGoalInstruction}
3. RITUAL NAMES = SPECIFIC ACTION NAMES. Not "Morning Grounding" → "The 5-Minute Threat Audit" or "The 70% Rule".
4. Each ritual MUST have an anti_pattern: a concrete consequence of skipping.
5. CONCRETE NUMBERS in every instruction: "3 items", "5 minutes", "70%", "7 days". NEVER "soon", "regularly", "sometimes".
6. MONDAY TEST: Every instruction must be doable THIS Monday morning.
7. environment_boost tips: Make them EXTREMELY specific. Not "spend time near water" → "Cold shower for last 30 seconds every morning" or "Wear black/navy as your default, not occasionally."
8. closing_message: Direct and honest. NOT warm or empowering. 4-5 sentences about their system being miscalibrated (not broken), and that starting one protocol for 7 days is the test.
9. IMPORTANT — OUTPUT FORMATTING:
   - Do NOT include square brackets like [pattern] or [consequence] in the output. Write the actual content.
   - Do NOT include English words in parentheses when writing in another language (except neuroscience terms).
   - All field values must be COMPLETE sentences, not templates or fill-in-the-blanks.

OUTPUT (JSON Only):
{
  "section_name": "Your Action Protocol",
  "transformation_goal": "${isMaxLevel ? 'Deepening statement — what maintaining Level 5 requires. (25-40 words)' : `Level transition: current state → next state → what must change. (25-40 words)`}",
  "protocol_name": "The protocol name${langInstruction && langInstruction.includes('Write ALL content') ? ' — translated naturally into the target language' : ''}",
  "protocol_anchor": "ONE SHARP ACTION COMMAND. 5-10 words.",
  "daily_rituals": [
    {
      "name": "Translated name of key ritual: ${protocolStrategy.keyRitual}",
      "description": "Step-by-step with numbers + why it works using simple neuroscience. (60-80 words)",
      "when": "Exact timing — not 'morning' but 'Before first screen. Non-negotiable.'",
      "anti_pattern": "Concrete consequence of skipping — no brackets, no templates. (15-25 words)"
    },
    {
      "name": "Specific action name (not generic)",
      "description": "Step-by-step with numbers + brain science + connection to friction. (60-80 words)",
      "when": "Exact timing with constraint",
      "anti_pattern": "Concrete consequence of skipping. (15-25 words)"
    },
    {
      "name": "Specific action name",
      "description": "Step-by-step with numbers + brain science. (60-80 words)",
      "when": "Exact timing with constraint",
      "anti_pattern": "Concrete consequence of skipping. (15-25 words)"
    }
  ],
  "environment_boost": {
    "element_needed": "${elementNeeded}",
    "tips": [
      "COLORS: ${prescription.colors}. Not a suggestion — make it your default. (15-25 words)",
      "ACTIVITY: ${prescription.activities}. Needed because ${elementNeeded} is at ${elementCounts[elementNeeded as keyof typeof elementCounts] || 0}. (15-25 words)",
      "AVOID: ${prescription.avoid}. Amplifies excess ${excessElements.length > 0 ? excessElements[0] : 'energy'}. (15-25 words)",
      "MICRO-ACTION: One specific daily action to compensate for missing ${elementNeeded}. Include a number. (15-25 words)",
      "ENVIRONMENT: Literal environmental change based on ${elementNeeded} deficiency. (15-25 words)"
    ]
  },
  "closing_message": "4-5 sentences. Direct, honest, NOT warm. Say their system is miscalibrated not broken. Tell them to start with one protocol for 7 days then decide. Do NOT use bracket notation or template fill-ins — write actual sentences."
}`;

  return generateWithRetry(model, systemPrompt, "Generate Page 5 Solution JSON.");
}

function parseJSON(text: string): any {
  // Strip markdown fences
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  // Strip BOM and zero-width characters
  cleaned = cleaned.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');
  // Strip control characters except normal whitespace (tab, newline, carriage return)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Extract JSON object if surrounded by non-JSON text
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart > 0 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error (first 300):", cleaned.slice(0, 300));
    console.error("JSON tail (last 200):", cleaned.slice(-200));
    console.error("JSON total length:", cleaned.length);
    console.error("JSON Parse Error detail:", e instanceof Error ? e.message : String(e));

    // Attempt to repair truncated JSON by closing open braces/brackets
    try {
      let repaired = cleaned;
      const quotes = (repaired.match(/"/g) || []).length;
      if (quotes % 2 !== 0) repaired += '"';
      const openBraces = (repaired.match(/{/g) || []).length;
      const closeBraces = (repaired.match(/}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/]/g) || []).length;
      repaired = repaired.replace(/,\s*$/, '');
      for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
      for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';
      const result = JSON.parse(repaired);
      console.log("[JSON Repair] Successfully repaired truncated JSON");
      return result;
    } catch (repairErr) {
      throw new Error("JSON_PARSE_ERROR: Failed to parse Gemini response");
    }
  }
}

/**
 * Wrapper for Gemini generateContent with retry + JSON parsing
 * Retries on: rate limits, timeouts, server errors
 * JSON_PARSE_ERROR is NOT retried — same prompt produces same format, retrying wastes time
 */
async function generateWithRetry(
  model: ReturnType<NonNullable<typeof client>["getGenerativeModel"]>,
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 3
): Promise<any> {
  return withRetry(
    async () => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: systemPrompt,
      });
      return parseJSON(result.response.text());
    },
    {
      maxRetries,
      retryableErrors: ['RATE_LIMIT', 'RESOURCE_EXHAUSTED', 'UNAVAILABLE', 'DEADLINE_EXCEEDED', 'INTERNAL', 'timeout', '429', '500', '503']
    }
  );
}

// ==========================================
// V3 PROMPTS: Plain Language + Behavior-First
// ==========================================

const WRITING_STYLE_RULES = `
WRITING STYLE:
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
- GOOD: "Your amygdala (the brain's alarm system) runs hot."
- BAD: "Your amygdala triggers cortisol which activates sympathetic response..."

PUNCTUATION:
- Periods. Short sentences hit harder.
- Colons for diagnosis.
- Question marks for questions that sting.

FIX EM-DASH PATTERNS:
❌ "You're fast — but your clarity needs time."
✅ "You're fast. But your clarity needs time."
`;

async function generatePage1_v3(
  sajuResult: SajuResult,
  surveyScores: SurveyScores,
  behaviors: BehaviorPatterns,
  userName: string,
  archetype?: ContentArchetype,
  langInstruction?: string,
  language: string = "en"
) {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const dayMasterGan = sajuResult.fourPillars.day.gan;
  const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];
  const dominantElement = Object.entries(sajuResult.elementCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0];
  const dominantElementName = dominantElement[0];

  const opAnalysis = (sajuResult as any).operatingAnalysis;
  const levelNum = opAnalysis?.level || 1;
  const levelName = opAnalysis?.levelName || 'Survival';

  const systemPrompt = `You are writing a personal insight report for ${userName}.

${WRITING_STYLE_RULES}

${langInstruction || 'Write in English.'}

USER'S BEHAVIORAL PATTERNS:

DECISION STYLE:
${behaviors.decisionStyle}

ENERGY PATTERN:
${behaviors.energyPattern}

NATURAL STRENGTHS:
${behaviors.strengths.slice(0, 3).join('\n')}

VULNERABLE SPOTS:
${behaviors.vulnerabilities.slice(0, 2).join('\n')}

WARNING SIGNAL:
${behaviors.warningSignal}

AGE CONTEXT:
${behaviors.ageContext}

DESIGN VS PERCEPTION GAPS:
${behaviors.designVsPerception.join('\n\n') || 'No major gaps detected.'}

${archetype ? `REFERENCE TITLE (adapt naturally): "${archetype.identityTitle}"` : ''}

---

OUTPUT (JSON):
{
  "title": "A nature metaphor (5-8 words). Mountains, oceans, storms, seasons. Not people.",
  "sub_headline": "One sentence describing their core behavioral pattern. What they DO, not what they are. (15-20 words)",
  "one_line_diagnosis": "Connect a visible behavior to its hidden driver. 'You [do X] because [root reason].' (15-25 words)",
  "nature_snapshot": {
    "title": "Your Core Pattern",
    "definition": "One nature metaphor sentence (10-15 words)",
    "explanation": "What this means in daily behavior. Be specific. Reference their age. (30-45 words)"
  },
  "brain_snapshot": {
    "title": "Your Current State",
    "definition": "Direct statement about where they are now (10-15 words)",
    "explanation": "What is working and what is costing them energy. Specific situations. (30-45 words)"
  },
  "efficiency_snapshot": {
    "score": "${sajuResult.stats.operatingRate.toFixed(0)}%",
    "label": "Level ${levelNum}: ${levelName}",
    "metaphor": "What this level means in practice. Not abstract. 'Your system runs but [specific cost].' (20-30 words)"
  },
  "visual_concept": {
    "background_id": "${OS_TYPE_BACKGROUNDS[surveyScores.typeName] || "bg_type_01"}",
    "overlay_id": "${ELEMENT_OVERLAYS[dominantElementName] || "overlay_water"}"
  }
}`;

  const data = await generateWithRetry(model, systemPrompt, "Generate Page 1.");

  if (archetype && language === 'en') {
    data.title = archetype.identityTitle;
  }

  return data;
}

async function generatePage2_v3(
  sajuResult: SajuResult,
  behaviors: BehaviorPatterns,
  identityTitle: string,
  userName: string,
  archetype?: ContentArchetype,
  langInstruction?: string,
  language: string = "en"
) {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const dayMasterGan = sajuResult.fourPillars.day.gan;
  const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];

  const systemPrompt = `You are writing Page 2: Natural Blueprint for ${userName}.

${WRITING_STYLE_RULES}

${langInstruction || 'Write in English.'}

THEIR IDENTITY: ${identityTitle}

NATURAL STRENGTHS (use as raw material, rewrite in your voice):
${behaviors.strengths.join('\n')}

VULNERABLE SPOTS:
${behaviors.vulnerabilities.join('\n')}

ENERGY PATTERN:
${behaviors.energyPattern}

AGE CONTEXT:
${behaviors.ageContext}

CORE PERSONALITY TRAITS (from birth pattern):
- Archetype: ${dayMasterInfo.archetype}
- Natural strength: ${dayMasterInfo.strength}
- Natural weakness: ${dayMasterInfo.weakness}

---

OUTPUT (JSON):
{
  "section_name": "Your Natural Blueprint",
  "nature_title": "A punchy diagnostic title (8-12 words). What their system actually does.",
  "core_drive": "ONE sentence: 'You thrive when... You suffer when...' (20-30 words)",
  "nature_description": "Start with one metaphor sentence as hook. Then 3-4 sentences of concrete behavioral evidence. What they actually DO in real situations. Reference specific scenarios like 'In meetings...' or 'When plans change...' (80-100 words)",
  "shadow_title": "Name their anti-pattern. A memorable phrase. 'The [Noun] Trap' or 'The [Adjective] Loop'",
  "shadow_description": "Start: 'Here is the uncomfortable part.' Then: Name the pattern. Explain the loop. Connect to their strength (same source, different expression). End with reframe. (80-100 words)",
  "core_insights": [
    "Behavioral marker 1: Something specific they do + why. (25-35 words)",
    "Behavioral marker 2: What they do effortlessly + the hidden cost. (25-35 words)",
    "Behavioral marker 3: What they crave but avoid admitting + why. (25-35 words)"
  ]
}`;

  const data = await generateWithRetry(model, systemPrompt, "Generate Page 2.");

  if (archetype && language === 'en') {
    data.nature_title = archetype.identityTitle;
  }

  return data;
}

async function generatePage3_v3(
  surveyScores: SurveyScores,
  behaviors: BehaviorPatterns,
  userName: string,
  langInstruction?: string
) {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const systemPrompt = `You are writing Page 3: How You Operate for ${userName}.

${WRITING_STYLE_RULES}

${langInstruction || 'Write in English.'}

Use analogies to everyday things (phone battery, car engine, smoke detector).
Translate brain concepts to plain behavior.

THEIR PATTERNS:

PRESSURE RESPONSE:
${surveyScores.threatClarity === 1
    ? "They become hyper-alert under pressure. Notice everything. Tone shifts, micro-expressions, what was not said. This is useful but exhausting."
    : "They tend to shut down under pressure. The system goes into conservation mode. Useful for not overreacting, but can miss real signals."}

CHANGE PROCESSING:
${surveyScores.environmentStable === 1
    ? "They prefer predictability. New situations and chaos drain them faster than most people."
    : "They are used to instability. Might even create drama when things get too calm."}

ACTION PATTERN:
${surveyScores.agencyActive === 1
    ? "High initiative. They believe they can shape their reality. Risk: overcommitting, burnout."
    : "They tend to wait and see. Adaptable, but risk of passivity and missed opportunities."}

DECISION STYLE:
${behaviors.decisionStyle}

DECISION WARNING:
${behaviors.decisionWarning}

AGE CONTEXT:
${behaviors.ageContext}

DESIGN VS PERCEPTION:
${behaviors.designVsPerception[0] || 'No major gaps.'}

---

IMPORTANT: Do NOT include numeric scores like "(2/3)" or "(0/2)" in the output. Use descriptive labels only.

OUTPUT (JSON):
{
  "section_name": "How You Operate",
  "os_title": "A diagnostic title for their internal system (8-12 words)",
  "os_anchor": "ONE sentence system diagnosis. Direct. (15-20 words)",
  "threat_axis": {
    "title": "Your Alarm System",
    "level": "${surveyScores.threatClarity === 1 ? 'High Alert' : 'Low Alert'}",
    "description": "How their internal alarm works. Use concrete examples: 'You walk into a room and...' 'Before a meeting, you...' End with what this costs them daily. (70-90 words)"
  },
  "environment_axis": {
    "title": "Your Battery",
    "level": "${surveyScores.environmentStable === 1 ? 'Needs Stability' : 'Chaos Tolerant'}",
    "description": "What drains them vs energizes them. Specific situations. (70-90 words)"
  },
  "agency_axis": {
    "title": "Your Accelerator",
    "level": "${surveyScores.agencyActive === 1 ? 'Heavy Foot' : 'Light Touch'}",
    "description": "How they take action (or avoid it). The gap between wanting to act and actually acting. Include their decision style. (70-90 words)"
  },
  "os_summary": "How these three systems interact. 'Your alarm system [does X], which [affects Y], leaving [Z result].' End with daily cost. Include one insight from Design vs Perception gap. (60-80 words)"
}`;

  return generateWithRetry(model, systemPrompt, "Generate Page 3.");
}

async function generatePage4_v3(
  sajuResult: SajuResult,
  behaviors: BehaviorPatterns,
  page2: any,
  page3: any,
  userName: string,
  langInstruction?: string
) {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const systemPrompt = `You are writing Page 4: Where You Get Stuck for ${userName}.

${WRITING_STYLE_RULES}

${langInstruction || 'Write in English.'}

CONTEXT FROM PREVIOUS PAGES:
- Blueprint: ${page2.nature_description}
- Shadow Pattern: ${page2.shadow_description}
- Operating System: ${page3.os_summary}

THEIR PATTERNS:
${behaviors.vulnerabilities.join('\n')}

WARNING SIGNAL:
${behaviors.warningSignal}

AGE CONTEXT:
${behaviors.ageContext}

DESIGN VS PERCEPTION:
${behaviors.designVsPerception.join('\n\n')}

---

FRICTION TITLES must be diagnoses, not categories:
❌ "At Work" → ✅ "You Need Ownership, Not a Boss"
❌ "In Relationships" → ✅ "You Push Away What You Want Most"
❌ "With Money" → ✅ "You Earn Big but Keep Nothing"

QUICK TIPS must pass Monday Morning Test:
❌ "Try journaling about it"
✅ "Before any meeting: write 3 words for what you actually want to say. Not sentences. Words."

OUTPUT (JSON):
{
  "section_name": "Where You Get Stuck",
  "friction_title": "Their core friction pattern as a memorable phrase (8-15 words)",
  "friction_anchor": "ONE sentence defining the loop. (15-25 words)",
  "career_friction": {
    "title": "DIAGNOSTIC VERDICT (5-10 words)",
    "description": "Pattern declaration with concrete scenario. Root cause. What this costs them. (70-90 words)",
    "quick_tip": "Rule with a number. Can do this Monday. (30-50 words)"
  },
  "relationship_friction": {
    "title": "DIAGNOSTIC VERDICT (5-10 words)",
    "description": "Pattern + scenario + root cause + cost. (70-90 words)",
    "quick_tip": "Concrete action with number + Monday test. (30-50 words)"
  },
  "money_friction": {
    "title": "DIAGNOSTIC VERDICT (5-10 words)",
    "description": "Pattern + scenario + root cause + cost. (70-90 words)",
    "quick_tip": "DO + DON'T with numbers. (30-50 words)"
  }
}`;

  return generateWithRetry(model, systemPrompt, "Generate Page 4.");
}

async function generatePage5_v3(
  sajuResult: SajuResult,
  behaviors: BehaviorPatterns,
  page3: any,
  page4: any,
  surveyScores: SurveyScores,
  userName: string,
  langInstruction?: string
) {
  const model = client!.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const elementCounts = sajuResult.elementCounts;
  const missingElements = Object.entries(elementCounts)
    .filter(([, count]) => (count as number) === 0)
    .map(([el]) => el);
  const weakElements = Object.entries(elementCounts)
    .filter(([, count]) => (count as number) === 1)
    .map(([el]) => el);
  const dominantEl = Object.entries(elementCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
  const elementNeeded = missingElements.length > 0 ? missingElements[0] : (weakElements.length > 0 ? weakElements[0] : dominantEl);

  const opAnalysis = (sajuResult as any).operatingAnalysis;
  const levelNum = opAnalysis?.level || 1;
  const levelName = opAnalysis?.levelName || 'Survival';

  const elementTips: Record<string, string> = {
    wood: "Morning walks in nature. Green in your workspace. Stretching before decisions.",
    fire: "Brighter lighting. Social energy. Something competitive or exciting each week.",
    earth: "Regular meals at same times. Grounding routines. Earthy colors in your space.",
    metal: "Declutter one area per week. Precision activities. Clean lines in environment.",
    water: "Stay near actual water when possible. Hydrate before big conversations. Dark blue or black as default colors.",
  };

  const systemPrompt = `You are writing Page 5: Action Protocol for ${userName}.

${WRITING_STYLE_RULES}

${langInstruction || 'Write in English.'}

CONTEXT:
- OS Diagnosis: ${page3.os_summary}
- Friction Pattern: ${page4.friction_title}
- Current Level: ${levelNum} (${levelName})

THEIR PATTERNS:

DECISION STYLE:
${behaviors.decisionStyle}

DECISION WARNING:
${behaviors.decisionWarning}

VULNERABILITIES:
${behaviors.vulnerabilities.slice(0, 2).join('\n')}

WARNING SIGNAL:
${behaviors.warningSignal}

OPTIMAL ENVIRONMENT:
${behaviors.optimalEnvironment}

AGE CONTEXT:
${behaviors.ageContext}

ELEMENT LIFESTYLE TIPS:
${elementTips[elementNeeded] || elementTips[dominantEl] || elementTips.water}

---

RITUAL NAMES must be specific actions, not generic:
❌ "Morning Routine" → ✅ "The 3-Word Clarity Check"
❌ "Breathwork" → ✅ "The 4-7-8 Reset"

Every instruction needs a NUMBER:
❌ "Take some time" → ✅ "Take 5 minutes"
❌ "Regularly check in" → ✅ "Check in at 3pm daily"

OUTPUT (JSON):
{
  "section_name": "Your Action Protocol",
  "transformation_goal": "Where they are now → specific shift needed. Reference age. (35-50 words)",
  "protocol_name": "A memorable 3-5 word protocol name",
  "protocol_anchor": "ONE action command. 5-10 words.",
  "daily_rituals": [
    {
      "name": "Specific action name (not generic)",
      "description": "Step by step with numbers. Include ONE brain term with explanation. (60-80 words)",
      "when": "Exact timing with constraint. 'Before your first screen. Non-negotiable.'",
      "anti_pattern": "What happens if they skip. Specific consequence. (20-30 words)"
    },
    {
      "name": "Second ritual name",
      "description": "Step by step with numbers. Connect to their specific friction. (60-80 words)",
      "when": "Exact timing",
      "anti_pattern": "Specific consequence of skipping. (20-30 words)"
    },
    {
      "name": "Third ritual name",
      "description": "Step by step with numbers. (60-80 words)",
      "when": "Exact timing",
      "anti_pattern": "Specific consequence. (20-30 words)"
    }
  ],
  "environment_boost": {
    "element_needed": "${elementNeeded}",
    "tips": [
      "Specific environmental change 1. Not vague. (15-25 words)",
      "Specific environmental change 2. (15-25 words)",
      "One micro-action with a number. (15-25 words)",
      "What to avoid and why. (15-25 words)"
    ]
  },
  "closing_message": "Direct, not warm. Their system is miscalibrated, not broken. Pick one ritual. 7 days. That is the test. Reference their age. (50-70 words)"
}`;

  return generateWithRetry(model, systemPrompt, "Generate Page 5.");
}

/**
 * Mock Report for Development
 */
function generateMockReport(sajuResult: SajuResult, surveyScores: SurveyScores): LifeBlueprintReport {
  return {
    page1_identity: {
      title: "The Silent Volcano",
      sub_headline: "Beneath the calm surface, transformative power waits to emerge.",
      nature_snapshot: {
        title: "Your Birth Pattern",
        definition: "A snow-capped volcano with molten fire deep within",
        explanation: "You carry immense potential energy beneath a composed exterior. Like a dormant volcano, your power is not always visible but is always present."
      },
      brain_snapshot: {
        title: "Your Current Mind State",
        definition: "A high-performance engine idling in neutral gear",
        explanation: "Your mind has tremendous capacity, but your gears aren't fully engaged. Energy is being generated but not fully channeled into forward motion."
      },
      efficiency_snapshot: {
        score: sajuResult.stats.operatingRate.toFixed(1) + "%",
        label: "Energy Utilization",
        metaphor: "Like a sports car stuck in traffic - the engine purrs with potential, but road conditions aren't letting you reach full speed."
      },
      visual_concept: {
        background_id: OS_TYPE_BACKGROUNDS[surveyScores.typeName] || "bg_type_01",
        overlay_id: "overlay_fire"
      }
    },
    page2_hardware: {
      section_name: "Your Natural Blueprint",
      nature_title: "The Sleeping Giant Beneath the Snow",
      nature_description: "Picture a majestic mountain range at dawn. The peaks are dusted with snow, pristine and calm. But deep beneath this serene surface, magma chambers pulse with ancient fire. This is you - outwardly composed, perhaps even appearing passive to others, but internally housing a powerful core that few truly understand. Your energy moves in cycles, sometimes dormant, sometimes rumbling, always significant.",
      shadow_title: "When the Pressure Builds Without Release",
      shadow_description: "The danger of your nature is accumulation. When emotions, ideas, or frustrations build up without healthy release, the pressure can become unbearable. You might suddenly erupt in ways that surprise both yourself and others, or worse, the pressure turns inward, creating internal stress that slowly drains your vitality.",
      core_insights: [
        "Your core engine runs on the need for meaningful impact - you don't want to just exist, you want to matter.",
        "Your natural strength is patience combined with power - you can wait for the perfect moment to act decisively.",
        "Your hidden need is for someone to truly see the fire within you, to be recognized for your depth."
      ]
    },
    page3_os: {
      section_name: "Your Operating System",
      os_title: "High-Alert Mind with a Cautious Accelerator",
      threat_axis: {
        title: "Your Alarm System",
        level: "Highly Tuned",
        description: "Your amygdala - think of it as your brain's smoke detector - is set to high sensitivity. This means you pick up on subtle threats and changes that others miss. It's like having a security system that alerts you to both real dangers and false alarms. The upside: you're rarely blindsided. The challenge: your system can exhaust itself staying on alert."
      },
      environment_axis: {
        title: "Your Processing Power",
        level: "Fluctuating",
        description: "Your brain's ability to process environmental input varies with conditions. In calm, controlled settings, you shine. But in chaotic environments - open offices, busy social events - your cognitive load spikes. Think of it like a computer with many tabs open: each additional input slows your processing speed."
      },
      agency_axis: {
        title: "Your Drive Engine",
        level: "Conservation Mode",
        description: "Your dopamine system - the chemical that creates motivation and reward anticipation - runs in efficient rather than explosive mode. Your prefrontal cortex, the CEO of your brain, prefers careful analysis over quick action. This means you're great at strategic thinking but might hesitate when swift moves are needed."
      },
      os_summary: "Your operating system is designed for depth rather than speed. Your sensitive alarm system catches what others miss, while your fluctuating processor needs the right environment to work optimally. Combined with a conservative drive engine, you're built for meaningful, well-considered action rather than rapid-fire reactions. The key insight: your system isn't broken - it's designed for a different kind of success than our fast-paced world typically rewards. Understanding this is your first step toward working with your nature instead of against it."
    },
    page4_mismatch: {
      section_name: "Where You Get Stuck",
      friction_title: "The Fire That Hesitates: Passion Trapped Behind Caution",
      career_friction: {
        title: "At Work",
        description: "In meetings, you probably have insights that could change the direction of projects. But your alarm system pipes up: 'What if you're wrong? What if they judge you?' So you stay quiet, and later watch someone else voice a similar idea to applause. Your conservative drive engine keeps you from the leap, even when you're ready. This creates a frustrating pattern of knowing but not doing.",
        quick_tip: "Try the '5-second rule': when you have something to say, count backward from 5 and speak before you hit 1. This interrupts your brain's hesitation circuit and builds a new habit of calculated courage."
      },
      relationship_friction: {
        title: "In Relationships",
        description: "You crave deep connection but your high-alert system keeps scanning for signs of rejection or abandonment. This might show up as testing partners, withdrawing before you can be hurt, or struggling to fully relax into intimacy. Your passion is there - the volcanic fire - but layers of protective snow keep it hidden from those who might warm to it.",
        quick_tip: "Practice 'micro-vulnerability': share one small, honest thing about yourself each day with someone you trust. This gradually trains your alarm system that opening up is safe, building new neural pathways for connection."
      },
      money_friction: {
        title: "With Money",
        description: "Your conservative operating system likely makes you a saver rather than an investor. The volcanic energy could generate wealth, but the cautious exterior prefers the safety of accumulation. You might notice a pattern of preparing financially but rarely making the bold moves that could multiply your resources.",
        quick_tip: "Automate one small 'growth' investment monthly - even $50 into an index fund. This removes the decision from your hesitation circuit and lets compound growth work while your cautious mind rests easy."
      }
    },
    page5_solution: {
      section_name: "Your Action Protocol",
      transformation_goal: "To channel your volcanic power through strategic vents, turning dormant potential into directed, unstoppable momentum.",
      protocol_name: "The Volcanic Release",
      daily_rituals: [
        {
          name: "The Physiological Sigh",
          description: "When your alarm system activates (stress, anxiety, hesitation), do this: two quick inhales through your nose, then one long exhale through your mouth. This is scientifically proven to be the fastest way to calm your nervous system. It works by stimulating your vagus nerve, which tells your brain 'we're safe.' For your high-alert system, this is like having a manual override button.",
          when: "Whenever stress hits, before important conversations, when you feel yourself holding back"
        },
        {
          name: "Morning Sunlight Ritual",
          description: "Within the first hour of waking, get 10-15 minutes of natural sunlight (even on cloudy days). Look toward the sun (not directly at it) or sit near a bright window. This sets your circadian rhythm and triggers a healthy cortisol pulse that gives you natural alertness. For your conservative drive system, this provides the natural energy boost that helps initiate action without the crash of caffeine.",
          when: "Within 60 minutes of waking, ideally combined with a short walk"
        },
        {
          name: "The Pressure Release",
          description: "Twice daily, spend 5 minutes doing intense physical activity - jumping jacks, sprinting in place, or vigorous dancing. This mimics the 'completion' of a stress response that your body craves. Your volcanic nature builds pressure that needs healthy release. This prevents the emotional eruptions or internal burnout that happen when energy has no outlet.",
          when: "Mid-morning and late afternoon, or whenever you feel internal pressure building"
        }
      ],
      environment_boost: {
        element_needed: "water",
        tips: [
          "Keep water visible on your desk - staying hydrated supports clear thinking",
          "Add blue or black accents to your workspace for calming water energy",
          "Take walks near water (lakes, rivers, fountains) to balance your fire"
        ]
      },
      closing_message: "Remember, you are The Silent Volcano - not broken, not too much, not too little. Your nature is rare and powerful. The world needs people who can see deeply, feel strongly, and act decisively when the moment is right. Your journey isn't about changing who you are; it's about learning to work with your magnificent design. Start with one ritual today. Notice the shift. Trust the process. Your eruption, when it comes, will be exactly as powerful as it was meant to be."
    }
  };
}

export async function generateSajuReport(sajuResult: SajuResult, userName: string): Promise<string> {
  return "Legacy Text Report Deprecated. Use PDF.";
}

// ==========================================
// V3 CARDS: Collision-Framed Q&A Cards
// ==========================================

export interface V3CardContent {
  hookQuestion: string;
  mirrorQuestion: string;
  mirrorText: string;
  mirrorAccent: string;
  blueprintQuestion: string;
  blueprintText: string;
  blueprintAccent: string;
  blueprintFacets?: Array<{
    label: string;
    text: string;
  }>;
  decisionQuestion?: string;
  decisionText?: string;
  decisionAccent?: string;
  collisionQuestion: string;
  collisionText: string;
  collisionAccent: string;
  evidenceQuestion: string;
  evidence: string[];
  costCareerQuestion: string;
  costCareer: { title: string; text: string; tip: string };
  costRelationshipQuestion: string;
  costRelationship: { title: string; text: string; tip: string };
  costMoneyQuestion: string;
  costMoney: { title: string; text: string; tip: string };
  brainScan: {
    question: string;
    insight: string;
  };
  rechargeQuestion?: string;
  rechargeText?: string;
  rechargeTip?: string;
  // Timeline cards (대운 → 세운 → Protocol)
  chapter: {
    question: string;
    previousLabel: string;  // e.g. "Ages 15-24"
    previousText: string;   // 1-2 sentences, plain language
    currentLabel: string;   // e.g. "Ages 25-34"
    currentText: string;    // 2-3 sentences, plain language
    nextLabel: string;      // e.g. "Ages 35-44"
    nextText: string;       // 1-2 sentences, plain language
    accent: string;         // transition insight
    strategy: string;       // DO/DON'T for current chapter
  };
  yearQuestion: string;
  yearText: string;
  yearAccent: string;
  yearStrategy: string;
  actionQuestion: string;
  actionNeuro: string;
  shifts: Array<{ name: string; text: string; when: string }>;
  closingLine: string;
}

/**
 * Generate V3 Card Content using LLM
 * Uses "collision" framing: Survey (self-perception) vs Saju (born design)
 * Few-shot approach: one gold-standard example sets the tone
 */
export async function generateV3Cards(
  sajuResult: SajuResult,
  surveyScores: SurveyScores,
  behaviors: BehaviorPatterns,
  userName: string = "Friend",
  language: string = "en",
  birthDate?: string,
  luckCycle?: import("./behavior_translator").LuckCycleInfo | null,
  hdData?: HumanDesignData,
  styleOverride?: string
): Promise<V3CardContent> {
  if (!client) {
    throw new Error("Gemini API key not configured");
  }

  const model = client.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      maxOutputTokens: 16384,
      responseMimeType: "application/json",
    },
  });
  const langInstruction = getLanguageInstruction(language);

  // ── Extract all available saju data ──
  const dayMasterGan = sajuResult.fourPillars.day.gan;
  const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];
  const opAnalysis = (sajuResult as any).operatingAnalysis;
  const alignmentType = opAnalysis?._internal?.alignmentType || "unknown";
  const operatingRate = sajuResult.stats?.operatingRate || 50;
  const dayMasterStrength = (sajuResult as any).dayMasterStrength || 50;
  const dayMasterCategory = (sajuResult as any).dayMasterCategory || "balanced";
  const hardwareType = (sajuResult as any).hardwareAnalysis?.hardwareType || "unknown";

  // Ten Gods
  const tenGods = sajuResult.tenGodsAnalysis;
  const tenGodsStr = tenGods?.distribution
    ? Object.entries(tenGods.distribution)
        .map(([god, count]) => `${god}: ${count}`)
        .join(", ")
    : "N/A";

  // Four Pillars full display
  const fp = sajuResult.fourPillars;
  const pillarsStr = [
    `Year: ${fp.year.gan}${fp.year.zhi} (${fp.year.ganElement}/${fp.year.zhiElement}) [${fp.year.ganGod}/${fp.year.zhiGod}]`,
    `Month: ${fp.month.gan}${fp.month.zhi} (${fp.month.ganElement}/${fp.month.zhiElement}) [${fp.month.ganGod}/${fp.month.zhiGod}]`,
    `Day: ${fp.day.gan}${fp.day.zhi} (${fp.day.ganElement}/${fp.day.zhiElement}) [${fp.day.ganGod}/${fp.day.zhiGod}]`,
    fp.hour ? `Hour: ${fp.hour.gan}${fp.hour.zhi} (${fp.hour.ganElement}/${fp.hour.zhiElement}) [${fp.hour.ganGod}/${fp.hour.zhiGod}]` : "Hour: unknown",
  ].join("\n");

  // Element counts
  const ec = sajuResult.elementCounts;
  const elemStr = `wood:${ec.wood} fire:${ec.fire} earth:${ec.earth} metal:${ec.metal} water:${ec.water}`;
  const missingElements = Object.entries(ec).filter(([, v]) => v === 0).map(([k]) => k);
  const excessElements = Object.entries(ec).filter(([, v]) => (v as number) >= 3).map(([k]) => k);

  const systemPrompt = `You are writing a personal diagnostic report for ${userName}. Not a personality test. Not a horoscope. A diagnostic.

${styleOverride || WRITING_STYLE_RULES}

${langInstruction || 'Write in English.'}

CORE CONCEPT: "COLLISION"
The user has THREE data sources:
1. SURVEY = how they see themselves (self-perception)
2. SAJU = how they were born to operate (structural blueprint)
3. HD = their energy design (how energy flows through their system)

HOW TO FIND THE COLLISION:
Compare these 3 layers for THIS person:

1. SURVEY says: "${surveyScores.typeName}" — they see themselves as ${surveyScores.threatClarity === 1 ? 'HIGH' : 'LOW'} threat sensitivity, ${surveyScores.environmentStable === 1 ? 'STABLE' : 'VOLATILE'} environment, ${surveyScores.agencyActive === 1 ? 'ACTIVE' : 'PASSIVE'} agency
2. SAJU says: Day Master is ${dayMasterInfo.name} (${dayMasterInfo.archetype}). Dominant Ten God is ${tenGods?.dominant || 'N/A'}. Elements: ${missingElements.length > 0 ? 'missing ' + missingElements.join(', ') : 'no missing'}${excessElements.length > 0 ? ', excess ' + excessElements.join(', ') : ''}
3. HD says: ${hdData ? `${hdData.type} type, ${hdData.authority} authority, open centers = ${ALL_HD_CENTERS.filter(c => !hdData.centers.includes(c)).join(', ')}` : 'N/A'}

WHERE TO LOOK FOR GAPS:
- Self-image vs structural design: Do they think they're X but were built for Y?
- Energy direction: Where do they THINK their energy goes vs where it ACTUALLY goes?
- Decision making: How do they THINK they decide vs their designed authority?
- Strengths misread as weaknesses (or vice versa)
- What they suppress that their design needs to express

COLLISION QUALITY CHECK:
- If your collision card could apply to anyone, it's too generic. Rewrite.
- Name a SPECIFIC behavior. "You say yes to projects before checking if you actually want them."
- The collision should make the reader feel slightly uncomfortable because it's true.

Your job: find the collision across all three, name it, prove it with behavioral evidence, show the cost in career/relationships/money, then give one neural protocol to interrupt the pattern.

STRUCTURE: Every card is Q→A. The question hooks. The answer delivers.
LENGTH: 2-3 sentences per field. Brevity = precision. No filler.

ABSOLUTE JARGON BAN — CRITICAL:
The user has ZERO knowledge of saju, astrology, or Human Design. The following terms MUST NEVER appear in your output:
- Saju terms: 편인, 정인, 편관, 정관, 편재, 정재, 식신, 상관, 비견, 겁재, ten gods, heavenly stem, earthly branch, day master, day pillar, four pillars, 천간, 지지, 갑자, 대운, 세운, yin/yang polarity
- Element jargon: "wood chapter", "fire energy", "earth element", "water element", "metal element", "double dose of fire", "missing wood"
- HD terms: gates, channels, centers, definition, authority, profile, type
- Any Chinese/Korean characters (甲, 午, 丙, etc.)

NUMERIC DATA BAN — CRITICAL:
Never include raw numbers, percentages, or scores in the output. No "operating rate", "가동률", "60%", "strength score", etc.
The data section below contains numbers for YOUR analysis only. Convert everything to behavioral descriptions.
BAD: "Your operating rate is 60%." / "가동률 60%"
GOOD: "Your system is running, but leaking energy in specific places."

INSTEAD: Translate everything into plain behavioral language or natural metaphors:
- "편관 energy" → "external pressure pushing you to perform"
- "wood chapter" → "a decade of growth and new beginnings"
- "fire excess" → "you burn through energy faster than you replenish it"
- "missing water" → "you have no natural cooling system"
- "정인 support" → "this year is offering you space to reflect and learn"
The data section below is for YOUR understanding. The output must read like a conversation with a wise friend who knows nothing about astrology.

═══════════════════════════════
SAJU DATA (Birth Blueprint)
═══════════════════════════════

Day Master: ${dayMasterGan} (${dayMasterInfo.name})
- Archetype: ${dayMasterInfo.archetype}
- Strength: ${dayMasterInfo.strength}
- Weakness: ${dayMasterInfo.weakness}
- Day Master Strength: ${dayMasterStrength}/100 (${dayMasterCategory})
- Hardware Type: ${hardwareType}
- Operating Rate: ${operatingRate}%
- Alignment: ${alignmentType}

Four Pillars:
${pillarsStr}

Element Balance: ${elemStr}
${missingElements.length > 0 ? `Missing elements: ${missingElements.join(", ")}` : "No missing elements"}
${excessElements.length > 0 ? `Excess elements (≥3): ${excessElements.join(", ")}` : "No excess elements"}

Ten Gods: dominant=${tenGods?.dominant || "N/A"}
Distribution: ${tenGodsStr}

TEN GODS INTERPRETATION (for YOUR understanding only — NEVER use these terms in output):
- 비견/겁재 (Peer): competitive drive, self-reliance, tendency to compare
- 식신/상관 (Output): creative expression, communication, challenging authority
- 편재/정재 (Wealth): resource management, practical pursuits, financial patterns
- 편관/정관 (Power): external pressure, discipline, structure-seeking
- 편인/정인 (Resource): learning patterns, knowledge absorption, overthinking

This person's dominant Ten God is ${tenGods?.dominant || "N/A"}. Use this to understand their core behavioral drive.
Their distribution is: ${tenGodsStr}. Look for imbalances — heavy in one area means energy concentrates there.

═══════════════════════════════
SURVEY DATA (Self-Perception)
═══════════════════════════════

OS Type: ${surveyScores.typeName} (${surveyScores.typeKey})
- Threat Sensitivity: ${surveyScores.threatClarity === 1 ? "HIGH" : "LOW"} (raw score: ${surveyScores.threatScore})
- Environment Response: ${surveyScores.environmentStable === 1 ? "STABLE" : "VOLATILE"} (raw score: ${surveyScores.environmentScore})
- Agency: ${surveyScores.agencyActive === 1 ? "ACTIVE" : "PASSIVE"} (raw score: ${surveyScores.agencyScore})

═══════════════════════════════
BEHAVIOR PATTERNS (pre-translated)
═══════════════════════════════

Decision Style: ${behaviors.decisionStyle}
Decision Warning: ${behaviors.decisionWarning}
Energy Pattern: ${behaviors.energyPattern}
Strengths: ${behaviors.strengths.join(" | ")}
Vulnerabilities: ${behaviors.vulnerabilities.join(" | ")}
Warning Signal: ${behaviors.warningSignal}
Optimal Environment: ${behaviors.optimalEnvironment}
Age Context: ${behaviors.ageContext}
Design vs Perception Gaps: ${behaviors.designVsPerception.join(" | ")}

═══════════════════════════════
BRAIN SCAN (neuroscience interpretation only)
═══════════════════════════════

BRAIN SCAN CARD:
Write 4-5 sentences explaining how this person's brain operates.
Use neuroscience terms (amygdala, prefrontal cortex, dopamine pathways, default mode network).
Connect brain mechanics to the collision you identified.

Base your analysis on these behavioral signals:
- Threat response: ${surveyScores.threatClarity === 1 ? 'HIGH' : 'LOW'} — ${surveyScores.threatClarity === 1 ? 'their alarm system fires frequently, scanning for threats others miss' : 'their alarm system runs cool, potentially missing real signals'}
- Initiative: ${surveyScores.agencyActive === 1 ? 'ACTIVE' : 'PASSIVE'} — ${surveyScores.agencyActive === 1 ? 'high drive to act and shape their environment' : 'tendency to wait, observe, and conserve energy'}
- Environment processing: ${surveyScores.environmentStable === 1 ? 'STABLE' : 'VOLATILE'} — ${surveyScores.environmentStable === 1 ? 'they seek and maintain predictable conditions' : 'they operate in or create unstable conditions'}

Do NOT include numeric scores. Explain in behavioral terms only.
brainScan output should contain ONLY "question" and "insight" fields. No alarm/drive/stability/remaining numbers.

═══════════════════════════════
HD DATA (Human Design Blueprint)
═══════════════════════════════
${hdData ? `
Type: ${hdData.type}
Profile: ${hdData.profile}
Strategy: ${hdData.strategy}
Authority: ${hdData.authority}
Definition: ${hdData.definition}
Defined Centers: ${hdData.centers.join(", ")}
Open Centers: ${ALL_HD_CENTERS.filter(c => !hdData.centers.includes(c)).join(", ")}
Channels: ${hdData.channels_long.join(", ")}
Channels (short): ${hdData.channels_short?.join(", ") || "N/A"}
Gates: ${(hdData as any).gates?.join(", ") || "N/A"}
Circuitries: ${(hdData as any).circuitries || "N/A"}
Variables: ${(hdData as any).variables || "N/A"}
Determination: ${(hdData as any).determination || "N/A"}
Incarnation Cross: ${hdData.incarnation_cross || "N/A"}
${(hdData as any).activations ? `
Design Activations: ${JSON.stringify((hdData as any).activations.design)}
Personality Activations: ${JSON.stringify((hdData as any).activations.personality)}
` : ''}Signature: ${hdData.signature}
Not-Self Theme: ${hdData.not_self_theme}
Environment: ${hdData.environment || "N/A"}
Cognition: ${hdData.cognition || "N/A"}
Motivation: ${hdData.motivation || "N/A"} (shadow: ${hdData.transference || "N/A"})
Perspective: ${hdData.perspective || "N/A"} (shadow: ${hdData.distraction || "N/A"})

INTERPRETATION GUIDE (for YOUR understanding only — translate to plain behavior):
- Type defines their energy role (Manifestor=initiator, Generator=builder, Projector=guide, Reflector=mirror)
- Authority = how they make correct decisions (Emotional=sleep on it, Sacral=gut response, Splenic=instinct)
- Defined Centers = consistent energy; Open Centers = absorb/amplify others' energy
- Strategy = their optimal way of engaging with the world
- Not-Self Theme = what they feel when off-track
- Motivation/Transference = what genuinely drives them vs the distorted drive they fall into when off-track
- Perspective/Distraction = how they naturally see the world vs the warped lens they adopt when off-track
` : 'No HD data available.'}

═══════════════════════════════
LUCK CYCLE DATA (10-year chapters + annual energy)
═══════════════════════════════
${luckCycle ? `
Day Master: ${luckCycle.dayMaster}

CURRENT 대운 (10-Year Chapter): ${luckCycle.currentDaYun.ganZhi}
- Age range: ${luckCycle.currentDaYun.startAge}-${luckCycle.currentDaYun.endAge}
- 天干 (heavenly stem): ${luckCycle.currentDaYun.ganZhi[0]} = ${luckCycle.currentDaYun.ganElement} energy, ${luckCycle.currentDaYun.ganMeaning}
- 地支 (earthly branch): ${luckCycle.currentDaYun.ganZhi[1]} = ${luckCycle.currentDaYun.zhiElement} energy, ${luckCycle.currentDaYun.zhiMeaning}
- Ten God (천간 vs 일간): ${luckCycle.currentDaYun.tenGodGan} = ${TEN_GODS_MAP[luckCycle.currentDaYun.tenGodGan]?.meaning || 'unknown'}
- Ten God (지지 vs 일간): ${luckCycle.currentDaYun.tenGodZhi} = ${TEN_GODS_MAP[luckCycle.currentDaYun.tenGodZhi]?.meaning || 'unknown'}
- Cycle phase: ${luckCycle.cyclePhase}
${luckCycle.previousDaYun ? `
PREVIOUS 대운: ${luckCycle.previousDaYun.ganZhi}
- Age range: ${luckCycle.previousDaYun.startAge}-${luckCycle.previousDaYun.endAge}
- Ten God: ${luckCycle.previousDaYun.tenGodGan} (천간) / ${luckCycle.previousDaYun.tenGodZhi} (지지)
- Energy: ${luckCycle.previousDaYun.ganElement} stem + ${luckCycle.previousDaYun.zhiElement} branch
` : ''}${luckCycle.nextDaYun ? `
NEXT 대운: ${luckCycle.nextDaYun.ganZhi}
- Age range: ${luckCycle.nextDaYun.startAge}-${luckCycle.nextDaYun.endAge}
- Ten God: ${luckCycle.nextDaYun.tenGodGan} (천간) / ${luckCycle.nextDaYun.tenGodZhi} (지지)
- Energy: ${luckCycle.nextDaYun.ganElement} stem + ${luckCycle.nextDaYun.zhiElement} branch
` : ''}
CURRENT 세운 (${luckCycle.currentSeUn.year} Annual Energy): ${luckCycle.currentSeUn.ganZhi}
- 천간: ${luckCycle.currentSeUn.ganZhi[0]} = ${luckCycle.currentSeUn.ganElement}, Ten God: ${luckCycle.currentSeUn.tenGodGan}
- 지지: ${luckCycle.currentSeUn.ganZhi[1]} = ${luckCycle.currentSeUn.zhiElement}, Ten God: ${luckCycle.currentSeUn.tenGodZhi}

INTERPRETATION GUIDE (for YOUR understanding only — NEVER expose these terms to user):
- 대운 = the 10-year backdrop. It defines the CHAPTER theme.
- 세운 = THIS year's energy layered on top of the chapter.
- Ten God meanings (translate to behavior, NEVER use the Korean/Chinese terms):
  편관/정관 → external pressure, being tested, structure, responsibility
  편인/정인 → support, protection, learning, intuition, mentorship
  편재/정재 → goals, achievement, resources, money, tangible results
  식신/상관 → expression, creativity, output, freedom, breaking rules
  비견/겁재 → self-reliance, competition, independence, identity

FOR THE CHAPTER CARD (structured output with previousLabel/previousText/currentLabel/currentText/nextLabel/nextText/accent):
- Tell a STORY across three phases. Past → Present → Future.
- Each phase: 1-2 sentences of what that decade FEELS like in daily life.
- The "accent" connects all three: what's the through-line?
- REMEMBER: NO saju jargon. Write like describing life chapters to a friend.

FOR THE YEAR CARD:
- What is ${luckCycle.currentSeUn.year} specifically asking of them?
- How does this year's energy interact with their collision?
- Is it amplifying the gap or offering a bridge?
- Keep it behavioral. "This year supports reflection" not "편인 energy".
` : 'No luck cycle data available. Skip chapterQuestion/chapterText/yearQuestion/yearText fields (set to empty strings).'}

═══════════════════════════════
EXAMPLE OUTPUT (different user — match this QUALITY, not this content)
═══════════════════════════════

This example is for a Master Builder (T1-E1-A1) with earth day master, fire:4, wood:0, overdriven.
DO NOT copy this content. Use it ONLY to calibrate tone and specificity.

{
  "hookQuestion": "Why does the person who catches every problem still feel like they're falling behind?",
  "mirrorQuestion": "You think you know exactly who you are. But do you?",
  "mirrorText": "You see yourself as someone who takes action, someone who catches problems before they happen, and someone who performs well under any conditions. The reliable one. The one who gets things done.",
  "mirrorAccent": "In your mind, your strength is your ability to spot danger AND act on it immediately.",
  "blueprintQuestion": "What if you were never meant to move this fast?",
  "blueprintText": "You were designed to be a mountain. Patient. Immovable. Deliberate. Your power comes from staying still while everything else moves around you.",
  "blueprintAccent": "Your internal fire is extreme, but you have zero cooling mechanism. You have no flexibility element. Adapting to change doesn't come naturally. Your system is overdriven.",
  "blueprintFacets": [
    { "label": "Core Drive", "text": "You optimize for control, not success. Every decision runs through a filter: 'Can I manage this outcome?' You mistake this for ambition, but it's actually your need to never be caught off-guard." },
    { "label": "Hidden Talent", "text": "You read systems faster than people. Give you any organization, business, or group dynamic and you'll spot the structural flaw within minutes. You dismiss this as 'obvious' — it's not. Most people can't do it." },
    { "label": "Blind Spot", "text": "You absorb other people's stress and mistake it for your own. You walk into a tense room and leave carrying weight that was never yours. This is why you feel exhausted after social events that 'shouldn't' be tiring." }
  ],
  "decisionQuestion": "How do you actually make decisions?",
  "decisionText": "You think you decide by analyzing all options and picking the safest one. Your design says otherwise. You were built with an emotional authority — meaning your best decisions come after sleeping on it, not after spreadsheet-ing it. Every snap decision you've regretted? That was you overriding the system that needed 24 more hours.",
  "decisionAccent": "Your gut isn't broken. You're just not giving it enough time to speak.",
  "collisionQuestion": "So what breaks when a mountain tries to sprint?",
  "collisionText": "You think speed is your strength. Your design says it's your biggest leak. You were built to be a mountain, not a sprinter. Every time you rush to fix something, you're overriding the system that gives you your actual power: patience.",
  "collisionAccent": "The gap: you act like fire, but you were built from earth. That mismatch is where your energy disappears.",
  "evidenceQuestion": "Sound familiar?",
  "evidence": [
    "You scan every room for problems before you've even sat down. By the time the meeting starts, you've already drafted three contingency plans.",
    "You say yes before checking your capacity. Not because you want to help. Because saying no feels like failing.",
    "You finish other people's tasks 'because it's faster.' Then resent that no one does the same for you."
  ],
  "costCareerQuestion": "Why do you keep hitting the same ceiling?",
  "costCareer": { "title": "In your organization", "text": "You become indispensable, then trapped. You built the system, now you're the only one who can maintain it. That's not success. That's a cage you constructed yourself.", "tip": "This week: before saying yes to any new request, reply with 'Let me check my capacity and get back to you by tomorrow.' Not to stall. To break the auto-yes reflex." },
  "costRelationshipQuestion": "Why do the people closest to you seem distant?",
  "costRelationship": { "title": "In relationships", "text": "You show up as the strong one. Always capable, never needing. People stop asking if you're okay because you trained them not to. The fortress works. That's the problem.", "tip": "Pick one person this week and say 'I'm actually not fine today.' One sentence. That's it. Your fortress has a door — use it." },
  "costMoneyQuestion": "Why does money come in and leave just as fast?",
  "costMoney": { "title": "With money", "text": "You earn and spend in the same motion. Money comes in through effort, leaks out through the constant maintenance of problems you anticipated but didn't need to solve.", "tip": "Before any purchase over $30 this week, wait 24 hours. Not to save money. To notice whether you're buying to solve a problem or to feel productive." },
  "rechargeQuestion": "Why doesn't rest feel like rest?",
  "rechargeText": "You collapse on the couch and call it recovery. But your system doesn't recharge through stillness — it recharges through satisfaction. You were built to respond to what genuinely excites you. When you rest 'correctly' but feel emptier, it's because your body needed engagement, not escape. Your open head center absorbs everyone else's mental noise all day. By evening, half the thoughts in your head aren't even yours.",
  "rechargeTip": "Before bed tonight, ask yourself: 'Which of today's worries are actually mine?' Write down only yours. Let the rest go — literally cross them out. Your system sheds borrowed energy through physical acknowledgment.",
  "brainScan": { "question": "Where is all your energy actually going?", "insight": "Your amygdala fires at nearly double the baseline rate, keeping your threat-detection system permanently on. This hijacks your prefrontal cortex into reactive problem-solving mode instead of strategic thinking. Meanwhile, your dopamine pathways are locked in a production loop: finish one task, crave the next, repeat. The result is a brain running two expensive programs simultaneously with almost nothing left for the default mode network, the system that handles creativity, self-reflection, and genuine rest." },
  "chapter": {
    "question": "What chapter of your life are you actually in?",
    "previousLabel": "Ages 15-24",
    "previousText": "A decade of learning the rules. Structure, discipline, figuring out how the world works. You absorbed everything.",
    "currentLabel": "Ages 25-34",
    "currentText": "A decade of being tested. Outside forces are pushing against your natural tendencies. This isn't comfortable. It's not supposed to be. This is the decade where you find out what you're actually made of.",
    "nextLabel": "Ages 35-44",
    "nextText": "A decade of building. The pressure you're feeling now becomes the foundation for real, tangible results.",
    "accent": "You went from learning the rules to being forced to break them. Next comes building something real with what survived.",
    "strategy": "DO: Say no to safety-seeking decisions. This decade rewards risk. DON'T: Build another backup plan. The pressure you feel isn't a sign to retreat — it's the signal to push."
  },
  "yearQuestion": "What is 2026 actually asking of you?",
  "yearText": "This year is offering you a pause button in the middle of a pressure decade. Your system wants to sprint. But 2026 is handing you a library card, not running shoes. The energy this year supports reflection, intuition, and unconventional learning.",
  "yearAccent": "2026 is not asking you to do more. It's asking you to understand more before you act.",
  "yearStrategy": "DO: Use 2026 to study, not to launch. Take one course, read deeply, talk to mentors. DON'T: Start a new project before June. The urge to build is real but premature — this year's energy is for loading, not firing.",
  "actionQuestion": "Can your brain actually rewire this?",
  "actionNeuro": "Your amygdala triggers threat responses 3x above baseline. Your prefrontal cortex compensates by staying in control mode. This is why you crash by 3pm. The protocol below interrupts this loop at the neural level.",
  "shifts": [
    { "name": "The Pause Protocol", "text": "Before any decision this week, wait 10 minutes. Not to think. To let the first impulse pass. Your mountain doesn't need to respond to every tremor. The right answer comes after the shaking stops.", "when": "Every decision point. 7 days." },
    { "name": "The Capacity Check", "text": "Before saying yes to anything new, write down your current 3 active commitments. If you can't drop one, the answer is no.", "when": "When asked for help. Ongoing." },
    { "name": "The Fortress Door", "text": "Tell one person per day something you haven't said out loud yet. Not a confession. Just an unfiltered thought.", "when": "Evening. 7 days." }
  ],
  "closingLine": "Your system isn't broken. It's overclocked. Dial it back 30% and watch what happens."
}

═══════════════════════════════
CARD-SPECIFIC RULES
═══════════════════════════════

DECISION CARD — FREE PREVIEW (high impact):
This card shows how the user THINKS they decide vs how they're DESIGNED to decide.
Data sources:
- HD Authority: ${hdData ? hdData.authority : 'N/A'} — this is their designed decision-making mechanism
  Emotional = sleep on it (wave must complete), Sacral = gut response (yes/no in the moment), Splenic = first instinct (trust the flash), Self-Projected = talk it out, Ego = willpower, None/Lunar = wait 28 days
- Survey Agency: ${surveyScores.agencyActive === 1 ? 'ACTIVE (thinks they decide fast and shape outcomes)' : 'PASSIVE (thinks they wait and let things unfold)'}
- HD Strategy: ${hdData ? hdData.strategy : 'N/A'}
Rules:
- decisionQuestion: provocative question about their decision-making gap
- decisionText: 3-4 sentences. Name the gap between how they THINK they decide and how they SHOULD decide. Be specific.
- decisionAccent: 1 sentence. The practical takeaway — what to do differently starting now.
- NO jargon. Never say "emotional authority" or "sacral response". Translate to behavior.

RECHARGE CARD — PAID (after Cost trilogy):
This card explains why rest doesn't feel like rest and gives their actual recovery method.
Data sources:
- HD Type + Strategy: ${hdData ? `${hdData.type} / ${hdData.strategy}` : 'N/A'} — defines HOW they recharge
  Generator/MG = through satisfaction and correct response; Projector = through recognition and being invited; Manifestor = through informing then withdrawing; Reflector = through lunar cycles and space
- Saju Missing Elements: ${missingElements.length > 0 ? missingElements.join(', ') : 'none'} — what's structurally absent
  missing water = no natural cooling/rest system; missing wood = no flexibility/growth outlet; missing metal = no structure/release mechanism; missing fire = no passion/spark; missing earth = no grounding/stability
- HD Open Centers: ${hdData ? ALL_HD_CENTERS.filter(c => !hdData.centers.includes(c)).join(', ') : 'N/A'} — energy they absorb from others and must shed
- HD Not-Self Theme: ${hdData ? hdData.not_self_theme : 'N/A'} — emotional signal they're running on others' fuel
Rules:
- rechargeQuestion: question about why their current rest strategy fails
- rechargeText: 3-4 sentences. Explain their designed recharge method + what they absorb from others that drains them. Be specific to their open centers.
- rechargeTip: ONE concrete action. Start with "Tonight:" or "This week:". Must be doable in under 5 minutes. Should address their specific energy leak.

COST CARD TIPS — CRITICAL:
Each cost card MUST include a "tip" field. This is the SOLUTION, not more diagnosis.
Rules for tips:
- Start with "This week:" or a specific timeframe
- One concrete action, not a mindset shift
- Must be doable in under 5 minutes
- Specific enough that the reader knows EXACTLY what to do
- Connected to the cost it follows (career tip for career cost, etc.)
BAD: "Try to be more assertive at work" (vague, mindset)
GOOD: "Next time your boss adds to your plate, say: 'I can do that if I drop X. Which matters more?'" (specific, actionable)

PROTOCOL RULES (shifts array):
Generate EXACTLY 3 protocols. Each must:
1. Have a memorable name (2-3 words)
2. Be completable in under 5 minutes per instance
3. Target a DIFFERENT aspect of the collision (one behavioral, one relational, one environmental)
4. Include a specific trigger ("when X happens, do Y") not just a general habit
5. First protocol = highest impact, most urgent

CHAPTER/YEAR STRATEGY — CRITICAL:
- chapter.strategy: 2-3 sentences. DO [specific action for this decade's energy] + DON'T [specific trap to avoid].
- yearStrategy: 2-3 sentences. DO [specific action for this year] + DON'T [specific trap].
- These must be ACTIONABLE, not motivational. Bad: "Trust the process." Good: "Spend 30 minutes weekly journaling what you're learning, not what you're achieving."
- Connect the strategy to the collision — the strategy should address the gap you identified.

BLUEPRINT FACETS — MULTI-DIMENSIONAL VIEW:
In addition to blueprintText (core identity summary), generate blueprintFacets — an array of EXACTLY 3 objects:

1. "Core Drive" — What fundamentally moves this person. Combine:
   - Day Master archetype (strength/weakness)
   - Dominant Ten God (where energy concentrates)
   - HD Motivation vs Transference (genuine drive vs distorted drive)
   Write what they're ACTUALLY optimizing for, even if they don't realize it.

2. "Hidden Talent" — What they're naturally gifted at but may undervalue. Combine:
   - HD Channels (specific talent circuits)
   - HD Incarnation Cross (life theme)
   - Saju element excess (where energy is abundant)
   - HD Defined Centers (consistent energy output)
   Write a specific skill or capacity, not a generic trait.

3. "Blind Spot" — What they consistently miss or misread. Combine:
   - HD Open Centers (where they absorb/amplify others)
   - Saju missing elements (structural gap)
   - HD Not-Self Theme (emotional signal of misalignment)
   Write the specific pattern they don't see, not just "you have a blind spot."

Each facet: 2-3 sentences. Behavioral language only. No jargon.

═══════════════════════════════
YOUR TASK
═══════════════════════════════

Generate V3CardContent JSON for ${userName} using THEIR data above. Find THEIR specific collision between survey self-perception and saju design. The collision should feel unavoidable and specific to this person's data combination.

MANDATORY FIELDS — DO NOT SKIP:
You MUST include ALL of these fields in your JSON output. If ANY is missing, the report is broken:
- "decisionQuestion", "decisionText", "decisionAccent": decision-making gap card
- "rechargeQuestion", "rechargeText", "rechargeTip": recharge/recovery card
- "shifts": array of EXACTLY 3 protocol objects [{name, text, when}, ...]
- "closingLine": ONE powerful sentence that compresses all your advice into a single takeaway. This is the last thing the user reads. Make it unforgettable.
- "blueprintFacets": array of EXACTLY 3 facet objects [{label, text}, ...]
- "yearStrategy": DO/DON'T strategy for this year
- chapter must include "strategy" field
- All cost cards (costCareer, costRelationship, costMoney) must include "tip" field

Output ONLY valid JSON matching the structure above. No markdown, no explanation.`;

  console.log(`[Gemini] Generating V3 Cards for ${userName}...`);

  const v3Content = await generateWithRetry(model, systemPrompt, "Generate V3 Card Content JSON.") as V3CardContent;

  // Validate required fields — prevent saving truncated JSON from repair
  const requiredFields = ['hookQuestion', 'mirrorQuestion', 'mirrorText', 'blueprintQuestion', 'blueprintText', 'closingLine', 'shifts'] as const;
  const missing = requiredFields.filter(f => !v3Content[f]);
  if (missing.length > 0) {
    console.error(`[Gemini] V3 Cards missing required fields: ${missing.join(', ')}`);
    throw new Error(`V3_INCOMPLETE: Missing required fields: ${missing.join(', ')}`);
  }

  console.log("[Gemini] V3 Cards Generated");
  return v3Content;
}

/**
 * Repair incomplete V3 report — regenerate only missing fields
 * Uses existing report context so repaired fields stay consistent
 */
export async function repairV3Cards(
  existing: Partial<V3CardContent>,
  missingFields: string[],
  userInput: any,
  sajuData: any,
  language: string
): Promise<Partial<V3CardContent>> {
  if (!client) throw new Error("Gemini API key not configured");

  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-preview-05-20",
    generationConfig: { temperature: 0.8 },
  });

  const existingSummary = JSON.stringify(existing, null, 2).slice(0, 3000);

  const systemPrompt = `You are repairing an incomplete personality report. The report was generated but some fields were lost due to truncation.

EXISTING REPORT DATA (do NOT change these — match their tone, language, and style):
${existingSummary}

USER DATA:
- Name: ${userInput.name || "Friend"}
- Language: ${language}
- Birth date: ${userInput.birthDate}

MISSING FIELDS TO GENERATE:
${missingFields.map(f => `- "${f}"`).join('\n')}

FIELD SPECIFICATIONS:
- "closingLine": ONE powerful sentence that compresses the report's insight into a single takeaway. Match the existing report's tone.
- "actionQuestion": A provocative question introducing the protocol/action section.
- "actionNeuro": 1-2 sentences explaining the neuroscience behind the recommended shifts.
- "shifts": Array of EXACTLY 3 objects: [{"name": "Protocol Name", "text": "What to do and why", "when": "When and how long"}]

Output ONLY a valid JSON object containing the missing fields. No markdown, no explanation. Match the language of the existing report (${language}).`;

  console.log(`[Gemini] Repairing V3 Cards — missing: ${missingFields.join(', ')}`);

  const patch = await generateWithRetry(model, systemPrompt, `Generate ONLY these missing fields as JSON: ${missingFields.join(', ')}`);

  // Validate that we got the fields we asked for
  const stillMissing = missingFields.filter(f => !patch[f]);
  if (stillMissing.length > 0) {
    console.warn(`[Gemini] Repair still missing: ${stillMissing.join(', ')}`);
  }

  console.log(`[Gemini] Repair complete — generated: ${Object.keys(patch).join(', ')}`);
  return patch;
}
