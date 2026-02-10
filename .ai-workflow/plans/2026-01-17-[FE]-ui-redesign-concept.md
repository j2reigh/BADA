# BADA Report UI Redesign Plan v2.1 - "The Core Symbol"

## 1. Content-Design Analysis (Corrected)
A rigorous analysis of `Results.tsx` confirms the report creates a **5-Act Narrative**. The UI must reflect the emotional arc of each act.

| Act | Section | Content Essence | Current Issue (AS-IS) | Visual Metaphor (TO-BE) |
|:---:|:---|:---|:---|:---|
| **1** | **Identity** | Who am I? (Archetype) | Static text list. | **The Reveal:** Cinematic. Full-screen Nature + 3D Symbol. Pure Awe. |
| **2** | **Hardware** | How am I wired? (Nature/Shadow) | Long text blocks. | **The Blueprint:** Editorial. Elegant typography. Dark Mode switch for "Shadow". |
| **3** | **OS** | How do I function? (Mechanics) | Generic cards. | **The Diagnostics:** HUD Style. Precision data lines. Schematic visuals. |
| **4** | **Friction** | Why am I stuck? (Mismatch) | Text list. | **The Glitch:** Visual noise/distortion. "Signal Interference" aesthetic. |
| **5** | **Solution** | What do I do? (Protocol) | Simple checklist. | **The Protocol:** System Restore. Clean, high-contrast, actionable. |

---

## 2. TO-BE Concept: "Raw Nature & Technical Precision"
**Reference:** Arcteryx (Immersive, Vertical Scroll, Atmospheric).
**Core Concept:** The user is exploring a deep natural phenomenon (User's Self) using high-tech precision tools (The Report).

### Key Architectural Change: The "Symbol" is the Anchor
The Report is an **interactive showcase of the User's Symbol**.
- **The Background:** Sets the Mood (Nature, Texture, Fog).
- **The Symbol:** The Protagonist (3D Object). It evolves through the 5 Acts (Revealed -> Analyzed -> Glitched -> Restored).

---

## 3. Visual Layering Strategy
We will implement a layered architecture to support deep parallax interactions.

| Layer | Content | Asset Requirement | Behavior |
|:---:|:---|:---|:---|
| **1. Background** | Atmospheric Nature Photography (Arcteryx vibe) | **High-Res Vertical Image** (Dark/Moody) | Slow Parallax (moves 20% speed) |
| **2. Middle** | Glassmorphism UI / Typography | CSS/React Components | Normal Scroll |
| **3. The Symbol** | **3D Object / Geometry** | **Transparent PNG/WebP** (High Quality) | Sticky Position + Evolving State |

---

## 4. Interaction Flow (The Narrative Journey)

### Act 1: The Reveal (Identity)
- **Visual:** Full-screen Nature Background + Large Floating Symbol (Foggy).
- **Interaction:**
    1.  **Scroll:** Symbol clears fog, scales up. Title "{NAME}'S BLUEPRINT" fades in.
    2.  **Detail:** "Definition" card slides up (Glassmorphism).

### Act 2: The Blueprint (Hardware)
- **Visual:** Symbol becomes a subtle "Watermark" in the corner. Typography becomes dominant (Serif header, Sans body).
- **Shadow Mode:** When scrolling to "Shadow Side", the background dims significantly, and the Symbol might glow with a "Heat" effect (e.g., Red/Orange).

### Act 3: Diagnostics (OS)
- **Visual:** "Tech Overlay" fades in. Thin lines, precise numbers.
- **Interaction:** The axes (Threat/Env/Agency) animate like system diagnostic bars (0 -> 100%).

### Act 4: The Glitch (Friction/Mismatch)
- **Visual:** This is the "Crisis" point.
- **Effect:** The Symbol or Background exhibits "Digital Noise" or "Chromatic Aberration". The cards represent "System Errors" that need debugging.
- **Interaction:** Scrolling stabilizes the visual slightly, symbolizing understanding.

### Act 5: The Protocol (Solution)
- **Visual:** Cleanest section. Pure Order.
- **Interaction:** Ritual cards have "Focus State" (Scale up when centered).
- **Closing:** The Symbol returns to center, fully clear and glowing. "System Optimized."

---

## 5. Asset Request List
To realize this vision, we need to organize assets by **Element**.

**Request to User:**
1.  **Backgrounds:** Please upload 5 High-Res Nature photos (Dark/Atmospheric).
2.  **Symbols:** Please upload 5 High-Quality 3D Symbol images (Transparent PNG).

**Folder Structure Created:**
`client/public/assets/elements/{wood,fire,earth,metal,water}/`

---

## 6. Implementation Plan
1.  **Asset Setup:** User uploads images.
2.  **Scaffolding:** Create `ParallaxContainer` and `SymbolViewer` components.
3.  **Migration:** Move `Results.tsx` content into the new 5-Act layout.
4.  **Polish:** Tune scroll physics (`framer-motion`).
