import { pgTable, text, serial, integer, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const surveyResults = pgTable("survey_results", {
  id: serial("id").primaryKey(),
  answers: jsonb("answers").notNull(), // Stores { q1: "A", q2: "B", ... }
  threatScore: integer("threat_score").notNull(),
  threatClarity: integer("threat_clarity").notNull(), // 0 or 1
  environmentScore: real("environment_score").notNull(), // Can be 1.5
  environmentStable: integer("environment_stable").notNull(), // 0 or 1
  agencyScore: integer("agency_score").notNull(),
  agencyActive: integer("agency_active").notNull(), // 0 or 1
  typeKey: text("type_key").notNull(), // e.g. "T1-E0-A1"
  typeName: text("type_name").notNull(), // e.g. "State Architect"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSurveyResultSchema = createInsertSchema(surveyResults).omit({
  id: true,
  createdAt: true,
});

export type SurveyResult = typeof surveyResults.$inferSelect;
export type InsertSurveyResult = z.infer<typeof insertSurveyResultSchema>;
