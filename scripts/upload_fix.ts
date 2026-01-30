
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { db } from "../server/db";
import { contentArchetypes } from "../shared/schema";

const INPUT_FILE = path.join(process.cwd(), "archetypes_missing.json");
const MISSING_ID = "丙寅_ConsciousMaintainer";

async function uploadSpecific() {
    const raw = fs.readFileSync(INPUT_FILE, "utf-8");
    const data = JSON.parse(raw);

    const item = data.find((d: any) => d.id === MISSING_ID);

    if (!item) {
        console.error(`Item ${MISSING_ID} not found in JSON!`);
        process.exit(1);
    }

    console.log(`Uploading ${MISSING_ID}...`);

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
        console.log("Success!");
    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}

uploadSpecific().catch(console.error);
