import { surveyResults, type SurveyResult, type InsertSurveyResult } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSurveyResult(result: InsertSurveyResult): Promise<SurveyResult>;
  getSurveyResult(id: number): Promise<SurveyResult | undefined>;
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
}

export const storage = new DatabaseStorage();
