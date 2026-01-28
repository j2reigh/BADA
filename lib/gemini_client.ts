/**
 * Gemini AI Report Generator
 * Generates personalized Life Blueprint Reports using Google Generative AI
 *
 * UPGRADE v2 (2026-01-16): Enhanced prompts for A4 5-page PDF quality.
 * - Longer, more detailed content
 * - Nature landscape metaphors (not people)
 * - Neuroscience explanations in simple language
 * - Science-backed action protocols
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DAY_MASTER_MAP, TEN_GODS_MAP, ELEMENT_MAP } from "./saju_constants";
import { FIVE_ELEMENTS_INFO } from "./saju_knowledge";
import { OS_TYPE_PROTOCOLS } from "./standardization_dictionaries";
import type { SajuResult } from "./saju_calculator";
import type { ContentArchetype } from "../shared/schema";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY not found. Using mock data.");
}

const client = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

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
    daily_rituals: Array<{ name: string; description: string; when: string }>;
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
    return `LANGUAGE: Simple, evocative English (B1-B2 level). No jargon.`;
  }

  const langName = LANGUAGE_NAMES[language] || language;
  return `LANGUAGE: Write ALL content in ${langName}.
- Use natural, conversational tone (equivalent to B1-B2 level)
- Keep it warm, specific, and relatable
- For technical terms (neuroscience), keep English term + explain in target language
  e.g., "Amygdala (뇌의 경보 시스템)" or "Amygdala (sistem alarm otak)"`;
}

/**
 * Main Orchestrator
 */
export async function generateLifeBlueprintReport(
  sajuResult: SajuResult,
  surveyScores: SurveyScores,
  userName: string = "Friend",
  archetype?: ContentArchetype,
  language: string = "en"
): Promise<LifeBlueprintReport> {
  if (!client) {
    return generateMockReport(sajuResult, surveyScores);
  }

  try {
    console.log(`[Gemini] Starting Report Generation for ${userName} in ${language}...`);
    const langInstruction = getLanguageInstruction(language);

    const page1 = await generatePage1(sajuResult, surveyScores, userName, archetype, langInstruction);
    console.log("[Gemini] Page 1 Generated");

    const page2 = await generatePage2(sajuResult, page1.title, userName, archetype, langInstruction);
    console.log("[Gemini] Page 2 Generated");

    const page3 = await generatePage3(surveyScores, userName, langInstruction);
    console.log("[Gemini] Page 3 Generated");

    const page4 = await generatePage4(page2, page3, userName, langInstruction);
    console.log("[Gemini] Page 4 Generated");

    const page5 = await generatePage5(sajuResult, page3, page4, surveyScores, userName, langInstruction);
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
async function generatePage1(sajuResult: SajuResult, surveyScores: SurveyScores, userName: string, archetype?: ContentArchetype, langInstruction?: string) {
  const model = client!.getGenerativeModel({ model: "gemini-2.5-flash" });

  const dayMasterGan = sajuResult.fourPillars.day.gan;
  const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];
  const dominantElement = Object.entries(sajuResult.elementCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0];
  const dominantElementName = dominantElement[0];

  const opAnalysis = (sajuResult as any).operatingAnalysis;
  const levelInfo = opAnalysis
    ? `Level ${opAnalysis.level}: ${opAnalysis.levelName}`
    : `${sajuResult.stats.operatingRate.toFixed(1)}%`;

  const systemPrompt = `You are the "Life Architect" creating a powerful Identity Page.

${archetype ? `STANDARDIZED IDENTITY (MUST USE):
- IDENTITY TITLE: "${archetype.identityTitle}"
- NATURE METAPHOR: "${archetype.natureMetaphor}"
` : ''}

USER DATA:
- Name: ${userName}
- Core Nature (Day Master): ${dayMasterInfo.name} - ${dayMasterInfo.archetype}
- Key Strength: ${dayMasterInfo.strength}
- Key Weakness: ${dayMasterInfo.weakness}
- Dominant Element: ${dominantElementName}
- Operating State: ${levelInfo}
${opAnalysis ? `- State Description: ${opAnalysis.levelDescription}` : ''}
${opAnalysis ? `- Guidance: ${opAnalysis.guidance.join(', ')}` : ''}

CRITICAL RULES:
1. ${langInstruction || 'LANGUAGE: Simple, evocative English (B1-B2 level). No jargon.'}
2. NATURE LANDSCAPE ONLY: Describe the user as a NATURAL PHENOMENON or LANDSCAPE.
   - GOOD: "A Silent Volcano", "The Midnight Ocean", "A Forest Fire in Winter", "The Dormant Glacier"
   - BAD: "The Warrior", "The King", "The Leader" (these are people, not landscapes!)
3. METAPHOR DEPTH: Each metaphor should paint a vivid mental picture.
4. TONE: Mysterious, premium, insightful - like discovering a secret about yourself.

OUTPUT (JSON Only):
{
  "title": "The [Adjective] [Nature Noun]",
  "sub_headline": "A teasing phrase about untapped potential (8-12 words)",
  "nature_snapshot": {
    "title": "Your Birth Pattern",
    "definition": "A vivid nature landscape metaphor (10-15 words)",
    "explanation": "Why this landscape matches them, connecting to their core nature (25-40 words)"
  },
  "brain_snapshot": {
    "title": "Your Current Mind State",
    "definition": "A metaphor for their current mental operating state (10-15 words)",
    "explanation": "What this means for their daily energy and focus (25-40 words)"
  },
  "efficiency_snapshot": {
    "level": ${opAnalysis ? opAnalysis.level : 1},
    "level_name": "${opAnalysis ? opAnalysis.levelName : "Survival"}",
    "label": "Current Operating State",
    "metaphor": "A vivid metaphor for this operating level (${levelInfo}) - e.g. 'A submarine in dry dock' or 'A racing car on an open track' (20-30 words)"
  },
  "visual_concept": {
    "background_id": "${OS_TYPE_BACKGROUNDS[surveyScores.typeName] || "bg_type_01"}",
    "overlay_id": "${ELEMENT_OVERLAYS[dominantElementName] || "overlay_water"}"
  }
}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "Generate Page 1 Identity JSON." }] }],
    systemInstruction: systemPrompt,
  });

  const data = parseJSON(result.response.text());

  // Enforce Determinism if Archetype exists
  if (archetype) {
    data.title = archetype.identityTitle;
    data.nature_snapshot.definition = archetype.natureMetaphor;
    // We can also let AI use the description for explanation if we want, or keep AI's explanation
  }

  return data;
}

// ==========================================
// PAGE 2: Hardware (Deep Nature Analysis)
// ==========================================
async function generatePage2(sajuResult: SajuResult, identityTitle: string, userName: string, archetype?: ContentArchetype, langInstruction?: string) {
  const model = client!.getGenerativeModel({ model: "gemini-2.5-flash" });

  const dayMasterGan = sajuResult.fourPillars.day.gan;
  const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];
  const dayMasterElement = ELEMENT_MAP[dayMasterGan] || "wood";
  const elementInfo = FIVE_ELEMENTS_INFO[dayMasterElement as keyof typeof FIVE_ELEMENTS_INFO];

  const systemPrompt = `You are the "Life Architect" creating Page 2: The Deep Nature Analysis.

USER DATA:
- Identity Title: ${identityTitle}
- Day Master: ${dayMasterInfo.name} (${dayMasterInfo.archetype})
- Element: ${dayMasterElement}
- Core Strength: ${dayMasterInfo.strength}
- Core Weakness: ${dayMasterInfo.weakness}
- Element Nature: ${elementInfo?.keyword || "Balanced energy"}
- Element Tendency: ${elementInfo?.excess || "Adaptability"}

CRITICAL RULES:
1. ${langInstruction || 'LANGUAGE: Simple, warm English (B1-B2 level).'}
2. EXTEND THE METAPHOR: Build on the nature landscape from Page 1.
3. DEPTH: This is THE deep dive. Each section should be rich and detailed.
4. BALANCE: Show both the beauty AND the danger of their nature.

CONTENT LENGTH REQUIREMENTS:
- nature_description: 4-5 sentences (80-120 words). Paint a vivid picture of their inner landscape.
- shadow_description: 3-4 sentences (60-80 words). Gently explain the dark side.
- core_insights: Each insight should be 15-25 words.

OUTPUT (JSON Only):
{
  "section_name": "Your Natural Blueprint",
  "nature_title": "A poetic title for their inner landscape (8-12 words)",
  "core_drive": "ONE SHARP SENTENCE describing their fundamental operating condition. Start with 'You flourish when... but rot when...'. (20-30 words)",
  "nature_description": "4-5 sentences describing their core nature using the landscape metaphor. Start with 'Imagine...' or 'Picture...' to draw them in. Describe the colors, textures, and energy of this landscape. Connect it to how they move through the world.",
  "shadow_title": "A compassionate title for their shadow side (6-10 words)",
  "shadow_description": "3-4 sentences explaining how this beautiful nature can sometimes work against them. Use the same landscape metaphor - what happens when the volcano erupts? When the ocean storms? Be gentle but honest.",
  "core_insights": [
    "First insight about their fundamental drive - what engine runs them (15-25 words)",
    "Second insight about their natural strength - what they do effortlessly (15-25 words)",
    "Third insight about their hidden need - what they crave but rarely admit (15-25 words)"
  ]
}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "Generate Page 2 Hardware JSON." }] }],
    systemInstruction: systemPrompt,
  });

  const data = parseJSON(result.response.text());

  // Enforce Determinism if Archetype exists
  if (archetype) {
    data.nature_title = archetype.identityTitle; // Or keep poetic title generated by AI? User wants standardization.
    // Actually Page 2 has "nature_title" which is often different from "Identity Title" (The Calculated Pine).
    // But let's verify if we want to replace nature_description.
    data.nature_description = archetype.natureDescription;
    data.shadow_description = archetype.shadowDescription;
  }

  return data;
}

// ==========================================
// PAGE 3: Operating System (Neuroscience)
// ==========================================
async function generatePage3(surveyScores: SurveyScores, userName: string, langInstruction?: string) {
  const model = client!.getGenerativeModel({ model: "gemini-2.5-flash" });

  // No sajuResult passed here in original signature, but we need OpAnalysis
  // We can assume surveyScores actually contains the analysis if we refactored, 
  // but for now let's rely on standard structure.
  // Actually, Page 3 currently only takes surveyScores. 
  // We need to pass Operating Analysis to generatePage3 if we want to use it.
  // However, changing function signature requires changing the caller in generateLifeBlueprintReport.

  const systemPrompt = `You are the "Life Architect" creating Page 3: The Operating System Analysis.

USER DATA:
- Threat Response: ${surveyScores.threatClarity === 1 ? 'HIGH SENSITIVITY' : 'LOW SENSITIVITY'} (Score: ${surveyScores.threatScore}/3)
- Environment Processing: ${surveyScores.environmentStable === 1 ? 'STABLE' : 'VOLATILE'} (Score: ${surveyScores.environmentScore}/2)
- Agency/Drive: ${surveyScores.agencyActive === 1 ? 'HIGH DRIVE' : 'PASSIVE'} (Score: ${surveyScores.agencyScore}/3)
- OS Type: ${surveyScores.typeName}

CRITICAL RULES:
1. ${langInstruction || 'LANGUAGE: Simple English (B1-B2 level). Explain like talking to a smart friend, not a scientist.'}
2. NEUROSCIENCE MADE SIMPLE: Use brain terms but ALWAYS explain them simply.
   - Amygdala = "your brain's alarm system"
   - Prefrontal Cortex = "your brain's CEO" or "decision-making center"
   - Dopamine = "your motivation fuel" or "reward chemical"
   - Sympathetic Nervous System = "fight-or-flight mode"
   - Parasympathetic = "rest and digest mode"
3. RELATABLE EXAMPLES: Connect brain science to everyday situations.

CONTENT LENGTH REQUIREMENTS:
- Each axis description: 3-4 sentences (50-70 words)
- os_summary: 4-5 sentences (70-100 words)

OUTPUT (JSON Only):
{
  "section_name": "Your Operating System",
  "os_title": "A title describing how their brain currently operates (8-12 words)",
  "os_anchor": "ONE SHARP SENTENCE diagnosis of their current system state. E.g., 'System Overheated: High Drive entangled with Low Maintenance.' (15-20 words)",
  "threat_axis": {
    "title": "Your Alarm System",
    "level": "${surveyScores.threatClarity === 1 ? 'Highly Tuned' : 'Relaxed'}",
    "description": "3-4 sentences explaining their threat response. Start by naming the brain part (Amygdala = your brain's alarm system). Then explain what this means for them in daily life. Give a relatable example. ${surveyScores.threatClarity === 1 ? 'Explain how a sensitive alarm catches real dangers but also false alarms.' : 'Explain how a relaxed alarm means less anxiety but might miss warning signs.'}"
  },
  "environment_axis": {
    "title": "Your Processing Power",
    "level": "${surveyScores.environmentStable === 1 ? 'Steady' : 'Fluctuating'}",
    "description": "3-4 sentences about how they process their environment. Reference sensory processing and cognitive load in simple terms. Give an example of how this shows up - at work, in busy places, etc."
  },
  "agency_axis": {
    "title": "Your Drive Engine",
    "level": "${surveyScores.agencyActive === 1 ? 'High Output' : 'Conservation Mode'}",
    "description": "3-4 sentences about their action/motivation system. Reference dopamine (motivation fuel) and prefrontal cortex (the CEO making decisions). ${surveyScores.agencyActive === 1 ? 'Explain how high drive means quick action but possible burnout.' : 'Explain how conservation mode means careful choices but possible stagnation.'}"
  },
  "os_summary": "4-5 sentences synthesizing all three systems. How do these three parts work together (or against each other)? What's the overall pattern? What does this mean for their daily experience? End with an insight about their unique operating style."
}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "Generate Page 3 OS JSON." }] }],
    systemInstruction: systemPrompt,
  });

  return parseJSON(result.response.text());
}

// ==========================================
// PAGE 4: Friction Map (Life Application)
// ==========================================
async function generatePage4(page2: any, page3: any, userName: string, langInstruction?: string) {
  const model = client!.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `You are the "Life Architect" creating Page 4: The Friction Map.

CONTEXT FROM PREVIOUS PAGES:
- Natural Blueprint: ${page2.nature_description}
- Shadow Side: ${page2.shadow_description}
- Operating System: ${page3.os_summary}

CRITICAL RULES:
1. ${langInstruction || 'LANGUAGE: Simple, relatable English (B1-B2 level).'}
2. SPECIFICITY: Paint SPECIFIC scenarios, not vague statements.
   - BAD: "You might struggle at work"
   - GOOD: "In meetings, you probably have brilliant ideas but hold back, worrying 'what if I's wrong?'"
3. CONNECT TO NEUROSCIENCE: Briefly hint at WHY this friction happens (brain-level).
4. ACTIONABLE TIPS: Each tip should be something they can do TODAY.

CONTENT LENGTH REQUIREMENTS:
- friction_title: 8-15 words, emotionally resonant
- Each friction description: 3-4 sentences (50-70 words)
- Each quick_tip: 2-3 sentences (25-40 words), specific and actionable

OUTPUT (JSON Only):
{
  "section_name": "Where You Get Stuck",
  "friction_title": "A catchy title capturing their main life tension (8-15 words)",
  "friction_anchor": "ONE SHARP SENTENCE defining their core Loop. E.g., 'You stall when perfectionism masks your fear of starting.' (15-25 words)",
  "career_friction": {
    "title": "At Work",
    "description": "3-4 sentences describing a SPECIFIC workplace scenario where their nature creates friction. Paint a scene they'll recognize. End with a hint about the brain mechanism causing this.",
    "quick_tip": "2-3 sentences with a specific, actionable tip. Include WHY it works (simple science)."
  },
  "relationship_friction": {
    "title": "In Relationships",
    "description": "3-4 sentences describing a SPECIFIC relationship scenario - could be romantic, friendship, or family. Make it relatable. Connect to their operating system.",
    "quick_tip": "2-3 sentences with a specific tip for better connection. Include the mechanism."
  },
  "money_friction": {
    "title": "With Money",
    "description": "3-4 sentences describing their specific pattern with finances - spending, saving, earning. How does their nature show up here?",
    "quick_tip": "2-3 sentences with a practical financial habit. Explain why it suits their brain."
  }
}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "Generate Page 4 Friction JSON." }] }],
    systemInstruction: systemPrompt,
  });

  return parseJSON(result.response.text());
}

// ==========================================
// PAGE 5: Action Protocol (Science-Backed)
// ==========================================
async function generatePage5(sajuResult: SajuResult, page3: any, page4: any, surveyScores: SurveyScores, userName: string, langInstruction?: string) {
  const model = client!.getGenerativeModel({ model: "gemini-2.5-flash" });

  const elementCounts = sajuResult.elementCounts;
  const missingElements = Object.entries(elementCounts)
    .filter(([, count]) => (count as number) === 0)
    .map(([el]) => el);
  const weakElements = Object.entries(elementCounts)
    .filter(([, count]) => (count as number) === 1)
    .map(([el]) => el);
  const elementNeeded = missingElements.length > 0 ? missingElements[0] : (weakElements.length > 0 ? weakElements[0] : "balance");

  const elementTips: Record<string, string[]> = {
    wood: ["morning walks in nature", "green plants in workspace", "stretching exercises"],
    fire: ["bright lighting", "social activities", "passion projects"],
    earth: ["grounding routines", "stable meal times", "earthy colors in environment"],
    metal: ["decluttering spaces", "precision activities", "white/metallic aesthetics"],
    water: ["staying hydrated", "flowing movements like swimming", "blue/black color accents"],
    balance: ["varied activities", "flexible routines", "connecting with all elements"]
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

  const systemPrompt = `You are the "Life Architect" creating Page 5: The Action Protocol.

CONTEXT:
- Operating System Issues: ${page3.os_summary}
- Main Life Friction: ${page4.friction_title}
- Operating Level: ${levelInfo}
- Recommended Guidance: ${guidance}
- Element Needed: ${elementNeeded}
- Element Tips: ${elementTips[elementNeeded]?.join(", ") || "balanced lifestyle"}

STANDARDIZED PROTOCOL STRATEGY (MUST USE):
- PROTOCOL NAME: "${protocolStrategy.name}"
- CORE FOCUS: "${protocolStrategy.focus}"
- KEY RITUAL: "${protocolStrategy.keyRitual}" (Must be included as one of the rituals)

CRITICAL RULES:
1. ${langInstruction || 'LANGUAGE: Simple, encouraging English (B1-B2 level).'}
2. SCIENCE-BACKED ONLY: Every ritual MUST be based on real neuroscience or psychology.
3. LEVEL-APPROPRIATE: Since they are at ${levelInfo}, make rituals aligned with "${guidance}".
4. EXPLAIN WHY: For EACH ritual, explain the brain mechanism in simple terms.
5. PERSONALIZED: Connect each ritual to THIS person's specific friction.

CONTENT LENGTH REQUIREMENTS:
- transformation_goal: 1 powerful sentence (15-25 words)
- Each ritual description: 3-4 sentences (50-70 words) - HOW to do it + WHY it works for them. One usage MUST be the Key Ritual ("${protocolStrategy.keyRitual}").
- closing_message: 4-5 sentences (70-100 words), warm and empowering

OUTPUT (JSON Only):
{
  "section_name": "Your Action Protocol",
  "transformation_goal": "A powerful one-sentence vision of who they can become (15-25 words)",
  "protocol_name": "${protocolStrategy.name}",
  "protocol_anchor": "ONE SHARP ACTION COMMAND summary. E.g. 'Stop planning. Start moving.' (5-10 words)",
  "daily_rituals": [
    {
      "name": "${protocolStrategy.keyRitual}",
      "description": "3-4 sentences: How to do it step-by-step. Then explain WHY this practice helps THEIR specific pattern (${surveyScores.typeName}). Use simple neuroscience terms.",
      "when": "Specific timing"
    },
    {
      "name": "Second ritual name",
      "description": "3-4 sentences with how-to and brain science explanation.",
      "when": "Specific timing"
    },
    {
      "name": "Third ritual name",
      "description": "3-4 sentences with how-to and brain science explanation.",
      "when": "Specific timing"
    }
  ],
  "environment_boost": {
    "element_needed": "${elementNeeded}",
    "tips": [
      "First practical tip related to ${elementNeeded} element (10-20 words)",
      "Second practical tip (10-20 words)",
      "Third practical tip (10-20 words)"
    ]
  },
  "closing_message": "4-5 sentences. Start by referencing their identity title. Acknowledge their journey. Paint a picture of their potential. End with an encouraging call to action. Make them feel seen and hopeful."
}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "Generate Page 5 Solution JSON." }] }],
    systemInstruction: systemPrompt,
  });

  return parseJSON(result.response.text());
}

function parseJSON(text: string): any {
  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", text);
    throw new Error("Failed to parse Gemini response");
  }
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
