
import "dotenv/config";
import { db } from "../server/db";
import { sajuResults } from "../shared/schema";
import { eq } from "drizzle-orm";

const TARGET_LEAD_ID = "47908a2f-223a-473a-a3a0-aa15a7f30acc";

async function inspectLead() {
    console.log(`Inspecting Saju Results for Lead ID: ${TARGET_LEAD_ID}`);

    const results = await db.select().from(sajuResults).where(eq(sajuResults.leadId, TARGET_LEAD_ID));

    if (results.length === 0) {
        console.log("No Saju Result found for this Lead ID.");
    } else {
        // There might be multiple? Usually one per lead but schema allows many?
        // Let's look at the latest
        const latest = results[results.length - 1];
        console.log(`Found result ID: ${latest.id}`);

        const input = latest.userInput as any;
        console.log("User Input Keys:", Object.keys(input || {}));

        if (input) {
            console.log("Survey Scores:", input.surveyScores);
            console.log("Birth Date:", input.birthDate);
        } else {
            console.log("userInput is NULL/Empty");
        }
    }

    process.exit(0);
}

inspectLead().catch(console.error);
