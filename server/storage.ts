import { 
  surveyResults, 
  birthPatterns,
  type SurveyResult, 
  type InsertSurveyResult,
  type BirthPattern,
  type InsertBirthPattern
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSurveyResult(result: InsertSurveyResult): Promise<SurveyResult>;
  getSurveyResult(id: number): Promise<SurveyResult | undefined>;
  createBirthPattern(pattern: InsertBirthPattern): Promise<BirthPattern>;
  getBirthPatternBySurveyId(surveyResultId: number): Promise<BirthPattern | undefined>;
}

export class DatabaseStorage implements IStorage {
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
}

export const storage = new DatabaseStorage();
