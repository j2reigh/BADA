/**
 * Saju Knowledge Base
 * Maps raw Saju characters to App's English Archetypes and Descriptions
 */

export interface DayMasterInfo {
  name: string;
  archetype: string;
  core: string;
  strength: string;
  weakness: string;
  psychology: string;
}

export interface EarthlyBranchInfo {
  name: string;
  element: string;
  traits: string;
  vibe: string;
}

export interface TenGodsInfo {
  english: string;
  label: string;
  meaning: string;
  psychology: string;
  risk: string;
}

/**
 * DAY_MASTER_MAP: Maps 10 Heavenly Stems to Core Identity
 * Heavenly Stems represent the "Day Master" (Ilju) - core identity
 */
export const DAY_MASTER_MAP: Record<string, DayMasterInfo> = {
  "甲": {
    name: "Gap (Pine Tree)",
    archetype: "Pioneer",
    core: "Upward growth, straightforwardness, benevolent leadership.",
    strength: "Strong drive to initiate, resilience, clear vision, hates being controlled.",
    weakness: "Can be rigid, lacks flexibility, breaks rather than bends.",
    psychology: "I must improve and move upward. I want to be the best or the first.",
  },
  "乙": {
    name: "Eul (Ivy)",
    archetype: "Survivor",
    core: "Flexibility, adaptability, networking, survival instinct.",
    strength: "Resilient in tough environments, pragmatic, good at utilizing resources/people.",
    weakness: "Can be dependent, overly sensitive to environment, indecisive.",
    psychology: "I will find a way to survive and thrive, no matter what.",
  },
  "丙": {
    name: "Byeong (Sun)",
    archetype: "Visionary",
    core: "Passion, public display, clarity, explosive energy.",
    strength: "Optimistic, fair, energetic, hides nothing, charismatic.",
    weakness: "Lack of persistence, easily bored, can be overly flashy or attention-seeking.",
    psychology: "I want to shine and reveal the truth. Boredom is my enemy.",
  },
  "丁": {
    name: "Jeong (Candle)",
    archetype: "Mentor",
    core: "Focused warmth, sacrifice, detailed focus, transformation.",
    strength: "Warm-hearted, distinct likes/dislikes, highly focused concentration, nurturing.",
    weakness: "Sensitive, emotional volatility, holds grudges, burns out easily.",
    psychology: "I focus my light on what (or who) truly matters to me.",
  },
  "戊": {
    name: "Mu (Mountain)",
    archetype: "Trust",
    core: "Reliability, stillness, neutrality, embracing.",
    strength: "Trustworthy, steady, heavy presence, objective.",
    weakness: "Slow to act, stubborn, inexpressive, ignores details.",
    psychology: "I stand firm. I observe and wait for the right moment.",
  },
  "己": {
    name: "Gi (Garden)",
    archetype: "Manager",
    core: "Nurturing, cultivation, practicality, categorization.",
    strength: "Detail-oriented, productive, educational, adaptable to reality.",
    weakness: "Over-thinking, suspicious, narrow perspective, easily stressed.",
    psychology: "I cultivate and organize my reality to be productive.",
  },
  "庚": {
    name: "Gyeong (Iron)",
    archetype: "Reformer",
    core: "Structure, revolution, decisiveness, loyalty.",
    strength: "Strong executive power, clear distinction between right and wrong, solid.",
    weakness: "Cold, argumentative, lacks empathy, authoritarian.",
    psychology: "I need to refine raw potential into something valuable and structured.",
  },
  "辛": {
    name: "Sin (Jewel)",
    archetype: "Specialist",
    core: "Delicate, precise, aesthetic, sharp.",
    strength: "Clear values, sophisticated, high standards, precise execution.",
    weakness: "Hypersensitive, sharp-tongued, self-centered, fragile ego.",
    psychology: "I want to be perfect and recognized for my unique value.",
  },
  "壬": {
    name: "Im (Ocean)",
    archetype: "Strategist",
    core: "Wisdom, flow, adaptability, scale.",
    strength: "Creative, accommodating, intelligent, thinks big.",
    weakness: "Over-thinking, unpredictable, manipulative, hides true intent.",
    psychology: "I flow around obstacles and eventually cover everything.",
  },
  "癸": {
    name: "Gye (Mist)",
    archetype: "Planner",
    core: "Intimacy, pervasiveness, intelligence, intuition.",
    strength: "Highly sensitive, empathetic, strategic, quiet influence.",
    weakness: "Moody, anxious, easily influenced by others, lacks physical stamina.",
    psychology: "I penetrate quietly and understand the essence.",
  },
};

/**
 * EARTHLY_BRANCH_MAP: Maps 12 Earthly Branches to Vibe/Energy
 * Earthly Branches represent the temporal and energetic "vibe" of destiny
 */
export const EARTHLY_BRANCH_MAP: Record<string, EarthlyBranchInfo> = {
  "子": {
    name: "Ja (Rat)",
    element: "Water",
    traits: "Secretive, highly intelligent, nocturnal, sexual energy, compressed potential.",
    vibe: "A seed waiting in the dark.",
  },
  "丑": {
    name: "Chuk (Ox)",
    element: "Wet Earth",
    traits: "Diligent, enduring hardship, connection between past and future, slightly pessimistic.",
    vibe: "Working silently in the freezing mud.",
  },
  "寅": {
    name: "In (Tiger)",
    element: "Wood",
    traits: "Explosive start, pure motivation, dawn, speed, planning.",
    vibe: "A tiger springing out of the woods.",
  },
  "卯": {
    name: "Myo (Rabbit)",
    element: "Wood",
    traits: "Decorating, detail-oriented, separation/division, youthful energy.",
    vibe: "Grass sprouting everywhere efficiently.",
  },
  "辰": {
    name: "Jin (Dragon)",
    element: "Wet Earth",
    traits: "Idealistic, complex, ambitious, storing water, dramatic transformation.",
    vibe: "A dragon flying in the clouds, dreaming big.",
  },
  "巳": {
    name: "Sa (Snake)",
    element: "Fire",
    traits: "Strategic, shifting, duality, urban energy, professional movement.",
    vibe: "Fire spreading efficiently on the ground.",
  },
  "午": {
    name: "O (Horse)",
    element: "Fire",
    traits: "Public, passionate, impulsive, honest, highest peak of energy.",
    vibe: "The sun at high noon.",
  },
  "未": {
    name: "Mi (Sheep)",
    element: "Dry Earth",
    traits: "Endurance, result-oriented, dryness, stubbornness, closing the cycle.",
    vibe: "Hot desert sand.",
  },
  "申": {
    name: "Sin (Monkey)",
    element: "Metal",
    traits: "Versatile, skillful, copying execution, separating emotions from work.",
    vibe: "A heavy iron tool or machine.",
  },
  "酉": {
    name: "Yu (Rooster)",
    element: "Metal",
    traits: "Perfectionist, sharp, jewelry, clean-cut, critical.",
    vibe: "A precisely cut diamond.",
  },
  "戌": {
    name: "Sul (Dog)",
    element: "Dry Earth",
    traits: "Loyalty, guarding, storage, mental/spiritual depth, fighting spirit.",
    vibe: "A guardian protecting the treasure at sunset.",
  },
  "亥": {
    name: "Hae (Pig)",
    element: "Water",
    traits: "Wisdom, convergence, mental world, preparing for new birth, relaxation.",
    vibe: "Deep ocean waters.",
  },
};

/**
 * TEN_GODS_MAP: Maps Korean Ten Gods to English Archetypes
 * Ten Gods describe how a person relates to effort, resources, expression, and authority
 */
export const TEN_GODS_MAP: Record<string, TenGodsInfo> = {
  "비견": {
    english: "Self-Drive",
    label: "Identity Reinforcement",
    meaning: "Independence, self-reliance, competition with peers.",
    psychology: "Wants to do things their own way. Highly confident but stubborn.",
    risk: "Isolation, uncooperative behavior.",
  },
  "겁재": {
    english: "Rivalry",
    label: "Driven by Competition",
    meaning: "Strong desire to win, ambition, rivalry, idea theft.",
    psychology: "Feels pressure to outperform others. Adrenaline-driven.",
    risk: "Impulsiveness, excessive risk-taking.",
  },
  "식신": {
    english: "Creativity",
    label: "Pure Expression",
    meaning: "Natural creativity, production, flow state, enjoyment of process.",
    psychology: "Enjoys creating freely. Finds satisfaction in output itself.",
    risk: "Procrastination, lack of realism, indulgence.",
  },
  "상관": {
    english: "Freedom",
    label: "Critical Innovation",
    meaning: "Breaking rules, critical expression, rebellious thinking.",
    psychology: "Questions authority. Wants to change outdated systems.",
    risk: "Interpersonal conflict, arrogance, overexposure.",
  },
  "편재": {
    english: "Expansion",
    label: "Control & Expansion",
    meaning: "Goal-oriented, risk-taker, fast action, loves variety.",
    psychology: "Sees opportunities everywhere. Opportunistic explorer.",
    risk: "Scattered focus, financial instability.",
  },
  "정재": {
    english: "Stability",
    label: "Stability & Ownership",
    meaning: "Practical, structured, consistent, financially grounded.",
    psychology: "Seeks security and steady progress. Prefers predictable systems.",
    risk: "Overcautious, stingy, rigid routine.",
  },
  "편관": {
    english: "Pressure",
    label: "Pressure & Responsibility",
    meaning: "Crisis management, charisma, survival instinct.",
    psychology: "Feels constant pressure to perform. Growth through hardship.",
    risk: "Burnout, excessive self-criticism.",
  },
  "정관": {
    english: "Authority",
    label: "Rules & Honor",
    meaning: "Law, order, integrity, discipline, social reputation.",
    psychology: "Asks 'What is the right thing to do?'. Upholds standards.",
    risk: "Overly conservative, rigid, fear of failure.",
  },
  "편인": {
    english: "Intuition",
    label: "Intuition & Doubt",
    meaning: "Insightful, introspective, philosophical, unconventional.",
    psychology: "Seeks hidden meaning. Deep but detached thinker.",
    risk: "Anxiety, isolation, escapism.",
  },
  "정인": {
    english: "Learning",
    label: "Acceptance & Validation",
    meaning: "Academic, nurturing, logical, supportive energy.",
    psychology: "Feels secure when informed and prepared.",
    risk: "Complacency, overdependence on theory.",
  },
};

// Hardware Score 계산을 위한 십성 분류
export const DYNAMIC_GODS = ["식신", "상관", "편재", "정재", "편관"];
export const STATIC_GODS = ["비견", "겁재", "정관", "편인", "정인"];

// 오행 분류
export const DYNAMIC_ELEMENTS = ["wood", "fire"];
export const STATIC_ELEMENTS = ["metal", "water", "earth"];

// 오행 매핑 (한자 -> 영어)
export const ELEMENT_MAP: Record<string, string> = {
  "甲": "wood", "乙": "wood", "寅": "wood", "卯": "wood",
  "丙": "fire", "丁": "fire", "巳": "fire", "午": "fire",
  "戊": "earth", "己": "earth", "辰": "earth", "戌": "earth", "丑": "earth", "未": "earth",
  "庚": "metal", "辛": "metal", "申": "metal", "酉": "metal",
  "壬": "water", "癸": "water", "亥": "water", "子": "water"
};
