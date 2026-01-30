
import "dotenv/config";
import { db } from "../server/db";
import { sajuResults } from "@shared/schema";
import { eq } from "drizzle-orm";

async function inspectReport() {
    const reportId = "5cb72fc2-761f-41ae-bd33-afab39baaf8a";
    console.log(`Inspecting report data for ID: ${reportId}`);

    if (!db) {
        console.error("Database connection not initialized");
        process.exit(1);
    }

    const result = await db.query.sajuResults.findFirst({
        where: eq(sajuResults.id, reportId),
    });

    if (!result) {
        console.log("Report not found!");
        process.exit(1);
    }

    console.log("Report found.");
    console.log("Paid Status:", result.isPaid);
    console.log("Has reportData?", !!result.reportData);

    if (result.reportData) {
        const data = result.reportData as any;
        console.log("Page 1 Keys:", Object.keys(data.page1_identity || {}));
        console.log("Page 1 Content Preview:", JSON.stringify(data.page1_identity).substring(0, 200));
    } else {
        console.log("reportData is NULL or EMPTY");
    }

    process.exit(0);
}

inspectReport().catch(console.error);
