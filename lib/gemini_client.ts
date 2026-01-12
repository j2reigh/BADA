/**
 * Gemini AI Report Generator
 * Generates personalized Life Blueprint Reports using Google Generative AI
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DAY_MASTER_MAP, TEN_GODS_MAP } from "./saju_constants";
import { FIVE_ELEMENTS_INFO } from "./saju_knowledge";
import type { SajuResult } from "./saju_calculator";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    "GEMINI_API_KEY not found in environment variables. Please add it to Replit Secrets."
  );
}

const client = new GoogleGenerativeAI(API_KEY);

// OS Type mappings for background selection
const OS_TYPE_BACKGROUNDS: Record<string, string> = {
  "State Architect": "bg_type_03",      // High Agency / Low Ambiguity / Low Threat
  "Silent Sentinel": "bg_type_08",      // Low Agency / Low Ambiguity / High Threat
  "Master Builder": "bg_type_02",       // High Agency / High Ambiguity / High Threat
  "Safe Strategist": "bg_type_06",      // Low Agency / High Ambiguity / High Threat
  "Fire Converter": "bg_type_01",       // High Agency / High Ambiguity / Low Threat
  "Emotional Drifter": "bg_type_05",    // Low Agency / High Ambiguity / Low Threat
  "Conscious Maintainer": "bg_type_03", // High Agency / Low Ambiguity / Low Threat
  "Passive Floater": "bg_type_07",      // Low Agency / Low Ambiguity / Low Threat
};

// Element to overlay mapping
const ELEMENT_OVERLAYS: Record<string, string> = {
  wood: "overlay_wood",
  fire: "overlay_fire",
  earth: "overlay_earth",
  metal: "overlay_metal",
  water: "overlay_water",
};

// Day Master to base identity mapping
const DAY_MASTER_IDENTITY: Record<string, { noun: string; element: string }> = {
  "甲": { noun: "The Pioneer", element: "wood" },
  "乙": { noun: "The Architect", element: "wood" },
  "丙": { noun: "The Beacon", element: "fire" },
  "丁": { noun: "The Visionary", element: "fire" },
  "戊": { noun: "The Foundation", element: "earth" },
  "己": { noun: "The Groundbreaker", element: "earth" },
  "庚": { noun: "The Analyst", element: "metal" },
  "辛": { noun: "The Essentialist", element: "metal" },
  "壬": { noun: "The Navigator", element: "water" },
  "癸": { noun: "The Philosopher", element: "water" },
};

// Element to adjective mapping
const ELEMENT_ADJECTIVES: Record<string, string[]> = {
  wood: ["Deep-rooted", "Growing", "Vertical", "Resilient"],
  fire: ["Luminous", "Radiant", "Passionate", "Tropical"],
  earth: ["Solid", "Steadfast", "Grounded", "Unshakable"],
  metal: ["Refined", "Sharp", "Precise", "Polished"],
  water: ["Fluid", "Deep", "Infinite", "Adaptive"],
};

export interface LifeBlueprintReport {
  page1_identity: {
    title: string;
    sub_headline: string;
    visual_concept: {
      background_id: string;
      overlay_id: string;
    };
  };
  page2_hardware: {
    section_name: string;
    blueprint_summary: string;
    core_insight: string[];
  };
  page3_os: {
    section_name: string;
    diagnosis_summary: string;
    analysis_points: string[];
  };
  page4_mismatch: {
    section_name: string;
    insight_title: string;
    conflict_explanation: string[];
  };
  page5_solution: {
    section_name: string;
    goal: string;
    protocol_name: string;
    steps: Array<{ step: number; action: string }>;
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

/**
 * Generate a personalized Life Blueprint Report using Gemini AI
 */
export async function generateLifeBlueprintReport(
  sajuResult: SajuResult,
  surveyScores: SurveyScores,
  userName: string = "Friend"
): Promise<LifeBlueprintReport> {
  try {
    const dayMasterGan = sajuResult.fourPillars.day.gan;
    const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];
    const identityInfo = DAY_MASTER_IDENTITY[dayMasterGan];

    if (!dayMasterInfo || !identityInfo) {
      throw new Error(`Day Master "${dayMasterGan}" not found in mappings`);
    }

    // Find dominant element
    const elementCounts = sajuResult.elementCounts;
    const dominantElement = Object.entries(elementCounts).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0];
    const dominantElementName = dominantElement[0];

    // Generate title using 80/20 rule
    const adjectives = ELEMENT_ADJECTIVES[dominantElementName] || ["Balanced"];
    const adjective = adjectives[0];
    const synthesizedTitle = `${adjective} ${identityInfo.noun}`;

    // Select visual assets
    const backgroundId = OS_TYPE_BACKGROUNDS[surveyScores.typeName] || "bg_type_01";
    const overlayId = ELEMENT_OVERLAYS[dominantElementName] || "overlay_water";

    // Collect Ten Gods
    const tenGodsInChart = new Set<string>();
    tenGodsInChart.add(sajuResult.fourPillars.year.ganGod);
    tenGodsInChart.add(sajuResult.fourPillars.month.ganGod);
    tenGodsInChart.add(sajuResult.fourPillars.day.ganGod);
    tenGodsInChart.add(sajuResult.fourPillars.hour.ganGod);

    const tenGodsContext = Array.from(tenGodsInChart)
      .map((tenGod) => {
        const info = TEN_GODS_MAP[tenGod];
        return info ? `${info.english}: ${info.meaning}` : tenGod;
      })
      .join("; ");

    // Build element balance description
    const elementBalanceDesc = Object.entries(elementCounts)
      .map(([element, count]) => {
        const info = FIVE_ELEMENTS_INFO[element];
        return `${element.toUpperCase()} (${count}): ${info?.keyword || ""}`;
      })
      .join(", ");

    // Build system prompt
    const systemPrompt = `You are the "Life Architect" for BADA. Your goal is to analyze a user's innate nature (Hardware) and their current neurological patterns (OS) to generate a personalized "Life Blueprint Report."

# Brand Tone & Voice
1. **Refined & Grounded:** Use B2-C1 level English. Professional, sophisticated, yet intuitive. Avoid academic jargon.
2. **Metaphorical yet Scientific:** Blend "Nature" metaphors with "Tech/Neuro" terms (OS, Latency, Overheat, Agency).
3. **No Mysticism:** Translate Saju terms into "Nature" metaphors. NEVER use terms like "Day Master," "Ten Gods," or "Gap-Ja" in the output.

# User's Data Context (Internal Reference Only)
- Core Element Nature: ${dayMasterInfo.name} (${dayMasterInfo.archetype})
- Core Traits: ${dayMasterInfo.core}
- Strengths: ${dayMasterInfo.strength}
- Weaknesses: ${dayMasterInfo.weakness}
- Psychology: ${dayMasterInfo.psychology}
- Archetypal Patterns: ${tenGodsContext}
- Element Balance: ${elementBalanceDesc}
- Dominant Element: ${dominantElementName.toUpperCase()} (${dominantElement[1]} instances)

# User's OS Data
- Type: ${surveyScores.typeName} (${surveyScores.typeKey})
- Threat Clarity: ${surveyScores.threatClarity === 1 ? "High" : "Low"} (Score: ${surveyScores.threatScore}/3)
- Environment Stability: ${surveyScores.environmentStable === 1 ? "Stable" : "Unstable"} (Score: ${surveyScores.environmentScore}/2)
- Agency Level: ${surveyScores.agencyActive === 1 ? "High" : "Low"} (Score: ${surveyScores.agencyScore}/3)

Write in a warm, encouraging tone. Be specific. Avoid generic advice.`;

    // Build user prompt
    const userPrompt = `Generate a Life Blueprint Report for ${userName}.

Their synthesized identity title is: "${synthesizedTitle}"

Create a JSON report with these exact sections. Return ONLY valid JSON, no markdown code blocks:

{
  "page1_identity": {
    "title": "${synthesizedTitle}",
    "sub_headline": "One-sentence punchline summarizing their Hardware (innate nature) + OS (current behavioral state). Make it punchy and memorable.",
    "visual_concept": {
      "background_id": "${backgroundId}",
      "overlay_id": "${overlayId}"
    }
  },
  "page2_hardware": {
    "section_name": "Your Natural Blueprint",
    "blueprint_summary": "2-3 sentences describing their innate engine using nature metaphors (not Saju terms). What kind of natural force are they?",
    "core_insight": ["Insight about their core drive", "Insight about their natural strength"]
  },
  "page3_os": {
    "section_name": "Your Current Operating System",
    "diagnosis_summary": "2-3 sentences analyzing their ${surveyScores.typeName} pattern. How is their current OS running?",
    "analysis_points": ["Point about threat response", "Point about environment sensitivity", "Point about agency orientation"]
  },
  "page4_mismatch": {
    "section_name": "The Core Tension",
    "insight_title": "A catchy name for their specific friction pattern (e.g., 'The Comfort Trap', 'The Overheating Loop')",
    "conflict_explanation": ["How their hardware and OS create friction", "What this tension looks like in daily life", "The hidden cost of this pattern"]
  },
  "page5_solution": {
    "section_name": "Your Action Protocol",
    "goal": "One sentence describing the transformation goal",
    "protocol_name": "A memorable name for their personalized protocol",
    "steps": [
      {"step": 1, "action": "A specific cognitive task"},
      {"step": 2, "action": "A specific environmental change"},
      {"step": 3, "action": "A specific mindset shift"}
    ],
    "closing_message": "An empowering closing sentence that ties back to their identity title"
  }
}

Make the content specific to this person's unique combination. Don't be generic. Return ONLY the JSON object.`;

    // Call Gemini API
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: systemPrompt,
    });

    const response = result.response;
    let reportText = response.text();

    // Clean up response - remove markdown code blocks if present
    reportText = reportText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    // Parse JSON response
    const report: LifeBlueprintReport = JSON.parse(reportText);

    // Ensure visual concept has correct values
    report.page1_identity.visual_concept.background_id = backgroundId;
    report.page1_identity.visual_concept.overlay_id = overlayId;

    return report;
  } catch (error) {
    throw new Error(
      `Failed to generate Life Blueprint Report: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateLifeBlueprintReport instead
 */
export async function generateSajuReport(
  sajuResult: SajuResult,
  userName: string = "Friend"
): Promise<string> {
  // Create default survey scores for legacy compatibility
  const defaultScores: SurveyScores = {
    threatScore: 1,
    threatClarity: 0,
    environmentScore: 1,
    environmentStable: 1,
    agencyScore: 1,
    agencyActive: 0,
    typeKey: "T0-E1-A0",
    typeName: "Passive Floater",
  };

  const report = await generateLifeBlueprintReport(sajuResult, defaultScores, userName);
  
  // Convert to markdown for legacy compatibility
  return `# ${report.page1_identity.title}

${report.page1_identity.sub_headline}

## ${report.page2_hardware.section_name}

${report.page2_hardware.blueprint_summary}

${report.page2_hardware.core_insight.map(i => `- ${i}`).join("\n")}

## ${report.page3_os.section_name}

${report.page3_os.diagnosis_summary}

${report.page3_os.analysis_points.map(p => `- ${p}`).join("\n")}

## ${report.page4_mismatch.section_name}: ${report.page4_mismatch.insight_title}

${report.page4_mismatch.conflict_explanation.map(e => `- ${e}`).join("\n")}

## ${report.page5_solution.section_name}: ${report.page5_solution.protocol_name}

**Goal:** ${report.page5_solution.goal}

${report.page5_solution.steps.map(s => `${s.step}. ${s.action}`).join("\n")}

---

${report.page5_solution.closing_message}`;
}
