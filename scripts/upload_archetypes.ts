
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { db } from "../server/db";
import { contentArchetypes } from "../shared/schema";
import { sql } from "drizzle-orm";

const INPUT_FILE = path.join(process.cwd(), "archetypes_data.json");

async function uploadArchetypes() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`File not found: ${INPUT_FILE}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(INPUT_FILE, "utf-8");
    const data = JSON.parse(raw);

    console.log(`Found ${data.length} records to upload...`);

    let count = 0;
    // Upsert batch
    for (const item of data) {
        try {
            await db.insert(contentArchetypes).values({
                id: item.id,
                dayPillar: item.dayPillar,
                osType: item.osType,
                identityTitle: item.identityTitle,
                natureMetaphor: item.natureMetaphor,
                natureDescription: item.natureDescription,
                shadowDescription: item.shadowDescription,
            }).onConflictDoUpdate({
                target: contentArchetypes.id,
                set: {
                    identityTitle: item.identityTitle,
                    natureMetaphor: item.natureMetaphor,
                    natureDescription: item.natureDescription,
                    shadowDescription: item.shadowDescription,
                    dayPillar: item.dayPillar,
                    osType: item.osType
                }
            });
            count++;
            if (count % 50 === 0) console.log(`Uploaded ${count}/${data.length}...`);
        } catch (error) {
            console.error(`Failed to upload ${item.id}:`, error);
        }
    }

    console.log(`Upload Complete! ${count} records processed.`);
    process.exit(0);
}

// Run (if called directly)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    uploadArchetypes().catch(console.error);
}
