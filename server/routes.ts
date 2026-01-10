import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { searchCities } from "../lib/photon_client";
import { getCorrectedKST } from "../lib/time_utils";
import { calculateSaju } from "../lib/saju_calculator";
import { generateSajuReport } from "../lib/gemini_client";
import { sendVerificationEmail } from "../lib/email";
import type { InsertBirthPattern, InsertSajuResult } from "@shared/schema";

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

  // New comprehensive assessment submission endpoint
  const assessmentInputSchema = z.object({
    // Survey answers
    answers: z.record(z.string()),
    surveyScores: z.object({
      threatScore: z.number(),
      threatClarity: z.number(),
      environmentScore: z.number(),
      environmentStable: z.number(),
      agencyScore: z.number(),
      agencyActive: z.number(),
      typeKey: z.string(),
      typeName: z.string(),
    }),
    
    // Birth pattern
    name: z.string().min(1),
    gender: z.enum(["male", "female", "other"]),
    email: z.string().email(),
    marketingConsent: z.boolean().default(true),
    
    birthDate: z.string(),
    birthTime: z.string().optional(),
    birthTimeUnknown: z.boolean().default(false),
    
    birthCity: z.string(),
    birthCountry: z.string().optional(),
    timezone: z.string(),
    utcOffset: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  });

  app.post("/api/assessment/submit", async (req, res) => {
    try {
      const input = assessmentInputSchema.parse(req.body);
      
      // 1. Upsert lead (create or update by email)
      const lead = await storage.upsertLead(input.email, input.marketingConsent);
      
      // 2. Convert birth time to KST with DST correction
      let kstData: { year: number; month: number; day: number; hour: number | null; minute: number | null; isDstApplied: boolean };
      
      if (input.birthTimeUnknown || !input.birthTime) {
        const [year, month, day] = input.birthDate.split('-').map(Number);
        kstData = {
          year,
          month,
          day,
          hour: null,
          minute: null,
          isDstApplied: false,
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
      
      // 3. Calculate Saju (Four Pillars)
      let sajuData: any = null;
      let reportData: any = null;
      
      if (!input.birthTimeUnknown && input.birthTime) {
        try {
          sajuData = calculateSaju(input.birthDate, input.birthTime, input.timezone);
          
          // 4. Generate AI report
          reportData = await generateSajuReport(sajuData, input.name);
        } catch (err) {
          console.error("Saju calculation error:", err);
          sajuData = { error: "Calculation failed", message: String(err) };
          reportData = { error: "Report generation failed" };
        }
      } else {
        sajuData = { note: "Birth time unknown - limited analysis available" };
        reportData = { note: "Full report requires birth time" };
      }
      
      // 5. Create saju result record
      const userInput = {
        name: input.name,
        gender: input.gender,
        birthDate: input.birthDate,
        birthTime: input.birthTime || null,
        birthTimeUnknown: input.birthTimeUnknown,
        birthCity: input.birthCity,
        birthCountry: input.birthCountry || null,
        timezone: input.timezone,
        kstConversion: kstData,
        surveyAnswers: input.answers,
        surveyScores: input.surveyScores,
      };
      
      const sajuResult = await storage.createSajuResult({
        leadId: lead.id,
        userInput,
        sajuData: sajuData || {},
        reportData: reportData || {},
      });
      
      // 6. Send verification email
      const emailResult = await sendVerificationEmail(
        lead.email,
        lead.verificationToken,
        lead.id
      );
      
      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
      }
      
      res.status(201).json({
        success: true,
        reportId: sajuResult.id,
        leadId: lead.id,
        email: lead.email,
        emailSent: emailResult.success,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Assessment submission error:", err);
      res.status(500).json({ message: "Failed to submit assessment" });
    }
  });

  // Email verification endpoint
  app.get("/api/verify", async (req, res) => {
    try {
      const { token, id } = req.query;
      
      if (!token || !id || typeof token !== 'string' || typeof id !== 'string') {
        return res.redirect("/verification-failed?reason=invalid");
      }
      
      const lead = await storage.getLeadByToken(token);
      
      if (!lead || lead.id !== id) {
        return res.redirect("/verification-failed?reason=expired");
      }
      
      if (lead.isVerified) {
        // Already verified, redirect to results
        const sajuResults = await storage.getSajuResultsByLeadId(lead.id);
        if (sajuResults.length > 0) {
          return res.redirect(`/results/${sajuResults[0].id}`);
        }
        return res.redirect("/verification-failed?reason=no_results");
      }
      
      // Verify the lead
      await storage.verifyLead(id);
      
      // Get latest saju result for this lead
      const sajuResults = await storage.getSajuResultsByLeadId(id);
      if (sajuResults.length > 0) {
        return res.redirect(`/results/${sajuResults[0].id}`);
      }
      
      return res.redirect("/verification-failed?reason=no_results");
    } catch (err) {
      console.error("Verification error:", err);
      return res.redirect("/verification-failed?reason=error");
    }
  });

  // Resend verification email
  app.post("/api/verification/resend", async (req, res) => {
    try {
      const { leadId } = req.body;
      
      if (!leadId) {
        return res.status(400).json({ message: "Lead ID required" });
      }
      
      const lead = await storage.getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      if (lead.isVerified) {
        return res.status(400).json({ message: "Already verified" });
      }
      
      // Regenerate token and send email
      const updatedLead = await storage.regenerateVerificationToken(leadId);
      if (!updatedLead) {
        return res.status(500).json({ message: "Failed to regenerate token" });
      }
      
      const emailResult = await sendVerificationEmail(
        updatedLead.email,
        updatedLead.verificationToken,
        updatedLead.id
      );
      
      res.json({ success: emailResult.success, email: updatedLead.email });
    } catch (err) {
      console.error("Resend verification error:", err);
      res.status(500).json({ message: "Failed to resend verification" });
    }
  });

  // Update email (for typo correction)
  app.post("/api/verification/update-email", async (req, res) => {
    try {
      const { leadId, newEmail } = req.body;
      
      if (!leadId || !newEmail) {
        return res.status(400).json({ message: "Lead ID and new email required" });
      }
      
      const lead = await storage.getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      if (lead.isVerified) {
        return res.status(400).json({ message: "Cannot change verified email" });
      }
      
      // Check if new email already exists
      const existingLead = await storage.getLeadByEmail(newEmail);
      if (existingLead && existingLead.id !== leadId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Update email and regenerate token
      const updatedLead = await storage.updateLeadEmail(leadId, newEmail);
      if (!updatedLead) {
        return res.status(500).json({ message: "Failed to update email" });
      }
      
      // Send verification to new email
      const emailResult = await sendVerificationEmail(
        updatedLead.email,
        updatedLead.verificationToken,
        updatedLead.id
      );
      
      res.json({ 
        success: emailResult.success, 
        email: updatedLead.email,
        message: "Email updated. Check your inbox." 
      });
    } catch (err) {
      console.error("Update email error:", err);
      res.status(500).json({ message: "Failed to update email" });
    }
  });

  // Get wait page data
  app.get("/api/wait/:reportId", async (req, res) => {
    try {
      const { reportId } = req.params;
      
      const sajuResult = await storage.getSajuResultById(reportId);
      if (!sajuResult) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      const lead = await storage.getLeadById(sajuResult.leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json({
        reportId: sajuResult.id,
        leadId: lead.id,
        email: lead.email,
        isVerified: lead.isVerified,
      });
    } catch (err) {
      console.error("Wait page data error:", err);
      res.status(500).json({ message: "Failed to get wait page data" });
    }
  });

  // Get results (only if verified)
  app.get("/api/results/:reportId", async (req, res) => {
    try {
      const { reportId } = req.params;
      
      const sajuResult = await storage.getSajuResultById(reportId);
      if (!sajuResult) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      const lead = await storage.getLeadById(sajuResult.leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      if (!lead.isVerified) {
        return res.status(403).json({ 
          message: "Email not verified",
          redirectTo: `/wait/${reportId}`
        });
      }
      
      res.json({
        reportId: sajuResult.id,
        userInput: sajuResult.userInput,
        sajuData: sajuResult.sajuData,
        reportData: sajuResult.reportData,
        createdAt: sajuResult.createdAt,
      });
    } catch (err) {
      console.error("Results fetch error:", err);
      res.status(500).json({ message: "Failed to get results" });
    }
  });

  // Legacy birth pattern submission (keep for backward compatibility)
  const birthPatternInputSchema = z.object({
    surveyResultId: z.number(),
    name: z.string().min(1),
    gender: z.enum(["male", "female", "other"]),
    email: z.string().email().optional().or(z.literal("")),
    birthDate: z.string(),
    birthTime: z.string().optional(),
    birthTimeUnknown: z.boolean().default(false),
    birthCity: z.string(),
    birthCountry: z.string().optional(),
    timezone: z.string(),
    utcOffset: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    consentMarketing: z.boolean().default(false),
  });

  app.post("/api/birth-pattern/submit", async (req, res) => {
    try {
      const input = birthPatternInputSchema.parse(req.body);
      
      let kstData: { year: number; month: number; day: number; hour: number | null; minute: number | null; isDstApplied: boolean };
      
      if (input.birthTimeUnknown || !input.birthTime) {
        const [year, month, day] = input.birthDate.split('-').map(Number);
        kstData = {
          year,
          month,
          day,
          hour: null,
          minute: null,
          isDstApplied: false,
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
