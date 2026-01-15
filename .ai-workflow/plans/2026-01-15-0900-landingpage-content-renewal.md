# Landing Page Content Renewal Plan (v3)

**Date:** 2026-01-15 10:00
**Agent:** Gemini
**Reviewer:** Claude
**Related Issue:** User feedback to revise the landing page content plan (v2).

---

## 📌 Goal

To refine the landing page copy to better resonate with users and increase conversions. The content will be in simple English, focus on a clear problem/solution, and provide an *accurate* preview of the product, while respecting the existing design structure.

---

## 📁 File to be Modified

- [ ] `client/src/pages/Landing.tsx` - Change text content and add a new "Report Preview" section.

---

## 🔧 New Content Structure (in Simple English)

### Section 1: Hero - The Core Problem
- **Headline (H1):** Working hard, but feeling empty?
- **Sub-headline (H2):** It's not you, it's a system mismatch. In a world of uncertainty, just being busy is not the answer.
- **Message (P):** The content in this section should encourage the user to click the main Call-to-Action button.

### Section 2: The Pain - Why We Feel Lost
- **Title:** Why does the "right path" feel wrong?
- **Content (3 Cards):**
    1.  **Uncertainty:** "The world is changing fast. Is my career future-proof?"
    2.  **Burnout:** "Following self-help gurus and 'proven' routines leaves me tired, not inspired."
    3.  **Mismatch:** "Am I lazy, or just running on the wrong operating system?"

### Section 3: The Solution - Self-Alignment
- **Title:** The Secret to a Happy Life Isn't Just Achievement.
- **Key Quote:** "A landmark 85-year Harvard study found a clear answer: a life aligned with *who you are* is the key to lasting happiness."
- **Solution (P):** We call this **Self-Alignment**. It’s about understanding your core programming and living by it. It’s about finding your flow, not forcing it.

### Section 4: The How - The BADA Report
- **Title:** Your Personal Instruction Manual
- **Sub-title:** We decode your life's code.
- **Content:**
    - BADA offers a new kind of analysis. We blend timeless wisdom about natural energy (your **Birth Pattern**) with modern concepts from systems thinking.
    - The result is a detailed map of your internal **Operating System (OS)** — revealing how you're wired to think, act, and connect.
    - We don't give you a simple label. We show you how your system works: your core drives (Hardware), your current mindset (Software), and the conflicts between them that cause "energy leaks."

### Section 5: NEW - Preview The Report
- **Title:** See What's Inside Your Report
- **Content:** Get a glimpse of the insights waiting for you. Your report is a comprehensive guide to your inner world.
- **Mockup Image:** [A clean, visually appealing mockup of a multi-page report will be placed here.]
- **Report Sections (Aligned with actual report structure):**
    - **Page 1: Your Life Blueprint:** A high-level summary of your core identity and potential.
    - **Page 2: Your Natural Blueprint:** An analysis of your innate hardware and natural strengths.
    - **Page 3: Your Current Operating System:** A diagnosis of your current mental and emotional software.
    - **Page 4: The Core Tension:** An insight into the specific friction between your hardware and software.
    - **Page 5: Your Action Protocol:** A personalized, step-by-step guide to achieve better alignment.

### Section 6: Final Message
- **Headline:** In the age of AI, your best strategy is to be more you.
- **Sub-headline:** Stop guessing. Start aligning. This final section should lead the user to the final Call-to-Action button at the bottom of the page.

---

## ⚠️ Considerations & Risks

- **CTA Buttons:** This content plan assumes the existing design with a **fixed/sticky CTA button** and a **final CTA button at the bottom of the page**. No new buttons should be added; the content should naturally lead users to these existing buttons.
- The new "Report Preview" section will require a mockup image asset. We will use a placeholder initially.
- The copy is written in English. This is a permanent language change for the landing page.
- All new text needs to be checked for responsiveness on mobile devices.

---

## 🧪 Test Plan

- [ ] Verify that the English copy is correctly implemented in `Landing.tsx`.
- [ ] Confirm the new "Report Preview" section is added with accurate page titles and a placeholder image.
- [ ] Test the page on various screen sizes (desktop, tablet, mobile) to ensure there are no layout issues with the existing CTA structure.
- [ ] Ask for user feedback on whether the new service description and the accurate report preview are much clearer and more persuasive.

---
