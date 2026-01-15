import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "SUPABASE_DATABASE_URL or DATABASE_URL not set. Falling back to in-memory storage.",
  );
}

export const pool = connectionString ? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
}) : null;
export const db = connectionString ? drizzle(pool!, { schema }) : null;
