
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { GAPJA_NOUNS, OS_TYPE_ADJECTIVES } from "../lib/standardization_dictionaries";

// Constants
const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_FILE = path.join(process.cwd(), "archetypes_data.json");

if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}

const client = new GoogleGenerativeAI(API_KEY);
const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

// Types
interface ArchetypeContent {
    id: string; // "{GapJa}_{OSType}"
    dayPillar: string;
    osType: string;
    identityTitle: string; // Deterministic: Adjective + Noun
    natureMetaphor: string;
    natureDescription: string;
    shadowDescription: string;
}

// Helper to delay (avoid rate limits)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateArchetypeBatch() {
    // Check for test mode
    const isTestMode = process.argv.includes("test");
    const limit = isTestMode ? 2 : Infinity;
    if (isTestMode) console.log("Running in TEST MODE: Limiting to 2 items.");

    const results: ArchetypeContent[] = [];
    const gapjas = Object.keys(GAPJA_NOUNS);
    const osTypes = Object.keys(OS_TYPE_ADJECTIVES);

    console.log(`Starting generation for ${gapjas.length * osTypes.length} combinations...`);

    let count = 0;

    // We will process in chunks to save progress
    mainLoop: for (const gapja of gapjas) {
        for (const osType of osTypes) {
            if (count >= limit) break mainLoop;

            const noun = GAPJA_NOUNS[gapja]; // e.g. "Pine on the Water"

            // Get adjective options
            const [adjOption1, adjOption2] = OS_TYPE_ADJECTIVES[osType];

            console.log(`[${count}/${gapjas.length * osTypes.length}] Generating for: ${gapja} + ${osType} (${noun})`);

            try {
                // We pass BOTH options to the AI and ask it to pick the best title
                const content = await generateContentForArchetype(
                    gapja,
                    osType,
                    noun,
                    [adjOption1, adjOption2]
                );
                results.push(content);

                // Save intermediate progress every 10 items
                if (count % 10 === 0) {
                    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
                    console.log(`Saved progress to ${OUTPUT_FILE}`);
                }

                // Rate limit protection
                await delay(1000);

            } catch (error) {
                console.error(`Failed to generate for ${id}:`, error);
                // Continue loop even if one fails
            }
        }
    }

    // Final Save
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`Generation Complete! Saved ${results.length} items to ${OUTPUT_FILE}`);
}

async function generateContentForArchetype(
    gapja: string,
    osType: string,
    noun: string,
    adjectives: [string, string]
): Promise<ArchetypeContent> {

    const systemPrompt = `You are the "Life Architect".
  Construct the perfect Identity Title and Narrative.
  
  INPUTS:
  - Nature Image: "${noun}"
  - Operating Style: "${osType}"
  - Adjective Options: ["${adjectives[0]}", "${adjectives[1]}"]
  
  TASK 1: SELECT THE BEST TITLE
  Which adjective fits better with "${noun}" poetically?
  - Option A: "The ${adjectives[0]} ${noun}"
  - Option B: "The ${adjectives[1]} ${noun}"
  Choose the one that sounds more natural, evocative, and less awkward.
  
  TASK 2: WRITE THE NARRATIVE
  Write 3 short, poetic but grounded paragraphs based on the chosen title.
  
  1. Nature Metaphor (1 sentence definition):
     - A vivid image combining the nature with the style.
     
  2. Nature Description (3-4 sentences):
     - Describe the strengths and natural flow. Tone: Premium, empowering.
     
  3. Shadow Description (3-4 sentences):
     - Describe potential pitfalls. Tone: Honest, compassionate.
     
  OUTPUT JSON ONLY:
  {
    "selectedAdjective": "${adjectives[0]}" or "${adjectives[1]}",
    "natureMetaphor": "...",
    "natureDescription": "...",
    "shadowDescription": "..."
  }
  `;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Generate JSON" }] }],
        systemInstruction: systemPrompt,
    });

    const text = result.response.text();
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const json = JSON.parse(cleaned);

    const identityTitle = `The ${json.selectedAdjective} ${noun}`;

    return {
        id: `${gapja}_${osType.replace(/\s+/g, '')}`,
        dayPillar: gapja,
        osType: osType,
        identityTitle: identityTitle,
        natureMetaphor: json.natureMetaphor,
        natureDescription: json.natureDescription,
        shadowDescription: json.shadowDescription
    };
}

// Run (if called directly)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateArchetypeBatch().catch(console.error);
}
