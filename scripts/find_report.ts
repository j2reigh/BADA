
import "dotenv/config";
import { db } from "../server/db";
import { leads, sajuResults } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

async function findReport() {
    const email = "ibwrhaspati@yahoo.com";
    console.log(`Searching for report linked to: ${email}`);

    if (!db) {
        console.error("Database connection not initialized");
        process.exit(1);
    }

    const lead = await db.query.leads.findFirst({
        where: eq(leads.email, email),
    });

    if (!lead) {
        console.log("No lead found with this email.");
        process.exit(0);
    }

    console.log(`Found lead: ${lead.id} (Verified: ${lead.isVerified})`);

    const reports = await db.query.sajuResults.findMany({
        where: eq(sajuResults.leadId, lead.id),
        orderBy: [desc(sajuResults.createdAt)],
    });

    if (reports.length === 0) {
        console.log("No reports found for this lead.");
    } else {
        console.log(`Found ${reports.length} report(s):`);
        reports.forEach(r => {
            console.log(`- Report ID: ${r.id}`);
            console.log(`- Created At: ${r.createdAt}`);
            console.log(`- Link: http://localhost:5001/results/${r.id}`);
            console.log("-------------------");
        });
    }
    process.exit(0);
}

findReport().catch(console.error);
