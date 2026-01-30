# QA Report: Data Flow Repair & Operating Constants English Migration

**Date:** 2026-01-30
**Tester:** Claude
**Commits:** `5bc1bcd`, `297dfdf`, `c15007a`
**QA Status:** [x] Pass with Issues

---

## Files Changed

```diff
M server/routes.ts
M client/src/pages/Survey.tsx
M client/src/pages/Results.tsx
M shared/operating_types.ts
M client/src/lib/simple-i18n.ts
M client/src/components/landing/EmbeddedDiagnosticCard.tsx
```

**Changes:**
- `server/routes.ts`: Assessment returns `isVerified`, skips email for verified leads, db null guard for archetype, dev mode wait bypass
- `client/src/pages/Survey.tsx`: Verified leads go to `/results` directly (skip `/wait`), survey questions use i18n
- `client/src/pages/Results.tsx`: Fallback UI when `page1_identity` is null
- `shared/operating_types.ts`: Korean constants converted to English
- `client/src/lib/simple-i18n.ts`: Indonesian Q1-Q8 translations added
- `client/src/components/landing/EmbeddedDiagnosticCard.tsx`: Uses actual Survey Q1 (4 options)

---

## Test Cases

### 1. Verified email: skip Wait, no re-verification
- **Input:** POST `/api/assessment/submit` with previously verified email (`ibwrhaspati@yahoo.com`)
- **Expected:** `isVerified: true`, `emailSent: false`
- **Actual:** `isVerified: true`, `emailSent: false`
- **Status:** [x] Pass

### 2. Results data structure (isPaid=false, Tease & Lock)
- **Input:** GET `/api/results/:reportId` for unpaid report
- **Expected:** `page1_identity` exists, pages 2-5 locked with teaser fields
- **Actual:** `page1_identity.title: "The Silent Starlight"`, pages 2-5 `locked: true` with `nature_title`, `os_title` etc.
- **Status:** [x] Pass

### 3. Wait endpoint: dev mode bypass
- **Input:** GET `/api/wait/:reportId` in development mode
- **Expected:** `isVerified: true` regardless of actual lead status
- **Actual:** `isVerified: true`
- **Status:** [x] Pass

### 4. New email: normal flow (unverified)
- **Input:** POST `/api/assessment/submit` with fresh email
- **Expected:** `isVerified: false`, `emailSent: true`
- **Actual:** `isVerified: false`, `emailSent: true`
- **Status:** [x] Pass

### 5. New email: Wait dev bypass works
- **Input:** GET `/api/wait/:reportId` for unverified lead in dev mode
- **Expected:** `isVerified: true` (dev bypass)
- **Actual:** `isVerified: true`
- **Status:** [x] Pass

### 6. Operating levels in English (no Korean)
- **Input:** New report generated after server restart
- **Expected:** `operatingAnalysis.levelDescription` and `guidance` in English
- **Actual:** `levelDescription: "System running normally. Optimal for routine."`, `guidance: ["Maintain current pace", ...]`
- **Status:** [x] Pass

### 7. birthTimeUnknown: fallback UI
- **Input:** POST submit with `birthTimeUnknown: true`, then GET results
- **Expected:** `page1_identity: null` (no report generated)
- **Actual:** `page1_identity: null`, Results page would render fallback UI with "Retake Assessment" button
- **Status:** [x] Pass

---

## Not Tested (Manual/Browser Required)

### UI-level flows (cannot test via curl)
- [ ] **Landing Q1 card**: 4 options render correctly, clicking navigates to `/survey?start=1`
- [ ] **Survey question translations**: KO/ID languages render correct translated text
- [ ] **Survey submit loading state**: spinner shows during submission
- [ ] **Wait page → Results redirect**: smooth transition (no flash) for verified leads
- [ ] **Results fallback UI**: "Report Unavailable" screen renders with Retake button
- [ ] **Locked sections visual**: LockedBlurOverlay renders correctly for pages 2-5
- [ ] **Language toggle on Footer**: EN/KO/ID switching works across Landing components
- [ ] **PDF export**: still works after Results.tsx changes

### Production-specific flows
- [ ] **Email verification link**: clicking verification email → redirect to `/results/:id`
- [ ] **Resend verification**: `/api/verification/resend` sends new email
- [ ] **Update email**: `/api/verification/update-email` works correctly
- [ ] **Unlock code (payment)**: `/api/results/:reportId/unlock` unlocks pages 2-5
- [ ] **Gumroad webhook**: payment webhook triggers unlock
- [ ] **Production mode (NODE_ENV=production)**: Wait page does NOT bypass verification

---

## Potential Issues

### Warning
- [ ] **Stale DB data**: Existing reports in DB still have Korean `operatingAnalysis`. Only new reports will have English. No migration script for old data.
- [ ] **`_internal` field exposed in API**: `sajuData.operatingAnalysis._internal` (hardwareScore, rawRate, alignmentType etc.) is visible to anyone inspecting network requests. Consider filtering before production deploy.
- [ ] **birthTimeUnknown UX gap**: When birth time is unknown, no report is generated at all. User goes through full survey + birth info form only to get "Report Unavailable". Consider warning earlier or generating a limited report.

### Info
- [ ] TypeScript strict: Two pre-existing `db possibly null` errors in routes.ts are now resolved (archetype lookup + debug endpoint).
- [ ] `landing.q1.*` translation keys are now orphaned (replaced by `survey.q1.*`). Safe to remove later.

---

## QA Summary

| Category | Pass | Fail | Total |
|----------|------|------|-------|
| API flow (curl) | 7 | 0 | 7 |
| UI flow (browser) | - | - | 8 (untested) |
| Production flow | - | - | 6 (untested) |
| **Total** | **7** | **0** | **21** |

---

## Human Review Required

**Review status:** [ ] Pending

**Recommended next steps:**
1. Browser QA for UI flows (Landing Q1 card, survey translations, Results fallback)
2. Production mode test before deploy (email verification must NOT be bypassed)
3. Decide on `_internal` field stripping from API response
4. Decide on birthTimeUnknown UX (warn earlier vs generate limited report)
