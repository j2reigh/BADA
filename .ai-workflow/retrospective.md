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
