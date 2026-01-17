# AI Workflow Retrospective - 2026-01-14

## Context
Refactoring the BADA Report generation prompt to align with specific identity logic (Adjective + Day Master Noun) and removing incorrect zodiac animal logic.

## Observations & Issues
- **Reason for Output Loop:** Encountered a repetitive "I'll submit -> Wait!" loop during the verification phase. This was caused by performing mental simulations of the code execution (like "Luminous The Navigator" grammar check) *after* deciding to finish, rather than during the planning/implementation phase.
- **Dependency Missing:** Discovered that the `stats.operatingRate` field was missing from the `SajuResult` interface, causing the Gemini prompt to fail during runtime/compilation. This was resolved by implementing a heuristic calculation in `saju_calculator.ts`.
- **Type Mismatches:** Found that the `lunar-typescript` library returns arrays for hidden stem gods, which needed explicit handling in the Bazi logic.

## Actions Taken
1. Updated `lib/gemini_client.ts` prompt and JSON schema.
2. Implemented `operatingRate` logic in `lib/saju_calculator.ts`.
3. Fixed broken imports and type errors to unblock the build.
4. Committed changes and documented this workflow.

## Lessons Learned
- **Plan for Variables Early:** Define the exact expected values of key variables (like identity nouns) during the planning stage to avoid late-stage logic corrections.
- **Verify Build Pre-emptively:** Run `tsc` earlier in the process when touching core data structures to identify cascading errors across the codebase.

---

## Context (Session 2)
Implementing Gumroad Payment Fallback (Email Matching) because Custom Fields configuration was not feasible for the user.

## Observations & Issues
- **Requirement Adaptation:** The user couldn't use Custom Fields (`report_id`) in Gumroad. I had to pivot to an "Email Matching" strategy.
- **Data Dependency:** To maximize matching success, I needed to pre-fill the email on the Gumroad checkout. I realized `Results.tsx` didn't have access to the user's email from the API response, creating a blocker.
- **Resolution:** I modified the backend endpoint `/api/results/:reportId` to expose the email, unblocking the frontend implementation.

## Actions Taken
1. **Backend Update:** Modified `server/routes.ts` webhook handler to implement a fallback: if `report_id` is missing, look up the Lead by `email` and unlock their latest report.
2. **API Update:** Updated `/api/results/:reportId` to return the `email` field.
3. **Frontend Update:** Updated `client/src/pages/Results.tsx` to append `&email=...` to the Gumroad URL.

## Lessons Learned
- **End-to-End Data Flow:** When implementing integrations (like Payment), always trace the data (e.g., Email) from the database to the final UI link *before* writing code. I correctly identified the missing email data in the API response early, preventing a "why is the email empty?" debugging cycle later.

---

## Context (Session 3 - 2026-01-16)
Creating E2E test plan and implementing development mode bypasses for email verification and payment checks to enable faster testing.

## Observations & Issues
- **Port Confusion:** Initially used port 5000 in test documentation when the actual dev server runs on 5001. This caused confusion during testing.
- **UUID Format Issue:** Discovered that the old report ID `uVC0o3chY_CEGmzQ5PGZ5` was not a valid UUID format, causing database query failures. The `saju_results` table uses UUID type for the `id` column.
- **Server Restart Issues:** After code changes, the server didn't automatically restart properly, requiring manual process termination (EADDRINUSE error on port 5001).
- **Development Mode Implementation:** Successfully added conditional logic to bypass email verification and payment checks when `NODE_ENV === 'development'`, making testing much faster.
- **Code Edit Errors:** Made several mistakes when editing `routes.ts`, accidentally breaking the development mode endpoint structure. Had to fix the broken code structure carefully.

## Actions Taken
1. **Test Plan Creation:** Created comprehensive E2E test plan at `.ai-workflow/test-plan-e2e-user-flow.md` covering the full user journey from landing to results.
2. **Port Correction:** Updated all URLs in test plan from port 5000 to 5001.
3. **Development Bypasses:** 
   - Added email verification bypass in `/api/results/:reportId` endpoint
   - Added payment check bypass to show full report in development mode
   - Added console logging for bypass actions
4. **Debug Endpoint:** Attempted to add `/api/debug/reports` endpoint but encountered import path issues with `./db`.
5. **Report Generation:** Successfully generated new test report via API (`178042c1-4c04-44d4-97d9-780a38f55a09`) and verified it loads correctly.

## Lessons Learned
- **Verify Port Configuration:** Always check the actual running port before creating documentation or test scripts. Don't assume default ports.
- **Database Schema Awareness:** When debugging "report not found" errors, check if the ID format matches the database column type (UUID vs string).
- **Development Mode Best Practices:** Adding development-only bypasses for authentication/payment is essential for rapid testing, but must be properly scoped with `process.env.NODE_ENV` checks.
- **Code Edit Precision:** When making multiple edits to the same file, be extremely careful with the target content to avoid breaking the file structure. View the file context before each edit.
- **Process Management:** When encountering EADDRINUSE errors, use `lsof -ti:PORT | xargs kill -9` to clean up zombie processes before restarting the server.

---

## Context (Session 4 - 2026-01-17)
Implementing Operating Rate v2.3 based on Hardware (Saju) + OS (Survey) Alignment. Moving from a raw percentage score to a 5-Level System (Survival, Recovery, Stable, Aligned, Flow).

## Observations & Issues
- **Runtime Data Loss:** Initially, the `hardwareAnalysis` field generated in `saju_calculator.ts` was missing from the final response. This was likely due to the server process not restarting after code changes, or potentially strict type handling. Restarting the server resolved it.
- **Frontend-Backend Type Mismatch:** Updated `Results.tsx` to handle optional `level` fields, but `pdfExport.ts` still required strict string types, causing build errors. Had to synchronize the interfaces.
- **Port Conflict:** `curl` tests failed on port 5000 (AirPlay receiver). Switched to 5001.
- **Workflow Efficiency:** E2E testing via `curl` with a comprehensive payload proved highly effective for verifying the complex logic engine without UI dependence.

## Actions Taken
1. **Logic Engine:** Created `lib/operating_logic.ts` implementing the full v2.3 algorithm (OS Mode, Threat Mode, Intensity Bonus, Validity).
2. **Calculation Update:** Enhanced `lib/saju_calculator.ts` to calculate `Hardware Score` and `Interaction Penalty`.
3. **API Integration:** Updated `/api/assessment/submit` in `server/routes.ts` to run `analyzeOperatingState` and store results in `jsonb`.
4. **AI Prompts:** Modified `lib/gemini_client.ts` to generate "Identity Page" and "Action Protocol" based on the user's Operating Level and specific Guidance.
5. **Frontend & PDF:** Updated `Results.tsx` and `pdfExport.ts` to render the "Operating Level" and Metaphor instead of the raw percentage.

## Lessons Learned
- **Type Consistency verifies Architecture:** When data types conflict between PDF generation and API validation, it often signals a need to support backward compatibility (Optional fields) or strict migration.
- **Server Process:** In Node.js development, always check if the process actually restarted after editing core library files. `lsof -t | xargs kill` is a handy tool.