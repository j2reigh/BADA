/**
 * Saju Knowledge Base - Interpretation Logic
 * Contains structured Five Elements metadata and Ten Gods interaction patterns
 * for Gemini System Prompt enrichment
 */

export interface FiveElementInfo {
  keyword: string;
  excess: string;
  deficiency: string;
}

export interface InteractionPattern {
  combo: string;
  theme: string;
  desc: string;
}

/**
 * FIVE_ELEMENTS_INFO
 * Maps the five elements to their core keywords and excess/deficiency characteristics
 */
export const FIVE_ELEMENTS_INFO: Record<string, FiveElementInfo> = {
  wood: {
    keyword: "Growth, Creativity",
    excess: "Over-planning, Impatience",
    deficiency: "Lack of Drive, Directionless",
  },
  fire: {
    keyword: "Passion, Expression",
    excess: "Burnout, Over-excitement",
    deficiency: "Coldness, Lack of Motivation",
  },
  earth: {
    keyword: "Stability, Responsibility",
    excess: "Stubbornness, Stagnation",
    deficiency: "Anxiety, Distraction",
  },
  metal: {
    keyword: "Judgment, Control",
    excess: "Critical, Cold-hearted",
    deficiency: "Indecisive, Lack of Focus",
  },
  water: {
    keyword: "Emotion, Wisdom",
    excess: "Wandering, Anxiety",
    deficiency: "Insensitive, Lack of Insight",
  },
};

/**
 * INTERACTION_PATTERNS
 * Documents psychological themes that emerge from combinations of Ten Gods
 * Useful for understanding how different archetypal energies interact in a chart
 */
export const INTERACTION_PATTERNS: InteractionPattern[] = [
  // 1. 비견 (Self-Drive) combinations
  {
    combo: "Self-Drive + Stability",
    theme: "Self-Driven Wealth",
    desc: "Creating income through personal effort and conviction.",
  },
  {
    combo: "Self-Drive + Expansion",
    theme: "Networker",
    desc: "Has a keen sense for opportunity and leads trends.",
  },
  {
    combo: "Self-Drive + Creativity",
    theme: "Creator",
    desc: "Risks everything on personal ideas and techniques.",
  },
  {
    combo: "Self-Drive + Freedom",
    theme: "Rebel",
    desc: "Rejects established rules and creates new systems.",
  },
  {
    combo: "Self-Drive + Authority",
    theme: "Responsible Leader",
    desc: "Takes personal responsibility for outcomes.",
  },
  {
    combo: "Self-Drive + Pressure",
    theme: "Challenger",
    desc: "Growth happens through confrontation and pressure.",
  },
  {
    combo: "Self-Drive + Learning",
    theme: "Scholar",
    desc: "Identity is inseparable from knowledge.",
  },
  {
    combo: "Self-Drive + Intuition",
    theme: "Loner Philosopher",
    desc: "Maintains distance from the world to observe clearly.",
  },

  // 2. 겁재 (Rivalry) combinations
  {
    combo: "Rivalry + Stability",
    theme: "Risk Taker",
    desc: "Competes fiercely while building wealth.",
  },
  {
    combo: "Rivalry + Expansion",
    theme: "Aggressive Entrepreneur",
    desc: "Bold risk-taker willing to disrupt markets.",
  },
  {
    combo: "Rivalry + Authority",
    theme: "Power Struggle",
    desc: "Leadership clashes when convinced their way is right.",
  },
  {
    combo: "Rivalry + Pressure",
    theme: "Survivor",
    desc: "Thrives and strengthens under crisis.",
  },
  {
    combo: "Rivalry + Learning",
    theme: "Anxious Learner",
    desc: "Driven to learn more when feeling threatened.",
  },
  {
    combo: "Rivalry + Intuition",
    theme: "Unique Artist",
    desc: "Creative brilliance emerges from solitude and struggle.",
  },

  // 3. 식신 (Creativity) combinations
  {
    combo: "Creativity + Freedom",
    theme: "Pure Creator",
    desc: "Makes what they genuinely want without restriction.",
  },
  {
    combo: "Creativity + Stability",
    theme: "Steady Builder",
    desc: "Accumulates value through consistent creation.",
  },
  {
    combo: "Creativity + Expansion",
    theme: "Marketer",
    desc: "Creates excellent products and knows how to sell them.",
  },
  {
    combo: "Creativity + Authority",
    theme: "Prudent Leader",
    desc: "Builds trust through reliable and honest output.",
  },
  {
    combo: "Creativity + Pressure",
    theme: "Problem Solver",
    desc: "Tough resilience means repeated recovery and rebuilding.",
  },
  {
    combo: "Creativity + Learning",
    theme: "Master Craftsman",
    desc: "Pursues depth and expertise to achieve mastery.",
  },
  {
    combo: "Creativity + Intuition",
    theme: "Emotional Artist",
    desc: "Creates from emotional truth and subconscious wellspring.",
  },

  // 4. 상관 (Freedom) combinations
  {
    combo: "Freedom + Stability",
    theme: "Strategist",
    desc: "Transforms ideas into tangible financial success.",
  },
  {
    combo: "Freedom + Expansion",
    theme: "Startup Founder",
    desc: "Breaking rules opens opportunity and new pathways.",
  },
  {
    combo: "Freedom + Authority",
    theme: "Revolutionary",
    desc: "Stands against existing systems and structures.",
  },
  {
    combo: "Freedom + Pressure",
    theme: "Crisis Innovator",
    desc: "Heightened creativity emerges during crisis.",
  },
  {
    combo: "Freedom + Learning",
    theme: "Educator & Speaker",
    desc: "Teaches and persuades through dynamic communication.",
  },
  {
    combo: "Freedom + Intuition",
    theme: "Visionary",
    desc: "Expresses the invisible and intangible.",
  },

  // 5. Mixed patterns (Wealth, Authority, Learning, Seal combinations)
  {
    combo: "Stability + Authority",
    theme: "CEO/Manager",
    desc: "Sustains orderly growth and institutional success.",
  },
  {
    combo: "Stability + Pressure",
    theme: "Brand Builder",
    desc: "Systematically expands personal brand and presence.",
  },
  {
    combo: "Expansion + Pressure",
    theme: "Entrepreneur",
    desc: "Takes calculated risks to expand and scale.",
  },
  {
    combo: "Stability + Creativity",
    theme: "Professional",
    desc: "Achieves mastery through daily incremental effort.",
  },
  {
    combo: "Expansion + Freedom",
    theme: "Trendsetter",
    desc: "Creates new markets and economic opportunities.",
  },
  {
    combo: "Authority + Learning",
    theme: "Trusted Advisor",
    desc: "Leadership grounded in principle and knowledge.",
  },
  {
    combo: "Authority + Intuition",
    theme: "Insightful Guide",
    desc: "Understands people while maintaining order.",
  },
  {
    combo: "Pressure + Intuition",
    theme: "Intuitive Founder",
    desc: "Anxiety and unease fuel creative breakthroughs.",
  },
  {
    combo: "Pressure + Learning",
    theme: "Growth Mindset",
    desc: "Adversity becomes the crucible for transformation.",
  },
  {
    combo: "Learning + Intuition",
    theme: "Deep Thinker",
    desc: "Interprets the world with philosophical depth.",
  },
  {
    combo: "Learning + Self-Drive",
    theme: "Thought Leader",
    desc: "Converts learning into decisive action.",
  },
  {
    combo: "Intuition + Freedom",
    theme: "Conceptor",
    desc: "Emotions transform into language and ideas.",
  },
  {
    combo: "Intuition + Expansion",
    theme: "Realist Strategist",
    desc: "Transforms imagination into concrete reality.",
  },
];
