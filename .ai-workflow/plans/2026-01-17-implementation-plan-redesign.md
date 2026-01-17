# Implementation Plan: BADA Report Redesign (Web & PDF)

## Goal
Transform the Report Results experience into an "Immersive Narrative" (Arcteryx-inspired) and synchronize the PDF export to reflect this premium aesthetic statically.

## Strategy
1.  **Web (Results.tsx):** Build the 5-Act Scroll Narrative using `framer-motion`. Use existing `overlay` images as placeholders for both Background and Symbol layers (temporarily).
2.  **PDF (pdfExport.ts):** Completely rewrite `generateReportPDF` to produce a high-design, magazine-style PDF that mirrors the web aesthetic (Dark mode, typography focus, full-bleed images).

---

## Part 1: Web Implementation (`Results.tsx`)

### Architecture
Refactor `Results.tsx` to use a Main Container with 5 Section Components.
Import `framer-motion` for all scroll interactions.

### Component Breakdown
1.  **`ParallaxLayout`**: Wrapper for sticky background + scrolling content.
2.  **`HeroSection` (Identity)**:
    -   Placeholder: Use `overlay_fire.png` (etc.) as the "Symbol".
    -   Interaction: Scale down on scroll.
3.  **`TechnicalSection` (Hardware & OS)**:
    -   Dark background transparency.
    -   HUD-style graphs for OS Axes.
4.  **`GlitchSection` (Friction)**:
    -   Apply CSS `mix-blend-mode: exclusion` or similar for "interference" look.
5.  **`ProtocolSection` (Solution)**:
    -   Minimalist cards.

### Asset Mapping (Placeholder)
Since we don't have separate Background/Symbol images yet:
-   **Background:** Use the existing `overlay_*.png` (blurred via CSS).
-   **Symbol:** Use the same `overlay_*.png` (unblurred, masked if possible).

---

## Part 2: PDF Redesign (`pdfExport.ts`)

### Design Concept
"Digital Magazine" Look. Dark theme to match the web.
-   **Cover:** Full-page color (Element dominant). Large Typography.
-   **Page 1 (Identity):** Element Graphic + "Analysis".
-   **Page 2 (Hardware/OS):** 2-Column layout. Technical grid lines.
-   **Page 3 (Friction/Solution):** Contrast section. "Problem" on left (Dark), "Solution" on right (Light/Element Color).

### Technical Changes
-   Replace standard `text`, `moveDown` logic with absolute positioning or structured tables for layout precision.
-   Use `rect()` drawing for colored backgrounds.
-   Embed the `overlay` images into the PDF.

---

## Execution Steps

1.  **PDF Redesign (Priority 1):**
    -   Rewrite `client/src/lib/pdfExport.ts`.
    -   Test download to ensure it looks "Premium".

2.  **Web Redesign (Priority 2):**
    -   Install `framer-motion` (if not present).
    -   Create `client/src/components/Report/` directory.
    -   Implement the 5 Sections.
    -   Assemble in `Results.tsx`.

3.  **Verification:**
    -   Check Web Scroll Interaction.
    -   Check PDF Visual Match.
