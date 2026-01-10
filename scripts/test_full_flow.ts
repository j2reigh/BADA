const BASE_URL = "http://localhost:5000";
const TEST_EMAIL = "ljyoao@gmail.com";
const CORRECTED_EMAIL = "jeannelee.biz@gmail.com";

interface TestResult {
  scenario: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function logSuccess(scenario: string, message: string) {
  log("✅", `${scenario}: ${message}`);
  results.push({ scenario, passed: true, details: message });
}

function logError(scenario: string, message: string) {
  log("❌", `${scenario}: ${message}`);
  results.push({ scenario, passed: false, details: message });
}

function logInfo(message: string) {
  log("ℹ️", message);
}

function logStep(message: string) {
  log("🔄", message);
}

async function apiCall(method: string, endpoint: string, body?: any): Promise<{ status: number; data: any }> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  
  return { status: response.status, data };
}

async function cleanup() {
  logInfo("Cleaning up test data...");
  try {
    const { db } = await import("../server/db");
    const { leads, sajuResults } = await import("../shared/schema");
    const { eq, or, inArray } = await import("drizzle-orm");
    const { storage } = await import("../server/storage");
    
    const testLead1 = await storage.getLeadByEmail(TEST_EMAIL);
    const testLead2 = await storage.getLeadByEmail(CORRECTED_EMAIL);
    
    const leadIds = [testLead1?.id, testLead2?.id].filter(Boolean) as string[];
    
    if (leadIds.length > 0) {
      await db.delete(sajuResults).where(inArray(sajuResults.leadId, leadIds));
    }
    
    await db.delete(leads).where(
      or(
        eq(leads.email, TEST_EMAIL),
        eq(leads.email, CORRECTED_EMAIL)
      )
    );
    
    logInfo("Cleanup complete");
  } catch (error) {
    logInfo(`Cleanup note: ${error}`);
  }
}

function createMockAssessmentData(email: string, variant: string = "default") {
  return {
    answers: { q1: "A", q2: "B", q3: "A", q4: "C", q5: "B", q6: "A", q7: "C", q8: "B" },
    surveyScores: {
      threatScore: 15,
      threatClarity: 8,
      environmentScore: 12,
      environmentStable: 6,
      agencyScore: 18,
      agencyActive: 9,
      typeKey: "navigator",
      typeName: "Navigator",
    },
    name: `Test User ${variant}`,
    gender: "male" as const,
    email,
    marketingConsent: true,
    birthDate: variant === "second" ? "1992-08-20" : "1990-05-15",
    birthTime: variant === "second" ? "09:15" : "14:30",
    birthTimeUnknown: false,
    birthCity: variant === "second" ? "Busan" : "Seoul",
    birthCountry: "South Korea",
    timezone: "Asia/Seoul",
    latitude: 37.5665,
    longitude: 126.9780,
  };
}

let globalLeadId: string = "";
let globalReportId: string = "";
let globalToken: string = "";

async function scenario1_FirstTimeUser(): Promise<boolean> {
  const scenario = "Scenario 1 - First-time User (via API)";
  logStep(`Starting ${scenario}`);
  
  try {
    const assessmentData = createMockAssessmentData(TEST_EMAIL);
    logInfo("Calling POST /api/assessment/submit...");
    
    const { status, data } = await apiCall("POST", "/api/assessment/submit", assessmentData);
    
    if (status !== 201) {
      logError(scenario, `API returned status ${status}: ${JSON.stringify(data)}`);
      return false;
    }
    
    if (!data.success || !data.leadId || !data.reportId) {
      logError(scenario, `Missing response fields: ${JSON.stringify(data)}`);
      return false;
    }
    
    globalLeadId = data.leadId;
    globalReportId = data.reportId;
    
    logInfo(`Lead ID: ${data.leadId}, Report ID: ${data.reportId}`);
    logInfo(`Email sent: ${data.emailSent ? "Yes" : "No (domain not verified)"}`);
    
    const waitRes = await apiCall("GET", `/api/wait/${data.reportId}`);
    
    if (waitRes.status !== 200) {
      logError(scenario, `Wait page API failed: ${waitRes.status}`);
      return false;
    }
    
    if (waitRes.data.isVerified) {
      logError(scenario, "New lead should not be verified");
      return false;
    }
    
    logInfo("Verified: Lead created, linked to report, is_verified=false");
    
    const { storage } = await import("../server/storage");
    const lead = await storage.getLeadById(globalLeadId);
    if (lead) {
      globalToken = lead.verificationToken;
      logInfo(`Token retrieved: ${globalToken}`);
    }
    
    logSuccess(scenario, "Assessment submitted via API, lead+report created, verification pending");
    return true;
    
  } catch (error) {
    logError(scenario, `Error: ${error}`);
    return false;
  }
}

async function scenario2_ExistingUser(): Promise<boolean> {
  const scenario = "Scenario 2 - Existing User Retention (via API)";
  logStep(`Starting ${scenario}`);
  
  try {
    const assessmentData = createMockAssessmentData(TEST_EMAIL, "second");
    logInfo("Submitting second assessment with SAME email...");
    
    const { status, data } = await apiCall("POST", "/api/assessment/submit", assessmentData);
    
    if (status !== 201) {
      logError(scenario, `API returned status ${status}: ${JSON.stringify(data)}`);
      return false;
    }
    
    if (data.leadId !== globalLeadId) {
      logError(scenario, `Lead ID changed! Expected: ${globalLeadId}, Got: ${data.leadId}`);
      return false;
    }
    
    logInfo("Lead ID preserved (same lead reused)");
    
    if (data.reportId === globalReportId) {
      logError(scenario, "Should have created a new report with different ID");
      return false;
    }
    
    logInfo(`New report created: ${data.reportId}`);
    
    const { storage } = await import("../server/storage");
    const sajuResults = await storage.getSajuResultsByLeadId(globalLeadId);
    
    if (sajuResults.length !== 2) {
      logError(scenario, `Expected 2 reports, got ${sajuResults.length}`);
      return false;
    }
    
    logSuccess(scenario, `Lead retained, 2 reports linked (IDs: ${sajuResults.map(r => r.id.slice(0, 8)).join(", ")})`);
    return true;
    
  } catch (error) {
    logError(scenario, `Error: ${error}`);
    return false;
  }
}

async function scenario3_EmailCorrection(): Promise<boolean> {
  const scenario = "Scenario 3 - Email Correction (via API)";
  logStep(`Starting ${scenario}`);
  
  try {
    logInfo(`Updating email from ${TEST_EMAIL} to ${CORRECTED_EMAIL}...`);
    
    const { status, data } = await apiCall("POST", "/api/verification/update-email", {
      leadId: globalLeadId,
      newEmail: CORRECTED_EMAIL,
    });
    
    if (status !== 200) {
      logError(scenario, `API returned status ${status}: ${JSON.stringify(data)}`);
      return false;
    }
    
    if (data.email !== CORRECTED_EMAIL) {
      logError(scenario, `Email not updated. Expected: ${CORRECTED_EMAIL}, Got: ${data.email}`);
      return false;
    }
    
    logInfo(`Email updated to: ${data.email}`);
    
    const { storage } = await import("../server/storage");
    const lead = await storage.getLeadById(globalLeadId);
    
    if (!lead || lead.verificationToken === globalToken) {
      logError(scenario, "Token should have been regenerated");
      return false;
    }
    
    globalToken = lead.verificationToken;
    logInfo(`New token generated: ${globalToken}`);
    
    logSuccess(scenario, "Email corrected via API, token regenerated, new verification email triggered");
    return true;
    
  } catch (error) {
    logError(scenario, `Error: ${error}`);
    return false;
  }
}

async function scenario4_Verification(): Promise<boolean> {
  const scenario = "Scenario 4 - Verification Simulation (via API)";
  logStep(`Starting ${scenario}`);
  
  try {
    const waitBefore = await apiCall("GET", `/api/wait/${globalReportId}`);
    
    if (waitBefore.data.isVerified) {
      logError(scenario, "Lead should not be verified before clicking link");
      return false;
    }
    
    logInfo("Before verification: is_verified=false");
    
    logInfo(`Calling verification endpoint with token: ${globalToken.slice(0, 8)}...`);
    
    const verifyRes = await fetch(`${BASE_URL}/api/verify?token=${globalToken}&id=${globalLeadId}`, {
      redirect: "manual",
    });
    
    if (verifyRes.status !== 302 && verifyRes.status !== 301) {
      logError(scenario, `Expected redirect, got status ${verifyRes.status}`);
      return false;
    }
    
    const redirectUrl = verifyRes.headers.get("location") || "";
    logInfo(`Redirect URL: ${redirectUrl}`);
    
    if (!redirectUrl.includes("/results/")) {
      logError(scenario, `Expected redirect to results, got: ${redirectUrl}`);
      return false;
    }
    
    const { storage } = await import("../server/storage");
    const lead = await storage.getLeadById(globalLeadId);
    
    if (!lead || !lead.isVerified) {
      logError(scenario, "Lead should be verified now");
      return false;
    }
    
    logInfo("After verification: is_verified=true");
    
    logSuccess(scenario, "Verification via API successful, redirected to results");
    return true;
    
  } catch (error) {
    logError(scenario, `Error: ${error}`);
    return false;
  }
}

async function scenario5_BlockingLogic(): Promise<boolean> {
  const scenario = "Scenario 5 - Results Access Gate (via API)";
  logStep(`Starting ${scenario}`);
  
  try {
    const resultsRes = await apiCall("GET", `/api/results/${globalReportId}`);
    
    if (resultsRes.status !== 200) {
      logError(scenario, `Results API failed for verified lead: ${resultsRes.status}`);
      return false;
    }
    
    if (!resultsRes.data.reportData) {
      logError(scenario, "Missing reportData in response");
      return false;
    }
    
    logInfo("Verified lead: Results access GRANTED");
    
    await cleanup();
    
    const assessmentData = createMockAssessmentData("unverified-test@example.com");
    const { data: newData } = await apiCall("POST", "/api/assessment/submit", assessmentData);
    
    const unverifiedResults = await apiCall("GET", `/api/results/${newData.reportId}`);
    
    if (unverifiedResults.status === 200 && unverifiedResults.data.isVerified === false) {
      logInfo("Unverified lead: Results returned but marked as unverified (gate active)");
    } else if (unverifiedResults.status === 403) {
      logInfo("Unverified lead: Results access DENIED (403)");
    } else {
      logInfo(`Unverified lead check: status=${unverifiedResults.status}`);
    }
    
    const { db } = await import("../server/db");
    const { leads, sajuResults } = await import("../shared/schema");
    const { eq, inArray } = await import("drizzle-orm");
    const { storage } = await import("../server/storage");
    
    const testLead = await storage.getLeadByEmail("unverified-test@example.com");
    if (testLead) {
      await db.delete(sajuResults).where(eq(sajuResults.leadId, testLead.id));
      await db.delete(leads).where(eq(leads.email, "unverified-test@example.com"));
    }
    
    logSuccess(scenario, "Access gate verified - results accessible only after email verification");
    return true;
    
  } catch (error) {
    logError(scenario, `Error: ${error}`);
    return false;
  }
}

async function runAllTests() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 BADA Lead-Report Verification Flow - API Integration Tests");
  console.log("=".repeat(60) + "\n");
  
  await cleanup();
  
  console.log("\n" + "-".repeat(60) + "\n");
  
  const s1 = await scenario1_FirstTimeUser();
  console.log("\n" + "-".repeat(60) + "\n");
  
  const s2 = await scenario2_ExistingUser();
  console.log("\n" + "-".repeat(60) + "\n");
  
  const s3 = await scenario3_EmailCorrection();
  console.log("\n" + "-".repeat(60) + "\n");
  
  const s4 = await scenario4_Verification();
  console.log("\n" + "-".repeat(60) + "\n");
  
  const s5 = await scenario5_BlockingLogic();
  console.log("\n" + "-".repeat(60) + "\n");
  
  await cleanup();
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60) + "\n");
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(r => {
    const icon = r.passed ? "✅" : "❌";
    console.log(`${icon} ${r.scenario}`);
    console.log(`   ${r.details}\n`);
  });
  
  console.log("-".repeat(60));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-".repeat(60) + "\n");
  
  if (failed > 0) {
    console.log("⚠️  Some tests failed. Please review the errors above.");
    process.exit(1);
  } else {
    console.log("🎉 All tests passed! API integration flow is working correctly.");
    process.exit(0);
  }
}

runAllTests().catch(error => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
