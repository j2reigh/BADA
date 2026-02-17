import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import { getCorrectedKST } from "../lib/time_utils";
import { calculateSaju } from "../lib/saju_calculator";
import { analyzeOperatingState } from "../lib/operating_logic"; // v2.3 Integration
import { generateV3Cards, repairV3Cards, type SurveyScores } from "../lib/gemini_client";
import { translateToBehaviors, calculateLuckCycle, type HumanDesignData } from "../lib/behavior_translator";
import { fetchHumanDesign } from "../lib/hd_client";
import { sendReportLinkEmail } from "../lib/email";
import { db } from "./db";
import { type InsertBirthPattern, type InsertSajuResult } from "@shared/schema";

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
  app: Express,
  httpServer?: Server,
): Promise<Server | undefined> {


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
      const rawInput = assessmentInputSchema.parse(req.body);
      // Capitalize first letter of name (e.g. "john" → "John")
      const input = {
        ...rawInput,
        name: rawInput.name.charAt(0).toUpperCase() + rawInput.name.slice(1),
      };
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
      let hdData: HumanDesignData | null = null;

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

        // 4. Fetch Human Design data from HD API
        console.log("[Assessment] Fetching Human Design data...");
        const hdBirthTime = isTimeMissing ? "12:00" : input.birthTime!;
        const hdLocation = input.birthCity !== input.birthCountry
          ? `${input.birthCity}, ${input.birthCountry || ""}`
          : input.birthCountry || input.birthCity;

        const hdResponse = await fetchHumanDesign(input.birthDate, hdBirthTime, hdLocation);
        if (!hdResponse) {
          throw new Error("HD API returned no data");
        }
        hdData = {
          type: hdResponse.type,
          profile: hdResponse.profile,
          strategy: hdResponse.strategy,
          authority: hdResponse.authority,
          centers: hdResponse.centers,
          definition: hdResponse.definition,
          signature: hdResponse.signature,
          not_self_theme: hdResponse.not_self_theme,
          environment: hdResponse.environment || "",
          channels_long: hdResponse.channels_long,
          cognition: hdResponse.cognition,
          determination: hdResponse.determination,
          incarnation_cross: hdResponse.incarnation_cross,
          variables: hdResponse.variables,
          motivation: hdResponse.motivation,
          transference: hdResponse.transference,
          perspective: hdResponse.perspective,
          distraction: hdResponse.distraction,
          circuitries: hdResponse.circuitries,
          gates: hdResponse.gates,
          channels_short: hdResponse.channels_short,
          activations: hdResponse.activations,
        };
        console.log(`[Assessment] HD data fetched: type=${hdData.type}, profile=${hdData.profile}`);

        // 5. Generate V3 Card Report
        console.log("[Assessment] Generating V3 card report...");
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

        // Translate raw data to behavior patterns
        const behaviors = translateToBehaviors(
          sajuData,
          hdData,
          surveyScoresForReport,
          input.birthDate,
          input.gender
        );
        console.log("[Assessment] Behavior patterns translated");

        // Calculate luck cycle (대운/세운)
        const luckBirthTime = isTimeMissing ? "12:00" : input.birthTime!;
        const luckGender = input.gender === "female" ? "F" : "M";
        const luckCycle = calculateLuckCycle(input.birthDate, luckBirthTime, luckGender);
        console.log("[Assessment] Luck cycle calculated");

        // Generate V3 cards via Gemini
        const v3Cards = await generateV3Cards(
          sajuData,
          surveyScoresForReport,
          behaviors,
          input.name,
          input.language,
          input.birthDate,
          luckCycle,
          hdData
        );
        reportData = { v3Cards };
        console.log(`[Assessment] V3 cards generated successfully in language: ${input.language}`);
      } catch (err) {
        console.error("[Assessment] Saju/HD/Report calculation error:", err);
        return res.status(500).json({
          message: "Failed to generate report. Saju calculation or HD API failed.",
          error: String(err),
        });
      }

      // 6. Create saju result record
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
        hdData: hdData,
      };

      const sajuResult = await storage.createSajuResult({
        leadId: lead.id,
        userInput,
        sajuData: sajuData || {},
        reportData: reportData || {},
        language: input.language,
      });
      console.log("[Assessment] Saju result saved:", sajuResult.id);

      // Send report link email (non-blocking — don't wait for result)
      sendReportLinkEmail(lead.email, sajuResult.id, input.name).then(
        (result) => {
          if (result.success) {
            console.log(`[Assessment] Report link email sent to ${lead.email}`);
          } else {
            console.error(`[Assessment] Report link email failed: ${result.error}`);
          }
        }
      );

      console.log("[Assessment] Submission complete!");
      res.status(201).json({
        success: true,
        reportId: sajuResult.id,
        leadId: lead.id,
        email: lead.email,
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

  // Legacy verification endpoints removed — email verification no longer used.
  // Report link email is sent non-blocking on submit instead.

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

      // Option E: No email verification required — report is accessible by URL
      // Email verification was removed per email-flow-redesign plan

      const reportData = sajuResult.reportData as any;
      const isPaid = (sajuResult as any).isPaid || false;

      const responseData: any = {
        reportId: sajuResult.id,
        email: lead.email,
        userInput: sajuResult.userInput,
        sajuData: sajuResult.sajuData,
        isPaid,
        createdAt: sajuResult.createdAt,
        language: (sajuResult as any).language || "en",
      };

      // V3 card report format
      if (reportData.v3Cards) {
        if (isPaid) {
          // Full V3 card content
          responseData.v3Cards = reportData.v3Cards;
        } else {
          // Free preview: only hook, mirror, and blueprint cards
          const cards = reportData.v3Cards;
          responseData.v3Cards = {
            hookQuestion: cards.hookQuestion,
            mirrorQuestion: cards.mirrorQuestion,
            mirrorText: cards.mirrorText,
            mirrorAccent: cards.mirrorAccent,
            blueprintQuestion: cards.blueprintQuestion,
            blueprintText: cards.blueprintText,
            blueprintAccent: cards.blueprintAccent,
            blueprintFacets: cards.blueprintFacets,
          };
        }
      } else {
        // Legacy V2 report format (old reports without v3Cards)
        responseData.isLegacy = true;
        responseData.page1_identity = reportData.page1_identity || null;
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

      // Update isPaid status
      await storage.unlockReport(reportId);

      res.json({ success: true, message: "Report unlocked" });
    } catch (err) {
      console.error("Unlock report error:", err);
      res.status(500).json({ message: "Failed to unlock report" });
    }
  });

  // Generate V3 Card Content (LLM-generated collision framing)
  app.get("/api/results/:reportId/v3-cards", async (req, res) => {
    try {
      const { reportId } = req.params;

      const sajuResult = await storage.getSajuResultById(reportId);
      if (!sajuResult) {
        return res.status(404).json({ message: "Report not found" });
      }

      const userInput = sajuResult.userInput as any;
      const sajuData = sajuResult.sajuData as any;
      const surveyScores: SurveyScores = userInput.surveyScores;
      const birthDate = userInput.birthDate || "1996-01-01";
      const userName = userInput.name || "Friend";
      const language = (sajuResult as any).language || "en";

      // Use stored HD data — no fallback, HD data is required
      const hdData: HumanDesignData | undefined = userInput.hdData;
      if (!hdData) {
        return res.status(400).json({ message: "No HD data found for this report. Report was generated before HD API integration." });
      }

      // Translate raw data to behavior patterns
      const behaviors = translateToBehaviors(
        sajuData,
        hdData,
        surveyScores,
        birthDate,
        userInput.gender || "female"
      );

      // Calculate luck cycle (대운/세운) with 십신
      const birthTime = userInput.birthTime || "12:00";
      const gender = userInput.gender || "F";
      const luckCycle = calculateLuckCycle(birthDate, birthTime, gender);

      // Generate V3 cards via Gemini
      const v3Cards = await generateV3Cards(
        sajuData,
        surveyScores,
        behaviors,
        userName,
        language,
        birthDate,
        luckCycle
      );

      res.json(v3Cards);
    } catch (err) {
      console.error("V3 Cards generation error:", err);
      res.status(500).json({ message: "Failed to generate V3 cards", error: String(err) });
    }
  });

  // Repair incomplete V3 report — regenerate only missing fields
  app.post("/api/results/:reportId/repair", async (req, res) => {
    try {
      const { reportId } = req.params;

      const sajuResult = await storage.getSajuResultById(reportId);
      if (!sajuResult) {
        return res.status(404).json({ message: "Report not found" });
      }

      const reportData = sajuResult.reportData as any;
      if (!reportData?.v3Cards) {
        return res.status(400).json({ message: "No v3Cards data to repair" });
      }

      const existing = reportData.v3Cards;
      const requiredFields = ['hookQuestion', 'mirrorQuestion', 'mirrorText', 'blueprintQuestion', 'blueprintText', 'closingLine', 'shifts', 'actionQuestion', 'actionNeuro'];
      const missing = requiredFields.filter(f => !existing[f]);

      if (missing.length === 0) {
        return res.json({ message: "No missing fields", repaired: [] });
      }

      console.log(`[Repair] Report ${reportId} missing: ${missing.join(', ')}`);

      const userInput = sajuResult.userInput as any;
      const sajuData = sajuResult.sajuData as any;
      const language = (sajuResult as any).language || "en";

      const patch = await repairV3Cards(existing, missing, userInput, sajuData, language);
      await storage.patchReportData(reportId, patch);

      console.log(`[Repair] Report ${reportId} patched: ${Object.keys(patch).join(', ')}`);
      res.json({ message: "Report repaired", repaired: Object.keys(patch) });
    } catch (err) {
      console.error("Repair error:", err);
      res.status(500).json({ message: "Failed to repair report", error: String(err) });
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

      // Extract url_params — Gumroad sends URL query params here
      // With extended: false, it may come as url_params[report_id] or as a parsed object
      let urlParams: Record<string, string> = {};
      if (typeof req.body.url_params === "string") {
        try { urlParams = JSON.parse(req.body.url_params); } catch {}
      } else if (req.body.url_params && typeof req.body.url_params === "object") {
        urlParams = req.body.url_params;
      }
      // Also check flat keys like "url_params[report_id]" (extended: false format)
      if (!urlParams.report_id && req.body["url_params[report_id]"]) {
        urlParams.report_id = req.body["url_params[report_id]"];
      }

      console.log("[Gumroad] url_params:", urlParams);

      // Try: url_params.report_id → custom_fields.report_id → body.report_id → email fallback
      let targetReportId = urlParams.report_id ||
        req.body.report_id ||
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

      // If report_id exists but points to a non-existent report, fall back to email lookup
      if (targetReportId) {
        const exists = await storage.getSajuResultById(targetReportId);
        if (!exists && email) {
          console.log(`[Gumroad] report_id "${targetReportId}" not found, falling back to email lookup for: ${email}`);
          targetReportId = null;
          const lead = await storage.getLeadByEmail(email);
          if (lead) {
            const reports = await storage.getSajuResultsByLeadId(lead.id);
            if (reports.length > 0) {
              reports.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
              targetReportId = reports[0].id;
              console.log(`[Gumroad] Fallback: found report ${targetReportId} for email ${email}`);
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
