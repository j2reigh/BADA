
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { GAPJA_NOUNS, OS_TYPE_ADJECTIVES } from "../lib/standardization_dictionaries";

const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_FILE = path.join(process.cwd(), "archetypes_missing.json");

if (!API_KEY) process.exit(1);

const client = new GoogleGenerativeAI(API_KEY);
const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateMissing() {
    const gapja = "丙寅";
    const osType = "Conscious Maintainer";
    const noun = GAPJA_NOUNS[gapja];
    const [adj1, adj2] = OS_TYPE_ADJECTIVES[osType];

    console.log(`Generating MISSING: ${gapja} + ${osType}`);

    const systemPrompt = `You are the "Life Architect".
  Construct the perfect Identity Title and Narrative.
  
  INPUTS:
  - Nature Image: "${noun}"
  - Operating Style: "${osType}"
  - Adjective Options: ["${adj1}", "${adj2}"]
  
  TASK 1: SELECT THE BEST TITLE
  Which adjective fits better with "${noun}" poetically?
  - Option A: "The ${adj1} ${noun}"
  - Option B: "The ${adj2} ${noun}"
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
    "selectedAdjective": "${adj1}" or "${adj2}",
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

    const item = {
        id: `${gapja}_${osType.replace(/\s+/g, '')}`,
        dayPillar: gapja,
        osType: osType,
        identityTitle: identityTitle,
        natureMetaphor: json.natureMetaphor,
        natureDescription: json.natureDescription,
        shadowDescription: json.shadowDescription
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify([item], null, 2));
    console.log("Saved missing item to archetypes_missing.json");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateMissing().catch(console.error);
}
