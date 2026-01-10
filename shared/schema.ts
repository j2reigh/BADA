import { pgTable, text, serial, integer, jsonb, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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

// Birth patterns table - stores birth data linked to survey results
// All datetime fields are stored as KST (after DST correction)
export const birthPatterns = pgTable("birth_patterns", {
  id: serial("id").primaryKey(),
  surveyResultId: integer("survey_result_id").notNull().unique().references(() => surveyResults.id),
  
  // Personal info
  name: text("name").notNull(),
  gender: text("gender").notNull(), // "male" | "female" | "other"
  email: text("email"),
  
  // Birth datetime stored as KST (after DST correction applied)
  birthYear: integer("birth_year").notNull(),
  birthMonth: integer("birth_month").notNull(),
  birthDay: integer("birth_day").notNull(),
  birthHour: integer("birth_hour"), // null if unknown
  birthMinute: integer("birth_minute"), // null if unknown
  birthTimeUnknown: boolean("birth_time_unknown").notNull().default(false),
  
  // Original location info (for reference)
  birthCity: text("birth_city").notNull(),
  birthCountry: text("birth_country"),
  originalTimezone: text("original_timezone").notNull(), // e.g. "America/New_York"
  originalUtcOffset: text("original_utc_offset"), // e.g. "-04:00"
  latitude: real("latitude"),
  longitude: real("longitude"),
  
  // DST correction applied
  dstCorrectionApplied: boolean("dst_correction_applied").notNull().default(false),
  
  // Consent
  consentMarketing: boolean("consent_marketing").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const surveyResultsRelations = relations(surveyResults, ({ one }) => ({
  birthPattern: one(birthPatterns, {
    fields: [surveyResults.id],
    references: [birthPatterns.surveyResultId],
  }),
}));

export const birthPatternsRelations = relations(birthPatterns, ({ one }) => ({
  surveyResult: one(surveyResults, {
    fields: [birthPatterns.surveyResultId],
    references: [surveyResults.id],
  }),
}));

export const insertBirthPatternSchema = createInsertSchema(birthPatterns).omit({
  id: true,
  createdAt: true,
});

export type BirthPattern = typeof birthPatterns.$inferSelect;
export type InsertBirthPattern = z.infer<typeof insertBirthPatternSchema>;
