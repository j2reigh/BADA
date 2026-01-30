
import "dotenv/config";
import { db } from "../server/db";
import { contentArchetypes } from "../shared/schema";
import { GAPJA_NOUNS, OS_TYPE_ADJECTIVES } from "../lib/standardization_dictionaries";

async function checkMissing() {
    const allArchetypes = await db.query.contentArchetypes.findMany();
    const existingIds = new Set(allArchetypes.map(a => a.id));

    console.log(`DB Count: ${existingIds.size}`);

    const gapjas = Object.keys(GAPJA_NOUNS);
    const osTypes = Object.keys(OS_TYPE_ADJECTIVES);

    let missingCount = 0;

    for (const gapja of gapjas) {
        for (const osType of osTypes) {
            // Construct ID exactly as in generation script
            const id = `${gapja}_${osType.replace(/\s+/g, '')}`;

            if (!existingIds.has(id)) {
                console.log(`MISSING: ${id}`);
                missingCount++;
            }
        }
    }

    if (missingCount === 0) {
        console.log("All 480 archetypes are present!");
    } else {
        console.log(`Total Missing: ${missingCount}`);
    }

    process.exit(0);
}

checkMissing().catch(console.error);
