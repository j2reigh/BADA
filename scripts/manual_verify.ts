
import "dotenv/config";
import { db } from "../server/db";
import { sajuResults, contentArchetypes } from "../shared/schema";
import { eq } from "drizzle-orm";
import { generateLifeBlueprintReport, type SurveyScores } from "../lib/gemini_client";
import * as fs from "fs";

const TARGET_LEAD_ID = "47908a2f-223a-473a-a3a0-aa15a7f30acc";

async function runVerify() {
    console.log("Loading Lead Data...");
    const results = await db.select().from(sajuResults).where(eq(sajuResults.leadId, TARGET_LEAD_ID));
    const latest = results[results.length - 1];

    if (!latest) {
        console.error("Lead not found");
        process.exit(1);
    }

    const input = latest.userInput as any;
    const sajuData = latest.sajuData as any;

    // Patch missing stats if checking old data
    if (!sajuData.stats) {
        sajuData.stats = { operatingRate: 50 }; // Mock value
    }

    console.log(`User: ${input.name}, Day: ${sajuData.fourPillars.day.gan}${sajuData.fourPillars.day.zhi}`);
    console.log(`OS Type: ${input.surveyScores.typeName}`);

    // FETCH ARCHETYPE (Standardization Logic)
    const dayPillar = `${sajuData.fourPillars.day.gan}${sajuData.fourPillars.day.zhi}`;
    const osTypeClean = input.surveyScores.typeName.replace(/\s+/g, "");
    const archetypeId = `${dayPillar}_${osTypeClean}`;

    console.log(`Looking up Archetype: ${archetypeId}`);
    const archetype = await db.query.contentArchetypes.findFirst({
        where: eq(contentArchetypes.id, archetypeId),
    });

    if (archetype) {
        console.log(`✅ FOUND ARCHETYPE: ${archetype.identityTitle}`);
    } else {
        console.log(`❌ ARCHETYPE NOT FOUND!`);
    }

    console.log("Generating Report...");
    const report = await generateLifeBlueprintReport(
        sajuData,
        input.surveyScores,
        input.name,
        archetype
    );

    console.log("Report Generated!");
    console.log("Title in Report:", report.page1_identity.title);

    // Save to file for inspection
    fs.writeFileSync("test_report_output.json", JSON.stringify(report, null, 2));
    console.log("Saved to test_report_output.json");

    process.exit(0);
}

runVerify().catch(console.error);
