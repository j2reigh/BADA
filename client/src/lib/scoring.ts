/**
 * Strict scoring logic for the Operating Pattern Survey.
 * 
 * Logic Sources:
 * 
 * ThreatScore:
 * - Q1–Q3: A=1, B=0, C=0, D=0
 * - ThreatScore = score(Q1)+score(Q2)+score(Q3)
 * - ThreatClarity = 1 if ThreatScore >= 2 else 0
 * 
 * EnvironmentScore:
 * - Q4: A=0, B=1, C=0.5, D=0.5
 * - Q5: A=0, B=1, C=1, D=0.5
 * - EnvironmentScore = score(Q4)+score(Q5)
 * - EnvironmentStable = 0 (Unstable) if EnvironmentScore >= 1.5 else 1 (Stable)
 * 
 * AgencyScore:
 * - Q6–Q8: A=1, B=0, C=0, D=0
 * - AgencyScore = score(Q6)+score(Q7)+score(Q8)
 * - AgencyActive = 1 if AgencyScore >= 2 else 0
 */

type Answers = Record<string, string>;

export interface ScoringResult {
  threatScore: number;
  threatClarity: number;
  environmentScore: number;
  environmentStable: number;
  agencyScore: number;
  agencyActive: number;
  typeKey: string;
  typeName: string;
}

const TYPE_MAPPING: Record<string, string> = {
  "T1-E0-A1": "State Architect",
  "T1-E0-A0": "Silent Sentinel",
  "T1-E1-A1": "Master Builder",
  "T1-E1-A0": "Safe Strategist",
  "T0-E0-A1": "Fire Converter",
  "T0-E0-A0": "Emotional Drifter",
  "T0-E1-A1": "Conscious Maintainer",
  "T0-E1-A0": "Passive Floater",
};

export function calculateScore(answers: Answers): ScoringResult {
  // --- THREAT SCORING ---
  // Q1-Q3: A=1, others=0
  const t1 = answers['q1'] === 'A' ? 1 : 0;
  const t2 = answers['q2'] === 'A' ? 1 : 0;
  const t3 = answers['q3'] === 'A' ? 1 : 0;
  const threatScore = t1 + t2 + t3;
  const threatClarity = threatScore >= 2 ? 1 : 0;

  // --- ENVIRONMENT SCORING ---
  // Q4: A=0, B=1, C=0.5, D=0.5
  let e4 = 0;
  if (answers['q4'] === 'B') e4 = 1;
  else if (answers['q4'] === 'C' || answers['q4'] === 'D') e4 = 0.5;

  // Q5: A=0, B=1, C=1, D=0.5
  let e5 = 0;
  if (answers['q5'] === 'B' || answers['q5'] === 'C') e5 = 1;
  else if (answers['q5'] === 'D') e5 = 0.5;

  const environmentScore = e4 + e5;
  // Logic: Environment = 0 (Unstable) if EnvironmentScore >= 1.5 else 1 (Stable)
  const environmentStable = environmentScore >= 1.5 ? 0 : 1;

  // --- AGENCY SCORING ---
  // Q6-Q8: A=1, others=0
  const a6 = answers['q6'] === 'A' ? 1 : 0;
  const a7 = answers['q7'] === 'A' ? 1 : 0;
  const a8 = answers['q8'] === 'A' ? 1 : 0;
  const agencyScore = a6 + a7 + a8;
  const agencyActive = agencyScore >= 2 ? 1 : 0;

  // --- TYPE DETERMINATION ---
  const typeKey = `T${threatClarity}-E${environmentStable}-A${agencyActive}`;
  const typeName = TYPE_MAPPING[typeKey] || "Unknown Type";

  return {
    threatScore,
    threatClarity,
    environmentScore,
    environmentStable,
    agencyScore,
    agencyActive,
    typeKey,
    typeName,
  };
}

export const QUESTIONS = [
  {
    id: "q1",
    section: "Threat Response",
    text: "When things get intense or chaotic, what happens first?",
    options: [
      { value: "A", label: "I become more alert and focused" },
      { value: "B", label: "I feel overwhelmed or emotional" },
      { value: "C", label: "I try to escape the situation" },
      { value: "D", label: "It depends, but usually A or B" },
    ],
  },
  {
    id: "q2",
    section: "Threat Response",
    text: "In crisis situations, people often say I am:",
    options: [
      { value: "A", label: "Calm and clear-headed" },
      { value: "B", label: "Emotional but expressive" },
      { value: "C", label: "Quiet or frozen" },
      { value: "D", label: "Not sure" },
    ],
  },
  {
    id: "q3",
    section: "Threat Response",
    text: "I feel most “alive” when:",
    options: [
      { value: "A", label: "I’m pushed beyond my limits" },
      { value: "B", label: "Things feel safe and predictable" },
      { value: "C", label: "I’m emotionally connected" },
      { value: "D", label: "I don’t know" },
    ],
  },
  {
    id: "q4",
    section: "Environment",
    text: "Growing up, my environment felt:",
    options: [
      { value: "A", label: "Safe and predictable" },
      { value: "B", label: "Unstable or unclear" },
      { value: "C", label: "Mixed" },
      { value: "D", label: "I don’t remember clearly" },
    ],
  },
  {
    id: "q5",
    section: "Environment",
    text: "I feel most stressed when:",
    options: [
      { value: "A", label: "Nothing changes" },
      { value: "B", label: "I don’t know what’s coming" },
      { value: "C", label: "People don’t say what they really think" },
      { value: "D", label: "I feel watched or judged" },
    ],
  },
  {
    id: "q6",
    section: "Agency Orientation",
    text: "When something feels wrong in my life, I usually:",
    options: [
      { value: "A", label: "Try to redesign my situation" },
      { value: "B", label: "Adjust myself" },
      { value: "C", label: "Wait and see" },
      { value: "D", label: "Talk to others first" },
    ],
  },
  {
    id: "q7",
    section: "Agency Orientation",
    text: "I believe that my current state is:",
    options: [
      { value: "A", label: "Something I can actively shape" },
      { value: "B", label: "Mostly decided by circumstances" },
      { value: "C", label: "A mix of both" },
      { value: "D", label: "I’m not sure" },
    ],
  },
  {
    id: "q8",
    section: "Agency Orientation",
    text: "If nothing changed for the next year, I would feel:",
    options: [
      { value: "A", label: "Very uncomfortable" },
      { value: "B", label: "Mostly okay" },
      { value: "C", label: "Relieved" },
      { value: "D", label: "Confused" },
    ],
  },
];
