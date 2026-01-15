# Landing Page Alignment & Interaction Renewal Plan (v2)

**Date:** 2026-01-15 12:30
**Agent:** Gemini
**Reviewer:** Claude
**Related Issue:** User feedback to add scroll-snapping and a stacking card interaction.

---

## 📌 Goal

1.  **Alignment:** Modify sections from center-aligned to left-aligned for consistency.
2.  **Focus Interaction:** Enhance the scroll-based focus effect to be more pronounced.
3.  **Scroll Snapping:** Implement a "snapping" effect so each full-screen section locks into place.
4.  **Stacking Interaction:** Recreate the `realfood.gov` stacking card effect for the "Report Preview" section.

---

## 📁 File to be Modified

- [ ] `client/src/pages/Landing.tsx` - This file will be significantly modified to adjust styles, component logic, and JSX structure to support the new interactions.

---

## 🔧 Implementation Plan

### Part A: Left Alignment

1.  **Locate & Remove:** In `client/src/pages/Landing.tsx`, find `div`s with the `text-center` class within the `AnalysisSection` and `FinalCTA` and remove the class.

### Part B: Enhanced Scroll Focus Interaction

1.  **Modify `FocusSection`:** In the `FocusSection` component, adjust the `style` prop for the `isInView: false` state to make the effect more pronounced.
    *   `opacity`: from `0.3` to `0.2`.
    *   `filter`: from `blur(2px)` to `blur(4px)`.
    *   `transform`: from `scale(0.98)` to `scale(0.97)`.

### Part C: Scroll Snapping

1.  **Apply to Parent:** In `Landing` component, apply scroll-snap CSS properties to the main scrolling container (the `<main>` element). This will force the viewport to snap to the start of each section.
    ```css
    /* In a global CSS file or via style prop */
    main {
      scroll-snap-type: y mandatory;
    }
    ```
2.  **Apply to Children:** For each direct child `<section>` inside the main content `div` (e.g., `HeroSection`, `AnalysisSection`'s zones), apply the following property.
    ```css
    section {
      scroll-snap-align: start;
    }
    ```
    This can be done by adding a `snap-start` class from Tailwind if configured, or via inline styles.

### Part D: Stacking Report Preview Interaction

This is the most complex part and requires refactoring the "Report Preview" section (`Zone 4`).

1.  **Create Wrapper:** Wrap the entire "Report Preview" section in a parent `div` that has an explicit height to control the scroll duration of the animation (e.g., `height: '300vh'`).
2.  **Create Sticky Container:** Inside the wrapper, create a `div` that will stick to the top of the screen while scrolling through the wrapper. This will act as the stage for the animation.
    ```jsx
    <div style={{ position: 'sticky', top: '0' }}>
      {/* Cards will be animated here */}
    </div>
    ```
3.  **Animate Cards:**
    *   Map over the 5 report pages to create 5 `motion.div` card components.
    *   Use the `useScroll` hook with `target` pointing to the main wrapper `div` to get the scroll progress.
    *   For each card `i`, use `useTransform` to map the scroll progress to its `scale` and `y` properties.
    *   The animation will be timed so that as you scroll, each card moves up and scales down slightly to create the illusion of stacking on top of the previous one. For example, when scroll progress is at 20%, Card 1 is fully visible. Between 20-40%, Card 2 animates into place on top of Card 1.

---

## ⚠️ Considerations & Risks

-   **Complexity:** The Stacking Interaction (Part D) is significantly more complex than the other changes and will require careful implementation of `Framer Motion` hooks.
-   **Refactoring:** Part D requires a completely new structure for the "Report Preview" section, abandoning the simple `FocusSection` wrapper for that zone.
-   **Performance:** While `Framer Motion` is performant, a complex scroll-linked animation should be tested on various devices to ensure it's smooth.

---

## 🧪 Test Plan

-   [ ] Verify left-alignment in modified sections.
-   [ ] Verify the enhanced scroll focus effect is working.
-   **[NEW]** Scroll through the page and confirm that each section "snaps" into place at the top of the viewport.
-   **[NEW]** Scroll through the "Report Preview" section and confirm that the cards stack on top of each other as expected, mimicking the `realfood.gov` reference.
-   [ ] Check for any negative performance impact or jankiness while scrolling, especially in the new stacking section.
-   [ ] Ensure all changes are responsive and look good on mobile.

---
