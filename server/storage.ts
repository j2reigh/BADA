import {
  surveyResults,
  birthPatterns,
  leads,
  sajuResults,
  validCodes,
  type SurveyResult,
  type InsertSurveyResult,
  type BirthPattern,
  type InsertBirthPattern,
  type Lead,
  type InsertLead,
  type SajuResult,
  type InsertSajuResult,
  type ValidCode
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateSlug } from "./slugs";

export interface IStorage {
  // Legacy methods (for backward compatibility)
  createSurveyResult(result: InsertSurveyResult): Promise<SurveyResult>;
  getSurveyResult(id: number): Promise<SurveyResult | undefined>;
  createBirthPattern(pattern: InsertBirthPattern): Promise<BirthPattern>;
  getBirthPatternBySurveyId(surveyResultId: number): Promise<BirthPattern | undefined>;

  // New methods for leads and saju results
  upsertLead(email: string, marketingConsent: boolean): Promise<Lead>;
  getLeadById(id: string): Promise<Lead | undefined>;
  getLeadByToken(token: string): Promise<Lead | undefined>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  verifyLead(id: string): Promise<Lead | undefined>;
  updateLeadEmail(id: string, newEmail: string): Promise<Lead | undefined>;
  regenerateVerificationToken(id: string): Promise<Lead | undefined>;

  createSajuResult(data: InsertSajuResult): Promise<SajuResult>;
  getSajuResultById(id: string): Promise<SajuResult | undefined>;
  getSajuResultBySlug(slug: string): Promise<SajuResult | undefined>;
  getSajuResultsByLeadId(leadId: string): Promise<SajuResult[]>;
  getSajuResultsByEmail(email: string): Promise<SajuResult[]>;
  unlockReport(id: string): Promise<SajuResult | undefined>;
  patchReportData(id: string, patch: Record<string, any>): Promise<SajuResult | undefined>;

  // Unlock code methods
  getValidCode(code: string): Promise<ValidCode | undefined>;
  redeemCode(code: string, reportId: string): Promise<{ success: boolean; error?: string }>;
  createValidCodes(codes: string[], memo?: string): Promise<ValidCode[]>;
}

export class DatabaseStorage implements IStorage {
  // Legacy methods
  async createSurveyResult(insertResult: InsertSurveyResult): Promise<SurveyResult> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .insert(surveyResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getSurveyResult(id: number): Promise<SurveyResult | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(surveyResults)
      .where(eq(surveyResults.id, id));
    return result;
  }

  async createBirthPattern(insertPattern: InsertBirthPattern): Promise<BirthPattern> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .insert(birthPatterns)
      .values(insertPattern)
      .returning();
    return result;
  }

  async getBirthPatternBySurveyId(surveyResultId: number): Promise<BirthPattern | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(birthPatterns)
      .where(eq(birthPatterns.surveyResultId, surveyResultId));
    return result;
  }

  // Lead management methods
  async upsertLead(email: string, marketingConsent: boolean): Promise<Lead> {
    if (!db) throw new Error("Database not initialized");
    const existing = await this.getLeadByEmail(email);

    if (existing) {
      // If already verified, just return existing lead
      if (existing.isVerified) {
        return existing;
      }
      // For unverified leads, update marketing consent and regenerate token
      const [updated] = await db
        .update(leads)
        .set({
          marketingConsent,
          verificationToken: sql`gen_random_uuid()`,
        })
        .where(eq(leads.id, existing.id))
        .returning();
      return updated;
    }

    // Create new lead
    const [newLead] = await db
      .insert(leads)
      .values({ email, marketingConsent })
      .returning();
    return newLead;
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id));
    return result;
  }

  async getLeadByToken(token: string): Promise<Lead | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(leads)
      .where(eq(leads.verificationToken, token));
    return result;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email));
    return result;
  }

  async verifyLead(id: string): Promise<Lead | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .update(leads)
      .set({ isVerified: true })
      .where(eq(leads.id, id))
      .returning();
    return result;
  }

  async updateLeadEmail(id: string, newEmail: string): Promise<Lead | undefined> {
    if (!db) throw new Error("Database not initialized");
    // Only update if not yet verified
    const lead = await this.getLeadById(id);
    if (!lead || lead.isVerified) {
      return undefined;
    }

    const [result] = await db
      .update(leads)
      .set({
        email: newEmail,
        verificationToken: sql`gen_random_uuid()`,
      })
      .where(eq(leads.id, id))
      .returning();
    return result;
  }

  async regenerateVerificationToken(id: string): Promise<Lead | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .update(leads)
      .set({ verificationToken: sql`gen_random_uuid()` })
      .where(eq(leads.id, id))
      .returning();
    return result;
  }

  // Saju Results methods
  async createSajuResult(data: InsertSajuResult): Promise<SajuResult> {
    if (!db) throw new Error("Database not initialized");
    // Insert first to get the generated UUID, then set slug
    const [inserted] = await db
      .insert(sajuResults)
      .values(data)
      .returning();
    try {
      const slug = generateSlug(inserted.id);
      const [result] = await db
        .update(sajuResults)
        .set({ slug })
        .where(eq(sajuResults.id, inserted.id))
        .returning();
      return result;
    } catch {
      // Slug generation failed — return without slug
      return inserted;
    }
  }

  async getSajuResultById(id: string): Promise<SajuResult | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(sajuResults)
      .where(eq(sajuResults.id, id));
    return result;
  }

  async getSajuResultBySlug(slug: string): Promise<SajuResult | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(sajuResults)
      .where(eq(sajuResults.slug, slug));
    return result;
  }

  async getSajuResultsByLeadId(leadId: string): Promise<SajuResult[]> {
    if (!db) throw new Error("Database not initialized");
    const results = await db
      .select()
      .from(sajuResults)
      .where(eq(sajuResults.leadId, leadId));
    return results;
  }

  async getSajuResultsByEmail(email: string): Promise<SajuResult[]> {
    if (!db) throw new Error("Database not initialized");
    const rows = await db
      .select({ sajuResult: sajuResults })
      .from(sajuResults)
      .innerJoin(leads, eq(sajuResults.leadId, leads.id))
      .where(eq(leads.email, email));
    return rows.map((r) => r.sajuResult);
  }

  async unlockReport(id: string): Promise<SajuResult | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .update(sajuResults)
      .set({ isPaid: true })
      .where(eq(sajuResults.id, id))
      .returning();
    return result;
  }

  async patchReportData(id: string, patch: Record<string, any>): Promise<SajuResult | undefined> {
    if (!db) throw new Error("Database not initialized");
    const existing = await this.getSajuResultById(id);
    if (!existing) return undefined;
    const merged = { ...((existing.reportData as any)?.v3Cards || {}), ...patch };
    const [result] = await db
      .update(sajuResults)
      .set({ reportData: { v3Cards: merged } })
      .where(eq(sajuResults.id, id))
      .returning();
    return result;
  }

  // Unlock code methods
  async getValidCode(code: string): Promise<ValidCode | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [result] = await db
      .select()
      .from(validCodes)
      .where(eq(validCodes.code, code.toUpperCase().trim()));
    return result;
  }

  async redeemCode(code: string, reportId: string): Promise<{ success: boolean; error?: string }> {
    if (!db) throw new Error("Database not initialized");

    const normalizedCode = code.toUpperCase().trim();

    // Check if code exists
    const validCode = await this.getValidCode(normalizedCode);
    if (!validCode) {
      return { success: false, error: "INVALID_CODE" };
    }

    // Check if already used (skip for reusable dev codes)
    if (validCode.isUsed && !validCode.isReusable) {
      return { success: false, error: "ALREADY_USED" };
    }

    // Check if report exists
    const report = await this.getSajuResultById(reportId);
    if (!report) {
      return { success: false, error: "REPORT_NOT_FOUND" };
    }

    // Check if report is already paid
    if (report.isPaid) {
      return { success: false, error: "ALREADY_UNLOCKED" };
    }

    // Mark code as used (reusable codes keep usedByReportId of last use for logging)
    await db
      .update(validCodes)
      .set({
        isUsed: true,
        usedByReportId: reportId,
        usedAt: new Date(),
      })
      .where(eq(validCodes.id, validCode.id));

    // Unlock the report
    await this.unlockReport(reportId);

    return { success: true };
  }

  async createValidCodes(codes: string[], memo?: string): Promise<ValidCode[]> {
    if (!db) throw new Error("Database not initialized");
    const results = await db
      .insert(validCodes)
      .values(codes.map(code => ({ code: code.toUpperCase().trim(), memo })))
      .returning();
    return results;
  }
}

export class MemStorage implements IStorage {
  private surveyResults: Map<number, SurveyResult> = new Map();
  private birthPatterns: Map<number, BirthPattern> = new Map();
  private leads: Map<string, Lead> = new Map();
  private sajuResults: Map<string, SajuResult> = new Map();
  private slugMap: Map<string, string> = new Map(); // slug → id

  private surveyIdCounter = 1;
  private birthPatternIdCounter = 1;

  async createSurveyResult(insertResult: InsertSurveyResult): Promise<SurveyResult> {
    const id = this.surveyIdCounter++;
    const result: SurveyResult = { ...insertResult, id, createdAt: new Date() };
    this.surveyResults.set(id, result);
    return result;
  }

  async getSurveyResult(id: number): Promise<SurveyResult | undefined> {
    return this.surveyResults.get(id);
  }

  async createBirthPattern(insertPattern: InsertBirthPattern): Promise<BirthPattern> {
    const id = this.birthPatternIdCounter++;
    const result: BirthPattern = {
      ...insertPattern,
      id,
      createdAt: new Date(),
      birthTimeUnknown: insertPattern.birthTimeUnknown ?? false,
      email: insertPattern.email ?? null, // Added email default handling
      birthHour: insertPattern.birthHour ?? null, // Added birthHour default handling
      birthMinute: insertPattern.birthMinute ?? null, // Added birthMinute default handling
      birthCountry: insertPattern.birthCountry ?? null, // Added birthCountry default handling
      originalUtcOffset: insertPattern.originalUtcOffset ?? null, // Added originalUtcOffset default handling
      latitude: insertPattern.latitude ?? null, // Added latitude default handling
      longitude: insertPattern.longitude ?? null, // Added longitude default handling
      dstCorrectionApplied: insertPattern.dstCorrectionApplied ?? false, // Added dstCorrectionApplied default handling
      consentMarketing: insertPattern.consentMarketing ?? false, // Added consentMarketing default handling
    };
    this.birthPatterns.set(id, result);
    return result;
  }

  async getBirthPatternBySurveyId(surveyResultId: number): Promise<BirthPattern | undefined> {
    return Array.from(this.birthPatterns.values()).find(p => p.surveyResultId === surveyResultId);
  }

  async upsertLead(email: string, marketingConsent: boolean): Promise<Lead> {
    let lead = await this.getLeadByEmail(email);
    if (lead) {
      if (lead.isVerified) return lead;
      lead.marketingConsent = marketingConsent;
      lead.verificationToken = nanoid(); // regenerate
      return lead;
    }
    const id = nanoid();
    const newLead: Lead = {
      id,
      email,
      marketingConsent,
      verificationToken: nanoid(),
      isVerified: false,
      createdAt: new Date()
    };
    this.leads.set(id, newLead);
    return newLead;
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getLeadByToken(token: string): Promise<Lead | undefined> {
    return Array.from(this.leads.values()).find(l => l.verificationToken === token);
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    return Array.from(this.leads.values()).find(l => l.email === email);
  }

  async verifyLead(id: string): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (lead) {
      lead.isVerified = true;
      this.leads.set(id, lead);
    }
    return lead;
  }

  async updateLeadEmail(id: string, newEmail: string): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead || lead.isVerified) return undefined;
    lead.email = newEmail;
    lead.verificationToken = nanoid();
    this.leads.set(id, lead);
    return lead;
  }

  async regenerateVerificationToken(id: string): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (lead) {
      lead.verificationToken = nanoid();
      this.leads.set(id, lead);
    }
    return lead;
  }

  async createSajuResult(data: InsertSajuResult): Promise<SajuResult> {
    const id = nanoid();
    const slug = generateSlug(id);
    const result: SajuResult = {
      ...data,
      id,
      slug,
      isPaid: false,
      language: data.language || "en",
      createdAt: new Date()
    };
    this.sajuResults.set(id, result);
    this.slugMap.set(slug, id);
    return result;
  }

  async getSajuResultById(id: string): Promise<SajuResult | undefined> {
    return this.sajuResults.get(id);
  }

  async getSajuResultBySlug(slug: string): Promise<SajuResult | undefined> {
    const id = this.slugMap.get(slug);
    return id ? this.sajuResults.get(id) : undefined;
  }

  async getSajuResultsByLeadId(leadId: string): Promise<SajuResult[]> {
    return Array.from(this.sajuResults.values()).filter(r => r.leadId === leadId);
  }

  async getSajuResultsByEmail(email: string): Promise<SajuResult[]> {
    const matchingLeadIds = Array.from(this.leads.values())
      .filter(l => l.email === email)
      .map(l => l.id);
    return Array.from(this.sajuResults.values()).filter(r => matchingLeadIds.includes(r.leadId));
  }

  async unlockReport(id: string): Promise<SajuResult | undefined> {
    const result = this.sajuResults.get(id);
    if (result) {
      result.isPaid = true;
      this.sajuResults.set(id, result);
    }
    return result;
  }

  async patchReportData(id: string, patch: Record<string, any>): Promise<SajuResult | undefined> {
    const result = this.sajuResults.get(id);
    if (result) {
      const existing = (result.reportData as any)?.v3Cards || {};
      result.reportData = { v3Cards: { ...existing, ...patch } };
      this.sajuResults.set(id, result);
    }
    return result;
  }

  // Unlock code methods (MemStorage implementation)
  private validCodes: Map<string, ValidCode> = new Map();

  async getValidCode(code: string): Promise<ValidCode | undefined> {
    return this.validCodes.get(code.toUpperCase().trim());
  }

  async redeemCode(code: string, reportId: string): Promise<{ success: boolean; error?: string }> {
    const normalizedCode = code.toUpperCase().trim();
    const validCode = this.validCodes.get(normalizedCode);

    if (!validCode) {
      return { success: false, error: "INVALID_CODE" };
    }
    if (validCode.isUsed && !validCode.isReusable) {
      return { success: false, error: "ALREADY_USED" };
    }

    const report = this.sajuResults.get(reportId);
    if (!report) {
      return { success: false, error: "REPORT_NOT_FOUND" };
    }
    if (report.isPaid) {
      return { success: false, error: "ALREADY_UNLOCKED" };
    }

    validCode.isUsed = true;
    validCode.usedByReportId = reportId;
    validCode.usedAt = new Date();
    this.validCodes.set(normalizedCode, validCode);

    await this.unlockReport(reportId);
    return { success: true };
  }

  async createValidCodes(codes: string[], memo?: string): Promise<ValidCode[]> {
    const results: ValidCode[] = [];
    for (const code of codes) {
      const normalizedCode = code.toUpperCase().trim();
      const validCode: ValidCode = {
        id: nanoid(),
        code: normalizedCode,
        isUsed: false,
        isReusable: false,
        usedByReportId: null,
        usedAt: null,
        createdAt: new Date(),
        memo: memo || null,
      };
      this.validCodes.set(normalizedCode, validCode);
      results.push(validCode);
    }
    return results;
  }
}

export const storage = db ? new DatabaseStorage() : new MemStorage();