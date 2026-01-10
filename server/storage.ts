import { 
  surveyResults, 
  birthPatterns,
  leads,
  sajuResults,
  type SurveyResult, 
  type InsertSurveyResult,
  type BirthPattern,
  type InsertBirthPattern,
  type Lead,
  type InsertLead,
  type SajuResult,
  type InsertSajuResult
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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
  getSajuResultsByLeadId(leadId: string): Promise<SajuResult[]>;
}

export class DatabaseStorage implements IStorage {
  // Legacy methods
  async createSurveyResult(insertResult: InsertSurveyResult): Promise<SurveyResult> {
    const [result] = await db
      .insert(surveyResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getSurveyResult(id: number): Promise<SurveyResult | undefined> {
    const [result] = await db
      .select()
      .from(surveyResults)
      .where(eq(surveyResults.id, id));
    return result;
  }

  async createBirthPattern(insertPattern: InsertBirthPattern): Promise<BirthPattern> {
    const [result] = await db
      .insert(birthPatterns)
      .values(insertPattern)
      .returning();
    return result;
  }

  async getBirthPatternBySurveyId(surveyResultId: number): Promise<BirthPattern | undefined> {
    const [result] = await db
      .select()
      .from(birthPatterns)
      .where(eq(birthPatterns.surveyResultId, surveyResultId));
    return result;
  }

  // Lead management methods
  async upsertLead(email: string, marketingConsent: boolean): Promise<Lead> {
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
    const [result] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id));
    return result;
  }

  async getLeadByToken(token: string): Promise<Lead | undefined> {
    const [result] = await db
      .select()
      .from(leads)
      .where(eq(leads.verificationToken, token));
    return result;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const [result] = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email));
    return result;
  }

  async verifyLead(id: string): Promise<Lead | undefined> {
    const [result] = await db
      .update(leads)
      .set({ isVerified: true })
      .where(eq(leads.id, id))
      .returning();
    return result;
  }

  async updateLeadEmail(id: string, newEmail: string): Promise<Lead | undefined> {
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
    const [result] = await db
      .update(leads)
      .set({ verificationToken: sql`gen_random_uuid()` })
      .where(eq(leads.id, id))
      .returning();
    return result;
  }

  // Saju Results methods
  async createSajuResult(data: InsertSajuResult): Promise<SajuResult> {
    const [result] = await db
      .insert(sajuResults)
      .values(data)
      .returning();
    return result;
  }

  async getSajuResultById(id: string): Promise<SajuResult | undefined> {
    const [result] = await db
      .select()
      .from(sajuResults)
      .where(eq(sajuResults.id, id));
    return result;
  }

  async getSajuResultsByLeadId(leadId: string): Promise<SajuResult[]> {
    const results = await db
      .select()
      .from(sajuResults)
      .where(eq(sajuResults.leadId, leadId));
    return results;
  }
}

export const storage = new DatabaseStorage();
