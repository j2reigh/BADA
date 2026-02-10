# Report Results Page Redesign Plan (AS-IS / TO-BE)

**Date:** 2026-01-15 15:15
**Agent:** Gemini
**Reviewer:** Claude
**Related Issue:** User request to restructure the plan in an AS-IS -> TO-BE format.

---

## 📌 Goal

To redesign the report results page to solve key readability and shareability issues, guided by the Co-Star reference. The aim is to transform the page from a simple text dump into a visually engaging, shareable, and "Instagrammable" personal dashboard.

---

## 1. 레이아웃 (Layout)

### AS-IS (Current Problem)
- All information is in a single vertical column. This makes the report feel long, monotonous, and lacks a visual anchor, causing users to lose focus as they scroll.

### TO-BE (Proposed Solution)
- **Introduce a 2-column "dashboard" layout** for desktop screens.
    -   **Left Column (Sticky):** This column will be fixed on the left, containing the user's core identity (e.g., "Resilient Pioneer") and a **new, abstract visual diagram** representing their birth pattern. It will act as a constant visual anchor.
    -   **Right Column (Scrollable):** The detailed report sections will scroll here, allowing users to explore their results while keeping their core identity in view. This layout collapses gracefully into a single column on mobile.

---

## 2. 가독성 및 정보 전달 (Readability & Information)

### AS-IS (Current Problem)
- Information is presented in large, dense paragraphs. It's difficult for users to quickly scan and identify key insights. All text has the same visual weight, making nothing stand out.

### TO-BE (Proposed Solution)
- **"Chunk" information and add strong visual hierarchy.**
    -   **Icons & Headings:** Each major section ("Your Natural Blueprint", etc.) will start with a large heading and a unique icon to signal its content intuitively.
    -   **Content Decomposition:** Long paragraphs will be broken down into multiple, easier-to-digest formats:
        -   An *italicized, one-sentence summary* at the top.
        -   Key insights as a **bulleted list** with icons.
        -   Impactful statements presented in **highlighted quote blocks**.
    -   **Typography:** A clear typographic scale will be established to visually differentiate between titles, subtitles, and body text.

---

## 3. 잠금 콘텐츠 및 결제 유도 (Locked Content & Paywall)

### AS-IS (Current Problem)
- The entire content block for locked sections is blurred. This is visually jarring and doesn't clearly communicate what the user will get upon unlocking, leading to a weak call-to-action.

### TO-BE (Proposed Solution)
- **Implement a clear, informative "Paywall" component.**
    -   The title and icon of the locked section will remain visible to spark curiosity.
    -   The content area will be replaced by a component featuring a lock icon, a clear teaser (e.g., "Unlock your full Action Protocol to see your personalized strategies."), and a prominent "Unlock Full Report" button.

---

## 4. 공유 기능 (Sharing Feature)

### AS-IS (Current Problem)
- There is currently no way for a user to share their report with friends. This misses a huge opportunity for organic, word-of-mouth growth.

### TO-BE (Proposed Solution)
- **Introduce a "Shareable URL" feature.**
    -   A "Share" button will be added (e.g., in the sticky left column).
    -   Clicking this button will call a new API endpoint to generate a unique, non-guessable URL (e.g., `/shared/abc-123`).
    -   This URL leads to a read-only, beautifully formatted version of their full report, which they can easily copy and share. This requires both frontend and backend work, including a new database table for share tokens.

---

## 📁 Files to be Modified / Created

-   [ ] `client/src/pages/Results.tsx`: Major refactoring.
-   [ ] `client/src/pages/SharedReport.tsx`: **[NEW]**
-   [ ] `server/routes.ts`: Add new API endpoints.
-   [ ] `server/storage.ts`: Add new DB functions.
-   [ ] `shared/schema.ts`: Add new `shared_reports` table.

---
