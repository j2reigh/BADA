/**
 * Gemini AI Report Generator
 * Generates personalized Saju reports using Google Generative AI
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DAY_MASTER_MAP, TEN_GODS_MAP } from "./saju_constants";
import type { SajuResult } from "./saju_calculator";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    "❌ GEMINI_API_KEY not found in environment variables. Please add it to Replit Secrets."
  );
}

const client = new GoogleGenerativeAI(API_KEY);

/**
 * Generate a personalized Saju report using Gemini AI
 * @param sajuResult - The calculated Saju result from calculateSaju()
 * @param userName - User's name for personalization (optional)
 * @returns Promise<string> - Markdown-formatted report
 */
export async function generateSajuReport(
  sajuResult: SajuResult,
  userName: string = "Friend"
): Promise<string> {
  try {
    // Extract Day Master information
    const dayMasterGan = sajuResult.fourPillars.day.gan;
    const dayMasterInfo = DAY_MASTER_MAP[dayMasterGan];

    if (!dayMasterInfo) {
      throw new Error(`Day Master "${dayMasterGan}" not found in mappings`);
    }

    // Collect all Ten Gods in the chart
    const tenGodsInChart = new Set<string>();
    tenGodsInChart.add(sajuResult.fourPillars.year.ganGod);
    tenGodsInChart.add(sajuResult.fourPillars.month.ganGod);
    tenGodsInChart.add(sajuResult.fourPillars.day.ganGod);
    tenGodsInChart.add(sajuResult.fourPillars.hour.ganGod);

    // Build Ten Gods context (only relevant ones)
    const tenGodsContext = Array.from(tenGodsInChart)
      .map((tenGod) => {
        const info = TEN_GODS_MAP[tenGod];
        return `- **${info.english}** (${tenGod}): ${info.meaning}`;
      })
      .join("\n");

    // Find strongest element
    const elementCounts = sajuResult.elementCounts;
    const strongestElement = Object.entries(elementCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Construct dynamic System Prompt
    const systemPrompt = `You are an insightful career & life coach using Eastern metaphysics and Saju (Korean Four Pillars of Destiny) analysis. 
    
Your role is to provide actionable, compassionate insights that help people understand their inherent patterns and navigate life's challenges.

**User's Core Identity:**
- Day Master (Ilju): ${dayMasterGan} (${dayMasterInfo.name})
- Archetype: ${dayMasterInfo.archetype}
- Core Nature: ${dayMasterInfo.core}
- Psychology: "${dayMasterInfo.psychology}"

**Ten Gods in Their Chart:**
${tenGodsContext}

**Element Balance:**
${Object.entries(elementCounts)
  .map(([element, count]) => `- ${element}: ${count}`)
  .join("\n")}
(Strongest: ${strongestElement[0]} with ${strongestElement[1]} instances)

Write in a warm, encouraging tone. Be specific to their archetype. Avoid generic advice.`;

    // Construct User Prompt
    const userPrompt = `Please generate a personalized Saju report for ${userName}.

They are a **${dayMasterInfo.archetype}** (Day Master: ${dayMasterGan}).

Their chart contains these Ten Gods: ${Array.from(tenGodsInChart)
      .map((tenGod) => TEN_GODS_MAP[tenGod].english)
      .join(", ")}.

Element balance is dominated by ${strongestElement[0]}.

Write a 3-section report in markdown:

**1. Core Identity (Your Operating System)**
Explain what it means to be a ${dayMasterInfo.archetype}. What's their fundamental nature? What drives them?

**2. Current Friction (Where It Gets Hard)**
Identify the natural tensions in their chart. What are the shadowy sides of their strengths? Where might they struggle?

**3. Actionable Solution**
Give 2-3 concrete, practical suggestions for how they can work WITH their nature (not against it) to move forward in their career and relationships.

Format the output as clean markdown. Be warm, insightful, and actionable. Don't be generic.`;

    // Call Gemini API
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userPrompt,
            },
          ],
        },
      ],
      systemInstruction: systemPrompt,
    });

    const response = result.response;
    const reportText = response.text();

    return reportText;
  } catch (error) {
    throw new Error(
      `Failed to generate Saju report: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
