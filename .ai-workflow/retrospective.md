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