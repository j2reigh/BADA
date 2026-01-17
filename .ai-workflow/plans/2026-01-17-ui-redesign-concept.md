# Design Concept: BADA Report v2.0 - "Raw Nature & Technical Precision"

## 1. Design Philosophy
Combining the **raw, immersive aesthetic of nature** (Arcteryx reference) with the **precision of a technical analysis** (Report data).
The goal is to move away from a standard "Dashboard" look to an "Editorial/Cinematic" experience on mobile.

### Core Visual Keywords
- **Immersive:** Full-screen imagery, minimal distraction.
- **Atmospheric:** Deep colors, fog/grain textures, dramatic lighting.
- **Tactile:** Typography that feels physical, smooth motion physics.
- **Mobile-First:** Vertical scrolling narrative, thumb-friendly interactions.

---

## 2. Interaction Strategy (The "Scroll Narrative")
We will implement advanced scroll interactions to make the long report feel like a journey.

### A. Parallax & Depth (Backgrounds)
- **Concept:** As the user scrolls, the background image moves slower than the content, creating depth.
- **Implementation:** `framer-motion` `useScroll` + `y` transform.
- **Reference:** [Background Image Parallax](https://blog.olivierlarose.com/tutorials/background-image-parallax)

### B. Section Transitions (Perspective)
- **Concept:** When moving from "Identity" to "Hardware", the previous card scales down and fades back, while the new card slides up over it. This mimics riffling through a high-end magazine stack.
- **Implementation:** Sticky positioning + Scale/Opacity interpolation based on scroll progress.
- **Reference:** [Perspective Section Transition](https://blog.olivierlarose.com/tutorials/perspective-section-transition)

### C. Text Reveal (Focus)
- **Concept:** Long text blocks (like Guidance) shouldn't overwhelm. Text starts at 50% opacity and becomes 100% distinct as it hits the reading line (center of screen).
- **Implementation:** Split text into words/lines, animate opacity based on viewport position.
- **Reference:** [Text Gradient Scroll Opacity](https://blog.olivierlarose.com/tutorials/text-gradient-scroll-opacity-v2)

---

## 3. Asset Requirements (Proposal)
To achieve the "Arcteryx" vibe without existing assets, we need **one high-quality vertical image per Element**. These will serve as the "Anchor Visuals" for each user's report background.

**Request to User:** Please upload high-res (Unsplash/Stock is fine) vertical images for the 5 Elements. Ideally "Dark/Moody" tone to match white text.

| Element | Recommended Visual (Metaphor) | Vibe/Color |
|:---:|:---|:---|
| **Wood (목)** | Deep forest, mossy bark, upward branching trees | Deep Emerald, Forest Green |
| **Fire (화)** | Ember, lava texture, warm sunset light causing silhouette | Burnt Orange, Deep Red |
| **Earth (토)** | Sand dunes, granite rock face, clay textures | Warm Grey, Beige, Terracotta |
| **Metal (금)** | Steel beams, glacial ice, jagged raw stone | Cool Silver, Slate Blue, White |
| **Water (수)** | Deep ocean surface, rain on glass, flowing ink | Midnight Blue, Black |

*Note: I can also generate placeholders using the `generate_image` tool if you prefer not to find stock photos immediately.*

---

## 4. UI Architecture (Mobile Flow)

### I. The Cover (Viewport 1)
- **Background:** User's Element Image (Full screen).
- **Content:** 
  - Large Typography: "{NAME}'S BLUEPRINT".
  - Subtitle: "BADA Rate: Aligned (Level 4)".
  - Scroll Hint: A subtle animated arrow or line at bottom.

### II. Identity Layer (Identity Section)
- **Transition:** Cover image dims, White Card slides up (Glassmorphism).
- **Content:** 
  - Core Adjective & Noun (e.g., "Luminous Navigator").
  - "The Story": Text Reveal interaction for the short bio.

### III. The System (Hardware & OS)
- **Layout:** Dark Mode Section.
- **Visual:** Technical Grid / Data Visualization.
- **Interaction:**
  - Hardware Score bars animate in.
  - OS Circle graph spins/fills.

### IV. Action Protocol (Rituals)
- **Visual:** Clean list with significant whitespace.
- **Interaction:** Each ritual item scales up slightly when centered in view.

---

## 5. Technical Stack
- **Framework:** React + Tailwind CSS
- **Animation:** `framer-motion` (Best for React scroll interactions) or `lenis` for smooth scrolling physics.
- **Structure:**
  - `ScrollLayover.tsx`: Manages the sticky stacking of sections.
  - `ParallaxImage.tsx`: Reusable component for backgrounds.
  - `TextReveal.tsx`: Component for long text blocks.

## 6. Next Steps
1.  **Approve Concept:** Do you like this direction?
2.  **Asset Acquisition:** Upload 5 elemental images (or ask me to generate/find them).
3.  **Implementation:** I will scaffold the new mobile layout using `framer-motion`.
