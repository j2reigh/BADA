
import "dotenv/config";
import { db } from "../server/db";
import { sajuResults, contentArchetypes } from "../shared/schema";
import { eq } from "drizzle-orm";
import { generateLifeBlueprintReport, type SurveyScores } from "../lib/gemini_client";

const TARGET_ID = process.argv[2] || "3acc6f5c-3628-4008-9ab1-1c1d184844eb"; // Default to user provided or hardcoded

async function regenerateAndSave() {
    console.log(`Loading Result Data for ID: ${TARGET_ID}...`);
    const results = await db.select().from(sajuResults).where(eq(sajuResults.id, TARGET_ID));
    const latest = results[0];

    if (!latest) {
        console.error("Lead not found");
        process.exit(1);
    }

    const input = latest.userInput as any;
    const sajuData = latest.sajuData as any;

    // Patch missing stats if checking old data (Legacy Support)
    if (!sajuData.stats) {
        sajuData.stats = { operatingRate: 50 };
    }

    // FETCH ARCHETYPE
    const dayPillar = `${sajuData.fourPillars.day.gan}${sajuData.fourPillars.day.zhi}`;
    const osTypeClean = input.surveyScores.typeName.replace(/\s+/g, "");
    const archetypeId = `${dayPillar}_${osTypeClean}`;

    console.log(`Looking up Archetype: ${archetypeId}`);
    const archetype = await db.query.contentArchetypes.findFirst({
        where: eq(contentArchetypes.id, archetypeId),
    });

    console.log("Generating Report...");
    const report = await generateLifeBlueprintReport(
        sajuData,
        input.surveyScores,
        input.name,
        archetype
    );

    console.log("Saving to DB...");
    await db.update(sajuResults)
        .set({ reportData: report })
        .where(eq(sajuResults.id, latest.id));

    console.log("---------------------------------------------------");
    console.log(`✅ Report Updated!`);
    console.log(`🔗 Link: http://localhost:5001/results/${latest.id}`);
    console.log("---------------------------------------------------");

    process.exit(0);
}

regenerateAndSave().catch(console.error);
