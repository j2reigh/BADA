import { pgTable, text, serial, integer, jsonb, timestamp, real, boolean, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// Leads table - stores verified email contacts with marketing consent
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  marketingConsent: boolean("marketing_consent").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: uuid("verification_token").notNull().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saju Results table - stores survey, birth pattern, and AI report data
export const sajuResults = pgTable("saju_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: uuid("lead_id").notNull().references(() => leads.id),
  userInput: jsonb("user_input").notNull(), // Survey answers + birth pattern info
  sajuData: jsonb("saju_data").notNull(), // Four Pillars calculation results
  reportData: jsonb("report_data").notNull(), // AI-generated report (5-page JSON)
  isPaid: boolean("is_paid").notNull().default(false), // Payment gate for full report
  language: varchar("language", { length: 10 }).notNull().default("en"), // Report language (e.g., "en", "ko", "id")
  createdAt: timestamp("created_at").defaultNow(),
});

// Valid Codes table - stores pre-generated unlock codes
export const validCodes = pgTable("valid_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),
  isReusable: boolean("is_reusable").notNull().default(false), // Dev/test codes that never expire
  usedByReportId: uuid("used_by_report_id").references(() => sajuResults.id),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  memo: text("memo"), // Optional: who received this code
});

// Content Archetypes table - stores deterministic content for 60 Gapja x 8 OS Types
export const contentArchetypes = pgTable("content_archetypes", {
  id: text("id").primaryKey(), // Format: "{GapJa}_{OSType}" e.g. "甲子_StateArchitect"

  // Metadata
  dayPillar: text("day_pillar").notNull(),   // e.g. "甲子"
  osType: text("os_type").notNull(),         // e.g. "State Architect"

  // Identity (Act I)
  identityTitle: text("identity_title").notNull(),      // e.g. "The Calculated Pine"
  natureMetaphor: text("nature_metaphor").notNull(),    // Short definition

  // Narrative (Act II)
  natureDescription: text("nature_description").notNull(),
  shadowDescription: text("shadow_description").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const leadsRelations = relations(leads, ({ many }) => ({
  sajuResults: many(sajuResults),
}));

export const sajuResultsRelations = relations(sajuResults, ({ one }) => ({
  lead: one(leads, {
    fields: [sajuResults.leadId],
    references: [leads.id],
  }),
}));

// Insert schemas
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  verificationToken: true,
});

export const insertSajuResultSchema = createInsertSchema(sajuResults).omit({
  id: true,
  createdAt: true,
});

// Types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type SajuResult = typeof sajuResults.$inferSelect;
export type InsertSajuResult = z.infer<typeof insertSajuResultSchema>;
export type ValidCode = typeof validCodes.$inferSelect;
export type ContentArchetype = typeof contentArchetypes.$inferSelect;

// Legacy types for backward compatibility (to be removed after migration)
export const surveyResults = pgTable("survey_results", {
  id: serial("id").primaryKey(),
  answers: jsonb("answers").notNull(),
  threatScore: integer("threat_score").notNull(),
  threatClarity: integer("threat_clarity").notNull(),
  environmentScore: real("environment_score").notNull(),
  environmentStable: integer("environment_stable").notNull(),
  agencyScore: integer("agency_score").notNull(),
  agencyActive: integer("agency_active").notNull(),
  typeKey: text("type_key").notNull(),
  typeName: text("type_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const birthPatterns = pgTable("birth_patterns", {
  id: serial("id").primaryKey(),
  surveyResultId: integer("survey_result_id").notNull().unique().references(() => surveyResults.id),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  email: text("email"),
  birthYear: integer("birth_year").notNull(),
  birthMonth: integer("birth_month").notNull(),
  birthDay: integer("birth_day").notNull(),
  birthHour: integer("birth_hour"),
  birthMinute: integer("birth_minute"),
  birthTimeUnknown: boolean("birth_time_unknown").notNull().default(false),
  birthCity: text("birth_city").notNull(),
  birthCountry: text("birth_country"),
  originalTimezone: text("original_timezone").notNull(),
  originalUtcOffset: text("original_utc_offset"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  dstCorrectionApplied: boolean("dst_correction_applied").notNull().default(false),
  consentMarketing: boolean("consent_marketing").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSurveyResultSchema = createInsertSchema(surveyResults).omit({
  id: true,
  createdAt: true,
});

export const insertBirthPatternSchema = createInsertSchema(birthPatterns).omit({
  id: true,
  createdAt: true,
});

export type SurveyResult = typeof surveyResults.$inferSelect;
export type InsertSurveyResult = z.infer<typeof insertSurveyResultSchema>;
export type BirthPattern = typeof birthPatterns.$inferSelect;
export type InsertBirthPattern = z.infer<typeof insertBirthPatternSchema>;
