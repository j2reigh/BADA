import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import { getCorrectedKST } from "../lib/time_utils";
import { calculateSaju } from "../lib/saju_calculator";
import { analyzeOperatingState } from "../lib/operating_logic"; // v2.3 Integration
import { generateLifeBlueprintReport, type SurveyScores } from "../lib/gemini_client";
import { sendVerificationEmail } from "../lib/email";
import { db } from "./db";
import { type InsertBirthPattern, type InsertSajuResult, contentArchetypes } from "@shared/schema";
import { eq } from "drizzle-orm";

// Helper function for unlock code error messages
function getCodeErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    INVALID_CODE: "Invalid code. Please check and try again.",
    ALREADY_USED: "This code has already been used.",
    REPORT_NOT_FOUND: "Report not found.",
    ALREADY_UNLOCKED: "This report is already unlocked.",
    MISSING_FIELDS: "Code and report ID are required.",
    UNKNOWN_ERROR: "An unknown error occurred.",
  };
  return messages[error] || messages.UNKNOWN_ERROR;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {


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

    // Report language (any language supported by Gemini)
    language: z.string().default("en"),
  });

  app.post("/api/assessment/submit", async (req, res) => {
    try {
      console.log("[Assessment] Starting submission...");
      const input = assessmentInputSchema.parse(req.body);
      console.log("[Assessment] Input validated");

      // 1. Upsert lead (create or update by email)
      console.log("[Assessment] Upserting lead...");
      const lead = await storage.upsertLead(input.email, input.marketingConsent);
      console.log("[Assessment] Lead created/updated:", lead.id);

      // 2. Convert birth time to KST with DST correction
      console.log("[Assessment] Converting to KST...");
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
      console.log("[Assessment] Calculating Saju...");
      let sajuData: any = null;
      let reportData: any = null;

      const isTimeMissing = input.birthTimeUnknown || !input.birthTime;
      // If birth time unknown, use "12:00" as dummy for the library but flag birthTimeUnknown
      // so calculateSaju strips the hour pillar and recalculates from 3 pillars only
      const effectiveBirthTime = isTimeMissing ? "12:00" : input.birthTime!;

      try {
        console.log(`[Assessment] Running Saju calculation... (birthTimeUnknown: ${isTimeMissing})`);
        sajuData = calculateSaju(input.birthDate, effectiveBirthTime, input.timezone, isTimeMissing);
        console.log("[Assessment] Saju calculated successfully");

        // v2.3 Logic: Perform Operating Analysis (Saju + Survey)
        const analysisInput = {
          ...input.surveyScores,
          answers: input.answers as { q1: string; q2: string; q3: string;[key: string]: string }
        };

        try {
          const operatingAnalysis = analyzeOperatingState(sajuData, analysisInput);
          sajuData.operatingAnalysis = operatingAnalysis;
          if (sajuData.stats) {
            sajuData.stats.operatingRate = operatingAnalysis._internal.finalRate;
          }
          console.log("[Assessment] Operating Analysis v2.3 complete:", operatingAnalysis.levelName);
        } catch (analysisErr) {
          console.error("[Assessment] Operating Analysis failed:", analysisErr);
        }

        // 4. Generate AI report (5-page Life Blueprint)
        console.log("[Assessment] Generating AI report...");
        const surveyScoresForReport: SurveyScores = {
          threatScore: input.surveyScores.threatScore,
          threatClarity: input.surveyScores.threatClarity,
          environmentScore: input.surveyScores.environmentScore,
          environmentStable: input.surveyScores.environmentStable,
          agencyScore: input.surveyScores.agencyScore,
          agencyActive: input.surveyScores.agencyActive,
          typeKey: input.surveyScores.typeKey,
          typeName: input.surveyScores.typeName,
        };

        // Fetch Content Archetype (Standardization)
        const dayPillar = `${sajuData.fourPillars.day.gan}${sajuData.fourPillars.day.zhi}`;
        const osTypeClean = input.surveyScores.typeName.replace(/\s+/g, "");
        const archetypeId = `${dayPillar}_${osTypeClean}`;

        console.log(`[Content Standard] Looking up archetype: ${archetypeId}`);

        const archetype = db ? await db.query.contentArchetypes.findFirst({
          where: eq(contentArchetypes.id, archetypeId),
        }) : undefined;

        if (archetype) {
          console.log(`[Content Standard] Found archetype: ${archetype.identityTitle}`);
        } else {
          console.warn(`[Content Standard] Archetype NOT FOUND for ${archetypeId}. content will be generated by AI.`);
        }

        reportData = await generateLifeBlueprintReport(sajuData, surveyScoresForReport, input.name, archetype, input.language);
        console.log(`[Assessment] AI report generated successfully in language: ${input.language}`);
      } catch (err) {
        console.error("[Assessment] Saju/Report calculation error:", err);
        sajuData = { error: "Calculation failed", message: String(err) };
        reportData = { error: "Report generation failed" };
      }

      // 5. Create saju result record
      console.log("[Assessment] Creating saju result record...");
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
        language: input.language,
      });
      console.log("[Assessment] Saju result saved:", sajuResult.id);

      // 6. Send verification email (only if not already verified)
      let emailSent = false;
      if (!lead.isVerified) {
        console.log("[Assessment] Sending verification email...");
        const emailResult = await sendVerificationEmail(
          lead.email,
          lead.verificationToken,
          lead.id
        );

        if (!emailResult.success) {
          console.error("[Assessment] Failed to send verification email:", emailResult.error);
        } else {
          console.log("[Assessment] Verification email sent successfully");
          emailSent = emailResult.success;
        }
      } else {
        console.log("[Assessment] Lead already verified, skipping verification email");
      }

      console.log("[Assessment] Submission complete!");
      res.status(201).json({
        success: true,
        reportId: sajuResult.id,
        leadId: lead.id,
        email: lead.email,
        isVerified: lead.isVerified,
        emailSent,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("[Assessment] Submission error:", err);
      console.error("[Assessment] Error stack:", err instanceof Error ? err.stack : "No stack trace");
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

      // In development mode, treat all leads as verified
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isVerified = isDevelopment ? true : lead.isVerified;

      if (isDevelopment && !lead.isVerified) {
        console.log(`[DEV MODE] Bypassing email verification in wait page for report ${reportId}`);
      }

      res.json({
        reportId: sajuResult.id,
        leadId: lead.id,
        email: lead.email,
        isVerified,
      });
    } catch (err) {
      console.error("Wait page data error:", err);
      res.status(500).json({ message: "Failed to get wait page data" });
    }
  });

  // Get results (Page 1 always, Pages 2-5 only if paid)
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

      // Development mode: Skip email verification check
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (!isDevelopment && !lead.isVerified) {
        return res.status(403).json({
          message: "Email not verified",
          redirectTo: `/wait/${reportId}`
        });
      }

      if (isDevelopment && !lead.isVerified) {
        console.log(`[DEV MODE] Bypassing email verification for report ${reportId}`);
      }

      const reportData = sajuResult.reportData as any;
      const isPaid = (sajuResult as any).isPaid || false;

      // Show full report if paid
      const showFullReport = isPaid;

      // Always return Page 1 (Identity) - the free hook
      // Only return Pages 2-5 if paid (or in development mode)
      const responseData: any = {
        reportId: sajuResult.id,
        email: lead.email,
        userInput: sajuResult.userInput,
        sajuData: sajuResult.sajuData,
        isPaid,
        createdAt: sajuResult.createdAt,
        // Page 1 - always available (free hook)
        page1_identity: reportData.page1_identity || null,
      };

      if (showFullReport) {
        // Full report - Pages 2-5
        responseData.page2_hardware = reportData.page2_hardware || null;
        responseData.page3_os = reportData.page3_os || null;
        responseData.page4_mismatch = reportData.page4_mismatch || null;
        responseData.page5_solution = reportData.page5_solution || null;
      } else {
        // Locked preview - show section names AND anchors (Teaser Mode)
        responseData.page2_hardware = {
          section_name: "Your Natural Blueprint",
          locked: true,
          nature_title: reportData.page2_hardware?.nature_title,
          core_drive: reportData.page2_hardware?.core_drive
        };
        responseData.page3_os = {
          section_name: "Your Current Operating System",
          locked: true,
          os_title: reportData.page3_os?.os_title,
          os_anchor: reportData.page3_os?.os_anchor
        };
        responseData.page4_mismatch = {
          section_name: "The Core Tension",
          locked: true,
          friction_title: reportData.page4_mismatch?.friction_title,
          friction_anchor: reportData.page4_mismatch?.friction_anchor
        };
        responseData.page5_solution = {
          section_name: "Your Action Protocol",
          locked: true,
          protocol_name: reportData.page5_solution?.protocol_name,
          protocol_anchor: reportData.page5_solution?.protocol_anchor
        };
      }

      res.json(responseData);
    } catch (err) {
      console.error("Results fetch error:", err);
      console.error("Error stack:", err instanceof Error ? err.stack : "No stack trace");
      res.status(500).json({ message: "Failed to get results" });
    }
  });

  // Unlock report (test endpoint - to be replaced with Stripe webhook)
  app.post("/api/results/:reportId/unlock", async (req, res) => {
    try {
      const { reportId } = req.params;

      const sajuResult = await storage.getSajuResultById(reportId);
      if (!sajuResult) {
        return res.status(404).json({ message: "Report not found" });
      }

      const lead = await storage.getLeadById(sajuResult.leadId);
      if (!lead || !lead.isVerified) {
        return res.status(403).json({ message: "Email not verified" });
      }

      // Update isPaid status
      await storage.unlockReport(reportId);

      res.json({ success: true, message: "Report unlocked" });
    } catch (err) {
      console.error("Unlock report error:", err);
      res.status(500).json({ message: "Failed to unlock report" });
    }
  });

  // Redeem unlock code endpoint
  app.post("/api/codes/redeem", async (req, res) => {
    try {
      const { code, reportId } = req.body;

      if (!code || !reportId) {
        return res.status(400).json({
          success: false,
          error: "MISSING_FIELDS",
          message: "Code and reportId are required"
        });
      }

      console.log(`[Code Redeem] Attempting to redeem code: ${code} for report: ${reportId}`);

      const result = await storage.redeemCode(code, reportId);

      if (result.success) {
        console.log(`[Code Redeem] ✅ Successfully redeemed code: ${code}`);
        return res.json({ success: true, message: "Report unlocked successfully" });
      } else {
        console.log(`[Code Redeem] ❌ Failed to redeem code: ${code}, error: ${result.error}`);
        return res.status(400).json({
          success: false,
          error: result.error,
          message: getCodeErrorMessage(result.error || "UNKNOWN_ERROR")
        });
      }
    } catch (err) {
      console.error("[Code Redeem] Error:", err);
      res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Failed to redeem code"
      });
    }
  });

  // Gumroad Webhook Handler
  app.post("/api/webhooks/gumroad", async (req, res) => {
    try {
      console.log("[Gumroad] Webhook received:", req.body);

      const {
        sale_id,
        email,
        price,
        currency,
      } = req.body;

      // Try to find report_id from custom fields (if set up) or fallback to email lookup
      let targetReportId = req.body.report_id ||
        (req.body.custom_fields && req.body.custom_fields.report_id);

      if (!targetReportId) {
        console.log(`[Gumroad] No report_id in webhook, trying email lookup for: ${email}`);
        if (email) {
          const lead = await storage.getLeadByEmail(email);
          if (lead) {
            const reports = await storage.getSajuResultsByLeadId(lead.id);
            if (reports.length > 0) {
              // Sort by createdAt descending (newest first)
              reports.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
              targetReportId = reports[0].id;
              console.log(`[Gumroad] Found most recent report ${targetReportId} for email ${email}`);
            }
          }
        }
      }

      // Validation
      if (!sale_id || !targetReportId) {
        console.error("[Gumroad] Missing sale_id or could not resolve report_id");
        return res.status(400).json({ error: "Missing required fields or cannot link payment to report" });
      }

      // Check report existence
      const sajuResult = await storage.getSajuResultById(targetReportId);
      if (!sajuResult) {
        console.error("[Gumroad] Report not found:", targetReportId);
        return res.status(404).json({ error: "Report not found" });
      }

      // Already paid?
      if (sajuResult.isPaid) {
        console.log("[Gumroad] Report already paid:", targetReportId);
        return res.status(200).json({ message: "Already paid" });
      }

      // Unlock report
      await storage.unlockReport(targetReportId);

      console.log(`[Gumroad] ✅ Report ${targetReportId} unlocked successfully`);
      console.log(`[Gumroad] 💰 Sale ID: ${sale_id}, Price: ${price} ${currency}`);

      res.status(200).json({ success: true, message: "Report unlocked" });
    } catch (error) {
      console.error("[Gumroad] Webhook error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Webhook 테스트용 엔드포인트 (개발 전용)
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/webhooks/gumroad/test", async (req, res) => {
      const { reportId } = req.body;
      await storage.unlockReport(reportId);
      console.log(`[Gumroad Test] Report ${reportId} unlocked`);
      res.json({ success: true });
    });

    // Debug: List recent reports
    app.get("/api/debug/reports", async (req, res) => {
      try {
        const { db } = await import("./db");
        const { sajuResults } = await import("@shared/schema");
        const { desc } = await import("drizzle-orm");

        if (!db) return res.status(500).json({ message: "Database not available" });
        const reports = await db.select().from(sajuResults).orderBy(desc(sajuResults.createdAt)).limit(10);
        res.json({
          count: reports.length,
          reports: reports.map((r: any) => ({
            id: r.id,
            leadId: r.leadId,
            createdAt: r.createdAt,
            hasReportData: !!r.reportData
          }))
        });
      } catch (err) {
        console.error("[Debug] Error fetching reports:", err);
        res.status(500).json({ error: "Failed to fetch reports" });
      }
    });
  }

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
