import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { searchCities } from "../lib/photon_client";
import { getCorrectedKST } from "../lib/time_utils";
import type { InsertBirthPattern } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // City search endpoint using Photon API
  app.get("/api/cities/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const results = await searchCities(query, 8);
      res.json(results);
    } catch (error) {
      console.error("City search error:", error);
      res.status(500).json({ message: "Failed to search cities" });
    }
  });

  app.post(api.survey.submit.path, async (req, res) => {
    try {
      const input = api.survey.submit.input.parse(req.body);
      const result = await storage.createSurveyResult(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Birth pattern submission with KST conversion
  const birthPatternInputSchema = z.object({
    surveyResultId: z.number(),
    name: z.string().min(1),
    gender: z.enum(["male", "female", "other"]),
    email: z.string().email().optional().or(z.literal("")),
    
    // Original birth datetime (local time at birthplace)
    birthDate: z.string(), // ISO date string "YYYY-MM-DD"
    birthTime: z.string().optional(), // "HH:MM" or undefined if unknown
    birthTimeUnknown: z.boolean().default(false),
    
    // Location data from Photon API
    birthCity: z.string(),
    birthCountry: z.string().optional(),
    timezone: z.string(), // IANA timezone e.g. "America/New_York"
    utcOffset: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    
    consentMarketing: z.boolean().default(false),
  });

  app.post("/api/birth-pattern/submit", async (req, res) => {
    try {
      const input = birthPatternInputSchema.parse(req.body);
      
      // Convert to KST with DST correction
      let kstData: { year: number; month: number; day: number; hour: number | null; minute: number | null; isDstApplied: boolean };
      
      if (input.birthTimeUnknown || !input.birthTime) {
        // For unknown time, store the original date without time conversion
        // Parse the birth date directly without timezone conversion to preserve the user's intended date
        const [year, month, day] = input.birthDate.split('-').map(Number);
        kstData = {
          year,
          month,
          day,
          hour: null,
          minute: null,
          isDstApplied: false, // No DST correction when time is unknown
        };
      } else {
        const corrected = getCorrectedKST(input.birthDate, input.birthTime, input.timezone);
        kstData = {
          year: corrected.year,
          month: corrected.month,
          day: corrected.day,
          hour: corrected.hour,
          minute: corrected.minute,
          isDstApplied: corrected.isDstApplied,
        };
      }

      const birthPatternData: InsertBirthPattern = {
        surveyResultId: input.surveyResultId,
        name: input.name,
        gender: input.gender,
        email: input.email || null,
        birthYear: kstData.year,
        birthMonth: kstData.month,
        birthDay: kstData.day,
        birthHour: kstData.hour,
        birthMinute: kstData.minute,
        birthTimeUnknown: input.birthTimeUnknown,
        birthCity: input.birthCity,
        birthCountry: input.birthCountry || null,
        originalTimezone: input.timezone,
        originalUtcOffset: input.utcOffset || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        dstCorrectionApplied: kstData.isDstApplied,
        consentMarketing: input.consentMarketing,
      };

      const birthPattern = await storage.createBirthPattern(birthPatternData);
      
      res.status(201).json({
        success: true,
        birthPattern,
        kstConversion: {
          year: kstData.year,
          month: kstData.month,
          day: kstData.day,
          hour: kstData.hour,
          minute: kstData.minute,
          dstCorrectionApplied: kstData.isDstApplied,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Birth pattern submission error:", err);
      res.status(500).json({ message: "Failed to save birth pattern" });
    }
  });

  return httpServer;
}
